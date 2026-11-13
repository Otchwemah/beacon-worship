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
// Selector notes (learned from the first real CI runs):
//  - There are TWO windows at startup: a loading window (public/loading.html, titled
//    "Beacon Worship - Loading") and the control window (public/index.html). Matching on the
//    title alone picks the loading window, which then closes -> "Target page ... has been
//    closed". Always skip loading.html and require the drawer tab strip.
//  - `span.tabs` matches more than one element (the drawer strip and a strip in the top bar),
//    so it must be scoped with :has(#hymns) to avoid Playwright strict-mode violations.
//  - checkForUpdates() opens a "new_update" popup on a fresh profile, and its overlay
//    intercepts every click. Popups are dismissed before each test.

const appRoot = path.resolve(__dirname, "..", "..")

// the drawer's tab strip specifically, not the similarly-classed strip in the top bar
const DRAWER_TABS = "span.tabs:has(#hymns)"
// both dropdown implementations: Dropdown.svelte (.dropdownElem) and
// MaterialDropdown.svelte (.textfield containing .dropdown-trigger)
const ANY_DROPDOWN = '.dropdownElem, .textfield:has(.dropdown-trigger)'

let app: ElectronApplication
let window: Page

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForMainWindow(application: ElectronApplication, timeoutMs = 90_000): Promise<Page> {
    const deadline = Date.now() + timeoutMs
    const seen = new Set<string>()

    while (Date.now() < deadline) {
        for (const candidate of application.windows()) {
            try {
                const url = candidate.url()
                // the loading window is a separate BrowserWindow that closes once ready
                if (/loading\.html/i.test(url)) continue

                if (await candidate.locator(DRAWER_TABS).count()) return candidate
                seen.add(`${(await candidate.title()) || "(untitled)"} :: ${url}`)
            } catch {
                // window may still be navigating or already closed; keep polling
            }
        }
        await sleep(500)
    }

    const diagnostics: string[] = [`No control window after ${timeoutMs}ms. Non-matching windows: ${[...seen].join(" | ") || "(none)"}`]
    for (const candidate of application.windows()) {
        try {
            const body = (await candidate.locator("body").innerText().catch(() => "")) || ""
            diagnostics.push(`--- ${candidate.url()} ---\n${body.slice(0, 1200)}`)
        } catch {
            // ignore windows that closed while diagnosing
        }
    }

    throw new Error(`${diagnostics.join("\n")}\n\nIs the app built? Run \`npm run build\` first.`)
}

// Dismiss whatever modal is on top (update prompt, alert, ...). Escape is the app's own
// close shortcut; the explicit close button is used first because some popups ignore Escape.
async function dismissPopups(page: Page) {
    for (let attempt = 0; attempt < 6; attempt++) {
        const popup = page.locator("div.popup")
        if (!(await popup.count())) return

        const close = page.locator("div.popup button.popup-close")
        if (await close.count()) {
            await close.first().click({ timeout: 5_000 }).catch(() => {})
        } else {
            await page.keyboard.press("Escape").catch(() => {})
        }

        await sleep(300)
    }
}

async function ensureDrawerOpen(page: Page) {
    if (await page.locator(DRAWER_TABS).count()) return
    await page.keyboard.press("Control+d")
    await page.locator(DRAWER_TABS).waitFor({ state: "attached", timeout: 15_000 })
}

// A popup can still appear between dismissal and the click, so retry the click while
// clearing overlays instead of letting a 30s timeout fail the spec.
async function clickStable(page: Page, selector: string, attempts = 4) {
    const locator = page.locator(selector)

    for (let attempt = 0; attempt < attempts; attempt++) {
        try {
            await locator.click({ timeout: 5_000 })
            return
        } catch (err) {
            await dismissPopups(page)
            if (attempt === attempts - 1) throw err
        }
    }
}

async function openTab(page: Page, id: string) {
    await dismissPopups(page)
    await ensureDrawerOpen(page)
    await clickStable(page, `#${id}`)
    await expect(page.locator(`#${id}`)).toHaveClass(/isActive/)
}

