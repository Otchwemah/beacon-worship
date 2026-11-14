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
//  - checkForUpdates() used to open a "new_update" popup on a fresh profile (it compared
//    our 1.6.6 against ChurchApps/freeshow). It now checks Otchwemah/beacon-worship with
//    a real newer-than comparison, so an empty release list means the popup never opens.
//    The route below still stubs the GitHub API, and popups are dismissed before each test.

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

    // Neutralise the update check for the whole context, before any renderer can fetch.
    // utils/updateSettings.ts fires checkForUpdates() on a 50ms timer. Returning an empty
    // release list means hasUpdate is false and the popup never opens. The glob covers both
    // the Beacon Worship feed and the old ChurchApps URL in case a stale build is under test.
    await app.context().route("**/api.github.com/repos/**/releases**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }))

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

    test("no FreeShow wordmark remains in the visible chrome", async () => {
        // The window title was rebranded earlier, but Top.svelte and ProfileSelector.svelte
        // each had their own hardcoded <h1>FreeShow</h1>.
        const brand = window.locator("h1.brand")
        await expect(brand).toBeVisible()
        await expect(brand).toHaveText("Beacon Worship")

        // Scoped to the app chrome rather than the whole body: user slide/overlay content
        // could legitimately contain the word, and that must not fail the gate.
        const chromeText = await window.locator("div.top").first().innerText()
        expect(chromeText, "the top bar should not say FreeShow").not.toContain("FreeShow")
    })

    test("drawer tabs render emoji icons", async () => {
        await ensureDrawerOpen(window)
        const emojis = window.locator(`${DRAWER_TABS} .emoji-icon`)
        // ten tabs, each with one emoji glyph
        await expect(emojis).toHaveCount(10)
        await expect(emojis.first()).not.toHaveText("")
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

    test("hymn search sits above the hymn list, not in the left navigation", async () => {
        await openTab(window, "hymns")

        const toolbarSearch = window.locator("input.hymn-search-input")
        await expect(toolbarSearch).toBeVisible()
        await expect(toolbarSearch).toHaveAttribute("placeholder", /hymn/i)

        // the toolbar must be horizontally over the results, and vertically above them.
        // Grid is the default view now, so measure against the panel body rather than the
        // list-only .column element.
        const panel = window.locator(".hymns-panel")
        await expect(panel).toBeVisible()

        const searchBox = (await toolbarSearch.boundingBox())!
        const panelBox = (await panel.boundingBox())!
        expect(searchBox.y, "search should be at the top of the panel").toBeLessThan(panelBox.y + 60)
        expect(searchBox.x, "search should start at the results, not in the nav column").toBeGreaterThanOrEqual(panelBox.x - 2)

        // the old navigation search box is gone
        await expect(window.locator(".hymn-search")).toHaveCount(0)
    })

    test("hymn search mirrors into the drawer search", async () => {
        await openTab(window, "hymns")

        const toolbarSearch = window.locator("input.hymn-search-input")
        await toolbarSearch.fill("108")
        await expect(window.locator("input.drawer_search")).toHaveValue("108")

        await toolbarSearch.fill("")
        await expect(window.locator("input.drawer_search")).toHaveValue("")
    })

    test("Load folder lives in the left navigation panel, like the Media tab", async () => {
        await openTab(window, "hymns")

        // the button is in the navigation column, NOT in the content toolbar
        const nav = window.locator(".navigation, .categories").first()
        await expect(nav).toBeVisible()

        // MaterialButton renders its tooltip as data-title, NOT title. The old
        // button[title*=folder] selector never matched, which failed this spec on both
        // platforms in Validation #15/#17/#20.
        const loadFolder = window.locator('button[data-title*="folder" i]').first()
        await expect(loadFolder).toBeVisible()

        // it must sit to the LEFT of the grid it populates
        const grid = window.locator(".hymns-panel")
        await expect(grid).toBeVisible()
        const btnBox = (await loadFolder.boundingBox())!
        const gridBox = (await grid.boundingBox())!
        expect(btnBox.x, "Load folder should be in the left panel").toBeLessThan(gridBox.x)

        // deliberately not clicked: it opens a native OS folder dialog that Playwright
        // cannot drive, which would hang the suite.
    })

    test("Hymns defaults to grid view with adjustable size", async () => {
        await openTab(window, "hymns")

        const grid = window.locator(".hymn-grid")
        // grid container exists even when the library is empty on a fresh CI profile
        await expect(window.locator(".hymns-panel")).toBeVisible()

        const listBtn = window.locator('button.view-btn[title*="List" i]')
        const gridBtn = window.locator('button.view-btn[title*="Grid" i]')
        await expect(gridBtn).toBeVisible()
        await expect(listBtn).toBeVisible()

        // grid is the default
        await expect(gridBtn).toHaveClass(/on/)

        // switching to list and back must not lose the panel
        await listBtn.click()
        await expect(window.locator(".hymns-panel .column")).toBeVisible()
        await gridBtn.click()
        await expect(gridBtn).toHaveClass(/on/)

        if (await grid.count()) await expect(grid).toBeVisible()
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
        const expected = ["shows", "media", "hymns", "scripture", "sermon", "audio", "overlays", "templates", "calendar", "functions"]
        expect(rendered, "drawer tab order").toEqual(expected.filter((id) => rendered.includes(id)))
        expect(rendered.length, "all ten drawer tabs should render").toBe(expected.length)
    })

    test("Ctrl+<n> switches drawer tabs", async () => {
        await dismissPopups(window)
        await ensureDrawerOpen(window)

        // Derive each shortcut from the rendered order instead of hardcoding it, so this
        // keeps passing if the tab order is re-tuned. The order itself is asserted by the
        // "drawer tab order" test below. Beacon Worship order:
        // shows, media, hymns, scripture, sermon, audio, overlays, templates, calendar, functions.
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

test.describe("sermon console", () => {
    test("Sermon is a standalone drawer tab with the Pewbeam-style dashboard", async () => {
        await expect(window.locator("#sermon")).toBeVisible()
        await openTab(window, "sermon")
        await expect(window.locator("[data-sermon-dash]")).toBeVisible()
        await expect(window.locator("[data-sermon-dash]")).toContainText(/Start transcribing|Stop listening/)
        await expect(window.locator("[data-sermon-dash]")).toContainText(/AI detections/i)
        await expect(window.locator("[data-sermon-dash]")).toContainText(/Preview/i)
        await expect(window.locator("[data-sermon-dash]")).toContainText(/Live output/i)
        await expect(window.locator("[data-sermon-dash]")).toContainText(/Queue/i)
    })
})

test.describe("Bible navigation", () => {
    test("Scripture tab opens and lists Bible books", async () => {
        await openTab(window, "scripture")

        // Scripture.svelte renders .main.scripture with a .books list for navigation
        await expect(window.locator(".main.scripture")).toBeVisible()
        await expect(window.locator(".main.scripture .books")).toBeVisible()
    })

    test("Scripture shows reference and phrase search side by side", async () => {
        await openTab(window, "scripture")

        const reference = window.locator("input.scripture-reference-search")
        const phrase = window.locator("input.scripture-phrase-search")
        await expect(reference).toBeVisible()
        await expect(phrase).toBeVisible()

        await expect(reference).toHaveAttribute("placeholder", /book|chapter|verse/i)
        await expect(phrase).toHaveAttribute("placeholder", /phrase/i)

        // side by side: same row, reference on the left
        const refBox = (await reference.boundingBox())!
        const phraseBox = (await phrase.boundingBox())!
        expect(refBox.x, "reference search should be left of phrase search").toBeLessThan(phraseBox.x)
        expect(Math.abs(refBox.y - phraseBox.y), "both searches should share one row").toBeLessThan(6)

        // both sit above the scripture content
        const content = (await window.locator(".main.scripture").boundingBox())!
        expect(refBox.y + refBox.height).toBeLessThanOrEqual(content.y + 2)
    })

    test("Scripture reference search mirrors the drawer search", async () => {
        await openTab(window, "scripture")

        const reference = window.locator("input.scripture-reference-search")
        await reference.fill("John 3")

        await expect(window.locator("input.drawer_search")).toHaveValue("John 3")

        await reference.fill("")
    })

    test("Scripture phrase search accepts text and can be cleared", async () => {
        await openTab(window, "scripture")

        const phrase = window.locator("input.scripture-phrase-search")
        test.skip(await phrase.isDisabled(), "Phrase search unavailable for the default CI Bible")

        await phrase.fill("in the beginning")
        await expect(phrase).toHaveValue("in the beginning")

        // clearing via the inline clear button empties the field
        const bar = window.locator("div.bar:has(input.scripture-phrase-search)")
        await bar.locator("button.clear").click()
        await expect(phrase).toHaveValue("")
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

test.describe("live override policy", () => {
    test("Settings exposes the live-override toggle, on by default", async () => {
        await dismissPopups(window)
        await clickStable(window, "#settings")

        // General is the first settings tab and the default one. The checkbox itself is
        // visually hidden, so assert on the role="switch" wrapper's aria-checked.
        const toggle = window.locator('div.togglefield:has(#liveOverride)')
        await expect(toggle).toBeVisible()
        await expect(toggle).toHaveAttribute("aria-checked", "true")
        await expect(window.locator("#liveOverride")).toBeChecked()

        // back to the Show page so later specs start from a known place
        await clickStable(window, "#show")
    })

    test("clearing all still works and leaves the control window intact", async () => {
        await dismissPopups(window)

        // Escape is the global clear. With the override policy in place the clear helpers
        // are shared, so this guards against the refactor breaking the manual clear path.
        await window.locator("body").click({ position: { x: 5, y: 5 } })
        await window.keyboard.press("Escape")

        await expect(window.locator(DRAWER_TABS)).toBeVisible()
    })
})

test.describe("hymn thumbnails come from the first slide", () => {
    test("a hymn tile renders a slide canvas rather than an empty white box", async () => {
        await openTab(window, "hymns")

        const cards = window.locator(".hymn-card")
        test.skip((await cards.count()) === 0, "No hymns imported on this runner")

        const first = cards.first()
        await expect(first).toBeVisible()

        // the thumbnail area must exist and must not be zero-height
        const thumb = first.locator(".thumb").first()
        await expect(thumb).toBeVisible()
        const box = await thumb.boundingBox()
        expect(box).not.toBeNull()
        expect(box!.height).toBeGreaterThan(10)
        expect(box!.width).toBeGreaterThan(10)

        // either a scaled first-slide canvas, or a stored image, or the book fallback icon —
        // but never nothing at all
        const hasCanvas = await thumb.locator(".slide-preview").count()
        const hasImage = await thumb.locator("img").count()
        const hasFallback = await thumb.locator("svg").count()
        expect(hasCanvas + hasImage + hasFallback).toBeGreaterThan(0)
    })
})

test.describe("square corners", () => {
    test("control-interface chrome keeps its rounded corners", async () => {
        await openTab(window, "hymns")

        // Liquid Glass gives the drawer 12px on its top corners. The earlier blanket
        // squaring was walked back: chrome must stay rounded, media files only are square.
        const drawer = window.locator(".drawer").first()
        await expect(drawer).toBeVisible()

        const radii = await drawer.evaluate((node) => {
            const cs = getComputedStyle(node)
            return [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius]
        })
        expect(parseFloat(radii[0]), `drawer top-left should be rounded, got ${radii.join(", ")}`).toBeGreaterThan(0)
        expect(parseFloat(radii[1]), `drawer top-right should be rounded, got ${radii.join(", ")}`).toBeGreaterThan(0)
    })

    test("media files have square corners", async () => {
        await openTab(window, "media")

        const media = window.locator(".grid .card img, .grid .card video, img.thumbnail, video.thumbnail").first()
        test.skip((await media.count()) === 0, "No media files on this runner")

        const radius = await media.evaluate((node) => getComputedStyle(node).borderTopLeftRadius)
        expect(parseFloat(radius)).toBe(0)
    })

    test("the loading spinner stays circular", async () => {
        await dismissPopups(window)

        // Card.svelte wraps <Loader /> in a positioning div that is ALSO class="loader"
        // and has no radius. The ring itself is Loader.svelte's .loader (animation: spin,
        // border-radius: 50%). Measuring .loader.first() hits the wrapper and used to
        // pass only because the blanket 50% exemption painted that wrapper round.
        const radius = await window.evaluate(() => {
            const nodes = Array.from(document.querySelectorAll(".loader"))
            const ring = nodes.find((node) => {
                const name = getComputedStyle(node).animationName || ""
                return name !== "none" && name.length > 0
            })
            if (!ring) return null
            return parseFloat(getComputedStyle(ring).borderTopLeftRadius)
        })
        test.skip(radius === null, "No spinner on screen right now")
        expect(radius).toBeGreaterThan(0)
    })
})

test.describe("media click zones", () => {
    test("the Media tab explains the edge/centre click behaviour", async () => {
        await openTab(window, "media")

        // the hint only shows in a provider section that has the zoom control
        const hint = window.locator(".click-zones-hint")
        test.skip((await hint.count()) === 0, "No media provider section active on this runner")

        await expect(hint.first()).toContainText(/edge/i)
        await expect(hint.first()).toContainText(/middle/i)
    })

    test("clicking the surround of a media tile does not change the live output", async () => {
        await openTab(window, "media")

        const card = window.locator(".card").first()
        test.skip((await card.count()) === 0, "No media files on this runner")

        const box = await card.boundingBox()
        test.skip(!box, "Media tile is not measurable")

        const clearButton = window.locator("#output_window_button")
        const before = (await clearButton.getAttribute("class")) || ""

        // 3px in from the left edge = the preview-only surround
        await card.click({ position: { x: 3, y: Math.round(box!.height / 2) } })

        // the control window survives and the output toggle state is unchanged
        await expect(window.locator(DRAWER_TABS)).toBeVisible()
        expect(((await clearButton.getAttribute("class")) || "")).toBe(before)
    })
})
