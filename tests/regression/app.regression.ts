import { expect, test, _electron as electron } from "@playwright/test"
import type { ElectronApplication, Page } from "@playwright/test"
import path from "path"

// Beacon Worship repeatable regression checks.
//
// Covers the five areas the customization prompt calls for:
//   1. dropdowns          2. keyboard controls      3. live / audience outputs
//   4. Bible navigation   5. hymn selection
//
// Requires a production build first (`npm run build`) because package.json "main" points at
// build/electron/index.js. Run with `npm run test:regression`.
//
// Selectors intentionally use ids/classes the app already renders rather than new test-only
// hooks: drawer tabs render id={tab.id} (MaterialButton -> <button id>), the drawer search is
// .drawer_search, dropdowns are .dropdownElem / [role="option"], and the audience output toggle
// is #output_window_button.

const appRoot = path.resolve(__dirname, "..", "..")

let app: ElectronApplication
let window: Page

// The app can show a loading/splash window first, so wait for the real control window
// instead of blindly taking firstWindow(). Accept either the drawer tab bar or the
// branded title, because the drawer itself can be collapsed.
async function waitForMainWindow(application: ElectronApplication, timeoutMs = 90_000): Promise<Page> {
    const deadline = Date.now() + timeoutMs
    const seen: string[] = []

    while (Date.now() < deadline) {
        for (const candidate of application.windows()) {
            try {
                if (await candidate.locator("span.tabs").count()) return candidate
                if (await candidate.locator("#hymns").count()) return candidate

                const title = await candidate.title()
                const url = candidate.url()
                seen.push(`${title || "(untitled)"} :: ${url}`)
                if (/beacon worship/i.test(title) && (await candidate.locator("body").count())) return candidate
            } catch {
                // window may still be navigating; keep polling
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Dump what actually rendered so a CI failure is diagnosable from the log alone.
    const diagnostics: string[] = [`No control window after ${timeoutMs}ms. Windows seen: ${seen.length ? [...new Set(seen)].join(" | ") : "(none)"}`]
    for (const candidate of application.windows()) {
        try {
            const body = (await candidate.locator("body").innerText().catch(() => "")) || ""
            diagnostics.push(`--- ${candidate.url()} ---\n${body.slice(0, 1500)}`)
            await candidate.screenshot({ path: `test-output/artifacts/startup-${diagnostics.length}.png` }).catch(() => {})
        } catch {
            // ignore windows that closed while diagnosing
        }
    }

    throw new Error(`${diagnostics.join("\n")}\n\nIs the app built? Run \`npm run build\` first.`)
}

// Make sure the drawer is expanded before interacting with its tabs.
async function ensureDrawerOpen(page: Page) {
    if (await page.locator("span.tabs").count()) return
    // Ctrl+D toggles the drawer in FreeShow; fall back to clicking the drawer tab strip.
    await page.keyboard.press("Control+d")
    await page.locator("span.tabs").first().waitFor({ state: "attached", timeout: 15_000 })
}

test.beforeAll(async () => {
    app = await electron.launch({
        args: [appRoot],
        cwd: appRoot,
        env: { ...process.env, NODE_ENV: "production" },
        timeout: 120_000
    })

    window = await waitForMainWindow(app)
    await window.waitForLoadState("domcontentloaded")
    await ensureDrawerOpen(window)
})

test.afterAll(async () => {
    await app?.close()
})

test.describe("branding & startup", () => {
    test("main window opens with Beacon Worship branding", async () => {
        await expect(window.locator("span.tabs")).toBeVisible()
        expect(await window.title()).toContain("Beacon Worship")
    })
})

test.describe("hymn selection", () => {
    test("Hymns is a standalone drawer tab and activates", async () => {
        const hymnsTab = window.locator("#hymns")
        await expect(hymnsTab).toBeVisible()

        await hymnsTab.click()
        await expect(hymnsTab).toHaveClass(/isActive/)
    })

    test("Hymns tab uses the hymn-specific search placeholder", async () => {
        await window.locator("#hymns").click()

        // search is collapsed until activated (Ctrl+F or the search button)
        await window.keyboard.press("Control+f")

        const search = window.locator("input.drawer_search")
        await expect(search).toBeVisible()
        await expect(search).toHaveAttribute("placeholder", /hymn/i)
    })

    test("typing a hymn number keeps the query in the drawer search", async () => {
        await window.locator("#hymns").click()
        await window.keyboard.press("Control+f")

        const search = window.locator("input.drawer_search")
        await search.fill("108")
        await expect(search).toHaveValue("108")

        await search.fill("")
    })
})

test.describe("keyboard controls", () => {
    test("Ctrl+F focuses the drawer search", async () => {
        await window.locator("#hymns").click()
        await window.keyboard.press("Control+f")

        const search = window.locator("input.drawer_search")
        await expect(search).toBeFocused()
    })

    test("Ctrl+<n> switches drawer tabs", async () => {
        await ensureDrawerOpen(window)

        // Derive each tab's shortcut from the rendered order rather than hardcoding it:
        // values/tabs.ts orders them shows, media, audio, overlays, templates, scripture,
        // calendar, functions, hymns - so scripture is Ctrl+6, NOT Ctrl+2. Disabled or
        // hidden tabs would also shift the indices.
        const rendered: string[] = await window.locator("span.tabs > button").evaluateAll((elements) => elements.map((element) => (element as HTMLElement).id))
        expect(rendered.length, "drawer tab buttons should be rendered").toBeGreaterThan(0)

        for (const id of ["shows", "scripture", "hymns"]) {
            const index = rendered.indexOf(id)
            expect(index, `tab '${id}' should be present in the tab bar`).toBeGreaterThanOrEqual(0)

            await window.keyboard.press(`Control+${index + 1}`)
            await expect(window.locator(`#${id}`)).toHaveClass(/isActive/)
        }
    })
})

test.describe("Bible navigation", () => {
    test("Scripture tab opens and exposes a version dropdown", async () => {
        await window.locator("#scripture").click()
        await expect(window.locator("#scripture")).toHaveClass(/isActive/)

        // the scripture drawer renders at least one dropdown (version / book selection)
        await expect(window.locator(".dropdownElem").first()).toBeVisible()
    })
})

test.describe("dropdowns", () => {
    test("a dropdown opens, lists options and closes after choosing one", async () => {
        await window.locator("#scripture").click()

        const dropdown = window.locator(".dropdownElem").first()
        await expect(dropdown).toBeVisible()
        await dropdown.click()

        const options = window.locator('[role="option"]')
        await expect(options.first()).toBeVisible()

        await options.first().click()
        await expect(options).toHaveCount(0)
    })
})

test.describe("live / audience outputs", () => {
    test("audience output toggle is present and reports a state", async () => {
        const toggle = window.locator("#output_window_button")
        await expect(toggle).toBeVisible()

        // The button carries `on`/`off` depending on whether an output window is open.
        // With no physical display attached on CI it may be disabled, so assert the state
        // is exposed rather than forcing an output window open.
        const className = (await toggle.getAttribute("class")) || ""
        expect(className).toMatch(/\b(on|off)\b/)
    })

    test("toggling the audience output does not change the control window", async () => {
        const toggle = window.locator("#output_window_button")
        const disabled = await toggle.isDisabled()

        test.skip(disabled, "No physical output available on this runner")

        const before = (await toggle.getAttribute("class")) || ""
        await toggle.click()

        // control window must survive the output toggle
        await expect(window.locator("#hymns")).toBeVisible()

        // restore the previous state so later runs start clean
        const after = (await toggle.getAttribute("class")) || ""
        if (/\bon\b/.test(after) !== /\bon\b/.test(before)) await toggle.click()
    })
})
