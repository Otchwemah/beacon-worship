// Beacon Worship: print a compact, screenshot-friendly digest of the Playwright regression results.
//
// Why this exists: the regression job is advisory and the full HTML report ships as a zip
// artifact that is awkward to share. This prints failing spec names and their first error
// lines straight into the job log and the GitHub job summary, so a single screenshot of the
// Summary page is enough to diagnose a failure.
//
// Usage: node scripts/testing/regressionDigest.js [path-to-results.json]

const fs = require("fs")
const path = require("path")

const resultsPath = process.argv[2] || path.join(__dirname, "..", "..", "test-output", "results.json")
const MAX_MESSAGE_LINES = 12
const MAX_LINE_LENGTH = 300

// Playwright embeds ANSI colour codes in error messages.
function stripAnsi(value) {
    return String(value == null ? "" : value).replace(/\u001b\[[0-9;]*[A-Za-z]/g, "")
}

function trimMessage(message) {
    const lines = stripAnsi(message)
        .split("\n")
        .map((line) => (line.length > MAX_LINE_LENGTH ? line.slice(0, MAX_LINE_LENGTH) + " ..." : line))
        .filter((line) => line.trim().length)

    const shown = lines.slice(0, MAX_MESSAGE_LINES)
    if (lines.length > MAX_MESSAGE_LINES) shown.push(`... (${lines.length - MAX_MESSAGE_LINES} more lines)`)
    return shown.join("\n")
}

// Walk the nested suite structure and collect every spec.
function collectSpecs(suites, trail, out) {
    for (const suite of suites || []) {
        const nextTrail = suite.title ? trail.concat(suite.title) : trail
        for (const spec of suite.specs || []) {
            out.push({ title: nextTrail.concat(spec.title).join(" > "), ok: spec.ok, tests: spec.tests || [] })
        }
        collectSpecs(suite.suites, nextTrail, out)
    }
    return out
}

function firstError(spec) {
    for (const test of spec.tests) {
        for (const result of test.results || []) {
            const message = (result.error && result.error.message) || (result.errors && result.errors[0] && result.errors[0].message)
            if (message) return trimMessage(message)
        }
    }
    return "(no error message recorded)"
}

function main() {
    if (!fs.existsSync(resultsPath)) {
        console.log(`No Playwright JSON results at ${resultsPath}.`)
        console.log("The run probably failed before any spec executed (install or build step).")
        return
    }

    let report
    try {
        report = JSON.parse(fs.readFileSync(resultsPath, "utf8"))
    } catch (err) {
        console.log(`Could not parse ${resultsPath}: ${err.message}`)
        return
    }

    const specs = collectSpecs(report.suites, [], [])
    const failed = specs.filter((spec) => !spec.ok)
    const stats = report.stats || {}

    const lines = []
    lines.push(`Regression digest: ${specs.length} specs, ${failed.length} failed`)
    if (stats.expected != null) lines.push(`stats: expected=${stats.expected} unexpected=${stats.unexpected} skipped=${stats.skipped} flaky=${stats.flaky}`)
    lines.push("")

    if (!failed.length) {
        lines.push("All regression specs passed.")
    } else {
        for (const spec of failed) {
            lines.push(`FAILED: ${spec.title}`)
            lines.push(trimMessage(firstError(spec)))
            lines.push("")
        }
    }

    const digest = lines.join("\n")

    // plain text to the job log
    console.log(digest)

    // GitHub error ANNOTATIONS, one per failing spec.
    //
    // The job log and the artifacts both require admin/download rights, which makes a red
    // run undiagnosable for anyone without them. Annotations are exposed on the public
    // check-run API for public repos, so emitting them means the failing spec name and its
    // first error line can be read straight from the run page (and by tooling) with no
    // authentication at all.
    if (process.env.GITHUB_ACTIONS) {
        const escapeData = (value) => String(value).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")
        const escapeProp = (value) => escapeData(value).replace(/:/g, "%3A").replace(/,/g, "%2C")

        for (const spec of failed) {
            // first line only: annotations are single-line summaries, the full text is above
            const detail = trimMessage(firstError(spec)).split("\n").slice(0, 3).join(" | ")
            console.log(`::error title=Regression failed: ${escapeProp(spec.title)}::${escapeData(detail)}`)
        }
        if (!failed.length) console.log(`::notice title=Regression passed::${escapeData(`${specs.length} specs, 0 failed`)}`)
    }

    // markdown to the GitHub job summary, when running on Actions
    if (process.env.GITHUB_STEP_SUMMARY) {
        const markdown = ["```text", digest, "```", ""].join("\n")
        try {
            fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown)
        } catch (err) {
            console.log(`Could not write step summary: ${err.message}`)
        }
    }
}

main()
