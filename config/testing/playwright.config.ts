import { defineConfig } from "@playwright/test"

// Beacon Worship: repeatable release regression checks (prompt requirement).
//
// IMPORTANT: the previous config used testDir "." with testMatch "**/*.test.ts", which also
// matched the vitest unit suites under src/. Playwright would try to run those as Electron
// specs and fail. Regression specs now live in their own directory with their own extension
// so the two runners can never pick up each other's files.
//
// Paths are resolved relative to this config file (config/testing/).
export default defineConfig({
    testDir: "../../tests/regression",
    testMatch: "**/*.regression.ts",
    outputDir: "../../test-output/artifacts",

    // Electron startup is slow, especially on CI.
    timeout: 120_000,
    expect: { timeout: 15_000 },

    // Run a single Electron instance to avoid port/store conflicts.
    fullyParallel: false,
    workers: 1,

    // Retry only on CI to reduce transient failures.
    retries: process.env.CI ? 2 : 0,

    // list always; on CI also emit JSON (consumed by scripts/testing/regressionDigest.js to
    // print a plain-text failure digest into the job summary) and an HTML report artifact.
    reporter: process.env.CI
        ? [["list"], ["json", { outputFile: "../../test-output/results.json" }], ["html", { outputFolder: "../../test-output/playwright-report", open: "never" }]]
        : [["list"]],

    use: {
        // Collect diagnostics for CI failures.
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure"
    }
})
