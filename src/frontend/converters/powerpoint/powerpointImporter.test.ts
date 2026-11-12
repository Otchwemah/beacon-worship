import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Regression guard for the Beacon Worship hymn-import UX: converting a PowerPoint must
// not raise the blocking "Importing..." alert. Heavy collaborators are stubbed so the
// test exercises convertPowerpoint's own UI side effects and conversion hand-off.
const h = vi.hoisted(() => {
    const makeStore = (initial: any) => {
        let value = initial
        const setCalls: any[] = []
        return {
            subscribe: (fn: (v: any) => void) => {
                fn(value)
                return () => {}
            },
            set: (v: any) => {
                value = v
                setCalls.push(v)
            },
            setCalls,
            _reset: (v: any) => {
                value = v
                setCalls.length = 0
            }
        }
    }
    return {
        activePopup: makeStore(null),
        alertMessage: makeStore(""),
        drawerTabsData: makeStore({ shows: { activeSubTab: "all" } }),
        special: makeStore({}),
        tempShows: [] as any[],
        createCategoryCalls: [] as any[],
        uidCounter: 0
    }
})

vi.mock("../../stores", () => ({ activePopup: h.activePopup, alertMessage: h.alertMessage, drawerTabsData: h.drawerTabsData, special: h.special }))
vi.mock("uid", () => ({ uid: () => `id-${++h.uidCounter}` }))
vi.mock("../../classes/Show", () => ({
    ShowObj: class {
        name = ""
        origin?: string
        category: any
        settings: any
        timestamps: any
        meta: any = {}
        slides: any = {}
        layouts: any = {}
        constructor(_isPrivate = false, category = null, layoutId = "layout", created = 0, _template: any = true) {
            this.category = category
            this.settings = { activeLayout: layoutId }
            this.timestamps = { created, modified: null, used: null }
        }
    }
}))
vi.mock("../../components/helpers/show", () => ({ checkName: (name: string) => name }))
vi.mock("../importHelpers", () => ({
    createCategory: (...args: any[]) => {
        h.createCategoryCalls.push(args)
        return "presentation"
    },
    setTempShows: (shows: any[]) => {
        h.tempShows = shows
    }
}))
vi.mock("../../utils/language", () => ({ translateText: (key: string) => key }))
vi.mock("./PowerPointHelper", () => ({
    PowerPointPackage: class {
        content: any
        constructor(content: any) {
            this.content = content
        }
        getPresentation() {
            return this.content?.presentation ?? null
        }
        getSlides() {
            return this.content?.slides ?? []
        }
    }
}))

import { convertPowerpoint } from "./powerpointImporter"

function deck(name = "PHB 108.pptx") {
    return {
        name,
        content: {
            presentation: {},
            slides: [
                { bgColor: "", notes: "", items: [] },
                { bgColor: "", notes: "", items: [] }
            ],
            contentPaths: {}
        }
    }
}

beforeEach(() => {
    vi.useFakeTimers()
    h.activePopup._reset(null)
    h.alertMessage._reset("")
    h.drawerTabsData._reset({ shows: { activeSubTab: "all" } })
    h.special._reset({})
    h.tempShows = []
    h.createCategoryCalls = []
    h.uidCounter = 0
})
afterEach(() => vi.useRealTimers())

describe("convertPowerpoint import UI", () => {
    it("does not open the blocking importing alert", () => {
        convertPowerpoint([deck()])
        vi.advanceTimersByTime(10)
        expect(h.activePopup.setCalls).not.toContain("alert")
        expect(h.alertMessage.setCalls).toHaveLength(0)
    })

    it("still converts the deck and hands it to setTempShows", () => {
        convertPowerpoint([deck()])
        vi.advanceTimersByTime(10)
        expect(h.tempShows).toHaveLength(1)
        const show = h.tempShows[0].show
        expect(show.origin).toBe("powerpoint")
        expect(show.name).toBe("PHB 108.pptx")
        expect(Object.keys(show.slides)).toHaveLength(2)
    })

    it("skips unreadable packages without opening an alert", () => {
        convertPowerpoint([{ name: "broken.pptx", content: null }])
        vi.advanceTimersByTime(10)
        expect(h.activePopup.setCalls).not.toContain("alert")
        expect(h.alertMessage.setCalls).toHaveLength(0)
        expect(h.tempShows).toHaveLength(0)
    })

    it("keeps the selected hymn-book category when one is active", () => {
        h.drawerTabsData._reset({ shows: { activeSubTab: "phb" } })
        convertPowerpoint([deck()])
        vi.advanceTimersByTime(10)
        expect(h.createCategoryCalls).toHaveLength(0)
        expect(h.tempShows[0].show.category).toBe("phb")
    })

    it("applies the saved hymn background to every slide of a new import", () => {
        h.special._reset({ hymnBackgroundImage: "/bg.png" })
        convertPowerpoint([deck()])
        vi.advanceTimersByTime(10)
        const show = h.tempShows[0].show
        const slides = Object.values(show.slides) as any[]
        expect(slides.length).toBeGreaterThan(0)
        expect(slides.every((s) => s.settings.backgroundImage === "/bg.png")).toBe(true)
    })

    it("leaves slide backgrounds untouched when no hymn background is saved", () => {
        convertPowerpoint([deck()])
        vi.advanceTimersByTime(10)
        const slides = Object.values(h.tempShows[0].show.slides) as any[]
        expect(slides.every((s) => !s.settings.backgroundImage)).toBe(true)
    })
})