test.beforeAll(async () => {
    app = await electron.launch({
        args: [appRoot],
        cwd: appRoot,
        env: { ...process.env, NODE_ENV: "production" },
        timeout: 120_000
    })

    // Neutralise the upstream update check for the whole context, before any renderer can
    // fetch. utils/updateSettings.ts fires checkForUpdates() on a 50ms timer, which opens the
    // "new_update" popup whose overlay intercepts clicks. Dismissing it per-test is a race;
    // returning an empty release list means hasUpdate is false and the popup never opens.
    await app.context().route("**/api.github.com/repos/ChurchApps/freeshow/releases**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }))

    window = await waitForMainWindow(app)
    await window.waitForLoadState("domcontentloaded")
    await dismissPopups(window)
    await ensureDrawerOpen(window)
})

// The update check resolves asynchronously, so a popup can appear between tests.
test.beforeEach(async () => {
    await dismissPopups(window)
})

test.afterAll(async () => {
    await app?.close()
})

test.describe("branding & startup", () => {
    test("main window opens with Beacon Worship branding", async () => {
        await expect(window.locator(DRAWER_TABS)).toBeVisible()

        const title = await window.title()
        expect(title).toContain("Beacon Worship")
        expect(title).not.toMatch(/loading/i)
    })
})

test.describe("hymn selection", () => {
    test("Hymns is a standalone drawer tab and activates", async () => {
        await expect(window.locator("#hymns")).toBeVisible()
        await openTab(window, "hymns")
    })

    test("Hymns tab uses the hymn-specific search placeholder", async () => {
        await openTab(window, "hymns")
        await window.keyboard.press("Control+f")

        const search = window.locator("input.drawer_search")
        await expect(search).toBeVisible()
        await expect(search).toHaveAttribute("placeholder", /hymn/i)
    })

    test("typing a hymn number keeps the query in the drawer search", async () => {
        await openTab(window, "hymns")
        await window.keyboard.press("Control+f")

        const search = window.locator("input.drawer_search")
        await search.fill("108")
        await expect(search).toHaveValue("108")

        await search.fill("")
    })
})

test.describe("keyboard controls", () => {
    test("Ctrl+F focuses the drawer search", async () => {
        await openTab(window, "hymns")
        await window.keyboard.press("Control+f")

        await expect(window.locator("input.drawer_search")).toBeFocused()
    })

    test("drawer tab order matches the Beacon Worship workflow", async () => {
        await dismissPopups(window)
        await ensureDrawerOpen(window)

        const rendered: string[] = await window.locator(`${DRAWER_TABS} > button`).evaluateAll((elements) => elements.map((element) => (element as HTMLElement).id))

        // Profiles / focus mode can hide tabs, so only assert the relative order of the
        // ones that are actually rendered, and require the full set in the default profile.
        const expected = ["shows", "media", "hymns", "scripture", "audio", "overlays", "templates", "calendar", "functions"]
        expect(rendered, "drawer tab order").toEqual(expected.filter((id) => rendered.includes(id)))
        expect(rendered.length, "all nine drawer tabs should render").toBe(expected.length)
    })

    test("Ctrl+<n> switches drawer tabs", async () => {
        await dismissPopups(window)
        await ensureDrawerOpen(window)

        // Derive each shortcut from the rendered order instead of hardcoding it, so this
        // keeps passing if the tab order is re-tuned. The order itself is asserted by the
        // "drawer tab order" test below. Beacon Worship order:
        // shows, media, hymns, scripture, audio, overlays, templates, calendar, functions.
        const rendered: string[] = await window.locator(`${DRAWER_TABS} > button`).evaluateAll((elements) => elements.map((element) => (element as HTMLElement).id))
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
    test("Scripture tab opens and lists Bible books", async () => {
        await openTab(window, "scripture")

        // Scripture.svelte renders .main.scripture with a .books list for navigation
        await expect(window.locator(".main.scripture")).toBeVisible()
        await expect(window.locator(".main.scripture .books")).toBeVisible()
    })
})

test.describe("dropdowns", () => {
    test("a dropdown opens, lists options and closes after choosing one", async () => {
        await openTab(window, "scripture")

        const dropdowns = window.locator(ANY_DROPDOWN)
        const count = await dropdowns.count()
        test.skip(count === 0, "No dropdown rendered in this drawer on a fresh profile")

        await dismissPopups(window)
        await dropdowns.first().click({ timeout: 10_000 })

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

        // carries `on`/`off` depending on whether an output window is open
        const className = (await toggle.getAttribute("class")) || ""
        expect(className).toMatch(/\b(on|off)\b/)
    })

    test("toggling the audience output does not change the control window", async () => {
        const toggle = window.locator("#output_window_button")
        test.skip(await toggle.isDisabled(), "No physical output available on this runner")

        const before = (await toggle.getAttribute("class")) || ""
        await clickStable(window, "#output_window_button")

        // the control window must survive the output toggle
        await expect(window.locator(DRAWER_TABS)).toBeVisible()

        // restore the previous state so later runs start clean
        const after = (await toggle.getAttribute("class")) || ""
        if (/\bon\b/.test(after) !== /\bon\b/.test(before)) await toggle.click()
    })
})
