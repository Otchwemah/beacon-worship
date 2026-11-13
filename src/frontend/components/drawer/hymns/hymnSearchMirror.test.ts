import { describe, expect, it } from "vitest"
import { get, writable } from "svelte/store"
import { searchHymnDecks } from "./hymns"
import { normalizeHymnSearchQuery, shouldMirrorDrawerSearchToHymns } from "./hymnSearchMirror"

describe("normalizeHymnSearchQuery", () => {
    it("trims and collapses internal whitespace like the drawer search", () => {
        expect(normalizeHymnSearchQuery("  amazing   grace  ")).toBe("amazing grace ")
        expect(normalizeHymnSearchQuery("108")).toBe("108")
    })

    it("preserves a single trailing space while typing", () => {
        expect(normalizeHymnSearchQuery("108 ")).toBe("108 ")
        expect(normalizeHymnSearchQuery("108   ")).toBe("108 ")
    })

    it("handles empty / nullish input", () => {
        expect(normalizeHymnSearchQuery("")).toBe("")
        expect(normalizeHymnSearchQuery(null)).toBe("")
        expect(normalizeHymnSearchQuery(undefined)).toBe("")
    })
})

describe("shouldMirrorDrawerSearchToHymns", () => {
    it("mirrors only while the Hymns tab is active and the values differ", () => {
        expect(shouldMirrorDrawerSearchToHymns("hymns", "108", "")).toBe(true)
        expect(shouldMirrorDrawerSearchToHymns("hymns", "", "108")).toBe(true)
        expect(shouldMirrorDrawerSearchToHymns("hymns", "108", "108")).toBe(false)
    })

    it("never mirrors from other drawer tabs", () => {
        expect(shouldMirrorDrawerSearchToHymns("shows", "108", "")).toBe(false)
        expect(shouldMirrorDrawerSearchToHymns("media", "grace", "")).toBe(false)
        expect(shouldMirrorDrawerSearchToHymns(null, "108", "")).toBe(false)
        expect(shouldMirrorDrawerSearchToHymns(undefined, "108", "")).toBe(false)
    })
})

// Contract test for the two-way mirror used by Drawer.svelte + HymnsTabs.svelte.
// It exercises the same helpers/stores the components use, without a DOM.
describe("Hymns drawer search mirror", () => {
    const decks = [
        { id: "a", name: "PHB 108 - Amazing Grace", origin: "powerpoint" },
        { id: "b", name: "PHB 10 - Blessed Assurance", origin: "powerpoint" },
        { id: "c", name: "Untitled Deck", origin: "powerpoint" }
    ] as any[]

    function setup(activeTab: string | null) {
        const hymnSearch = writable("")
        let drawerSearch = ""

        const syncFromStore = () => {
            if (activeTab === "hymns") drawerSearch = get(hymnSearch)
        }
        const typeInDrawer = (value: string) => {
            drawerSearch = normalizeHymnSearchQuery(value)
            if (shouldMirrorDrawerSearchToHymns(activeTab, drawerSearch, get(hymnSearch))) hymnSearch.set(drawerSearch)
        }
        const typeInHymns = (value: string) => {
            hymnSearch.set(normalizeHymnSearchQuery(value))
            syncFromStore()
        }
        const clearDrawer = () => typeInDrawer("")
        const switchTab = (tab: string | null) => {
            activeTab = tab
            if (tab !== "hymns") drawerSearch = ""
            else syncFromStore()
        }

        return { hymnSearch, getDrawer: () => drawerSearch, typeInDrawer, typeInHymns, clearDrawer, switchTab }
    }

    it("top drawer numeric query mirrors into the hymn bar and matches numbers only", () => {
        const m = setup("hymns")
        m.typeInDrawer("108")
        expect(get(m.hymnSearch)).toBe("108")
        expect(m.getDrawer()).toBe("108")
        expect(searchHymnDecks(decks, get(m.hymnSearch)).map((d) => d.id)).toEqual(["a"])
    })

    it("dedicated hymn bar text query mirrors back to the top drawer and matches titles only", () => {
        const m = setup("hymns")
        m.typeInHymns("grace")
        expect(m.getDrawer()).toBe("grace")
        expect(searchHymnDecks(decks, m.getDrawer()).map((d) => d.id)).toEqual(["a"])
    })

    it("clearing either input clears both", () => {
        const m = setup("hymns")
        m.typeInDrawer("10")
        m.clearDrawer()
        expect(get(m.hymnSearch)).toBe("")
        expect(m.getDrawer()).toBe("")

        m.typeInHymns("blessed")
        m.clearDrawer()
        expect(get(m.hymnSearch)).toBe("")
        expect(m.getDrawer()).toBe("")
    })

    it("leaving Hymns clears the top drawer but keeps the dedicated query; returning restores it", () => {
        const m = setup("hymns")
        m.typeInDrawer("108")
        m.switchTab("shows")
        expect(m.getDrawer()).toBe("")
        expect(get(m.hymnSearch)).toBe("108")

        // typing on another tab must not overwrite the hymn query
        m.typeInDrawer("media search")
        expect(get(m.hymnSearch)).toBe("108")

        m.switchTab("hymns")
        expect(m.getDrawer()).toBe("108")
        expect(searchHymnDecks(decks, get(m.hymnSearch)).map((d) => d.id)).toEqual(["a"])
    })
})
