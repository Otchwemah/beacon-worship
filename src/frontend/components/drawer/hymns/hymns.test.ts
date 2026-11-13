import { describe, expect, it } from "vitest"
import type { ShowList } from "../../../../types/Show"
import { applyHymnBackground, filterHymnDecks, getHymnCategoryIds, getHymnNumber, isHymnDeck, searchHymnDecks, sortHymnDecks, toggleHymnCategory } from "./hymns"

function show(partial: Partial<ShowList> & { id: string }): ShowList {
    return { name: "", category: null, timestamps: { created: 0, modified: null, used: null }, ...partial } as ShowList
}

describe("isHymnDeck", () => {
    it("treats PowerPoint-imported shows as hymn decks", () => {
        expect(isHymnDeck(show({ id: "a", origin: "powerpoint" }))).toBe(true)
    })

    it("does not treat ordinary songs or other import origins as hymn decks", () => {
        expect(isHymnDeck(show({ id: "a" }))).toBe(false)
        expect(isHymnDeck(show({ id: "a", origin: "pco" }))).toBe(false)
        expect(isHymnDeck(show({ id: "a", origin: "hymnary" }))).toBe(false)
    })

    it("includes shows in explicitly designated hymn-book categories", () => {
        expect(isHymnDeck(show({ id: "a", category: "phb" }), ["phb"])).toBe(true)
        expect(isHymnDeck(show({ id: "a", category: "songs" }), ["phb"])).toBe(false)
    })
})

describe("getHymnNumber", () => {
    it("prefers explicit metadata over the name", () => {
        expect(getHymnNumber({ name: "PHB 108", quickAccess: { number: "42" } })).toBe(42)
        expect(getHymnNumber({ name: "PHB 108", meta: { number: 7 } })).toBe(7)
    })

    it("reads a leading number, with or without a short book prefix", () => {
        expect(getHymnNumber({ name: "PHB 108 - Amazing Grace" })).toBe(108)
        expect(getHymnNumber({ name: "PHB108" })).toBe(108)
        expect(getHymnNumber({ name: "108 - Amazing Grace" })).toBe(108)
        expect(getHymnNumber({ name: "  phb_108 " })).toBe(108)
    })

    it("does not mis-number titles with trailing or embedded numbers", () => {
        expect(getHymnNumber({ name: "Amazing Grace 108" })).toBeNull()
        expect(getHymnNumber({ name: "10,000 Reasons" })).toBe(10) // leading number is a genuine ambiguity, documented
        expect(getHymnNumber({ name: "Amazing Grace" })).toBeNull()
        expect(getHymnNumber({ name: "" })).toBeNull()
    })

    it("ignores non-numeric metadata", () => {
        expect(getHymnNumber({ name: "PHB 12", quickAccess: { number: "abc" } })).toBe(12)
    })
})

describe("filterHymnDecks", () => {
    const shows = [
        show({ id: "1", name: "PHB 1", origin: "powerpoint", category: "phb" }),
        show({ id: "2", name: "Song", category: "songs" }),
        show({ id: "3", name: "PHB 2", origin: "powerpoint", category: "phb" }),
        show({ id: "4", name: "Loose deck", origin: "powerpoint", category: null }),
        show({ id: "5", name: "Hidden", origin: "powerpoint", category: "phb", private: true }),
        show({ id: "6", name: "Archived", origin: "powerpoint", category: "old" })
    ]

    it("returns only hymn decks for 'all'", () => {
        expect(filterHymnDecks(shows, { category: "all" }).map((s) => s.id)).toEqual(["1", "3", "4", "6"])
    })

    it("filters by category and supports unlabeled", () => {
        expect(filterHymnDecks(shows, { category: "phb" }).map((s) => s.id)).toEqual(["1", "3"])
        expect(filterHymnDecks(shows, { category: "unlabeled" }).map((s) => s.id)).toEqual(["4"])
    })

    it("excludes archived and profile-hidden categories", () => {
        expect(filterHymnDecks(shows, { archivedCategoryIds: ["old"] }).map((s) => s.id)).toEqual(["1", "3", "4"])
        expect(filterHymnDecks(shows, { hiddenCategoryIds: ["phb"] }).map((s) => s.id)).toEqual(["4", "6"])
    })

    it("never returns private shows", () => {
        expect(filterHymnDecks(shows).some((s) => s.id === "5")).toBe(false)
    })

    it("handles empty input", () => {
        expect(filterHymnDecks([])).toEqual([])
        expect(filterHymnDecks(undefined as any)).toEqual([])
    })
})

describe("sortHymnDecks", () => {
    it("sorts numerically, not lexicographically", () => {
        const shows = [show({ id: "a", name: "PHB 108", origin: "powerpoint" }), show({ id: "b", name: "PHB 9", origin: "powerpoint" }), show({ id: "c", name: "PHB 20", origin: "powerpoint" })]
        expect(sortHymnDecks(shows).map((s) => s.name)).toEqual(["PHB 9", "PHB 20", "PHB 108"])
    })

    it("puts unnumbered decks after numbered ones, alphabetically", () => {
        const shows = [show({ id: "a", name: "Zulu", origin: "powerpoint" }), show({ id: "b", name: "PHB 2", origin: "powerpoint" }), show({ id: "c", name: "Alpha", origin: "powerpoint" })]
        expect(sortHymnDecks(shows).map((s) => s.name)).toEqual(["PHB 2", "Alpha", "Zulu"])
    })

    it("does not mutate the input array", () => {
        const shows = [show({ id: "a", name: "PHB 9" }), show({ id: "b", name: "PHB 1" })]
        const before = shows.map((s) => s.id)
        sortHymnDecks(shows)
        expect(shows.map((s) => s.id)).toEqual(before)
    })
})

describe("getHymnCategoryIds", () => {
    it("lists only categories that actually contain hymn decks", () => {
        const shows = [show({ id: "1", origin: "powerpoint", category: "phb" }), show({ id: "2", category: "songs" }), show({ id: "3", origin: "powerpoint", category: "mhb" }), show({ id: "4", origin: "powerpoint", category: null })]
        expect(getHymnCategoryIds(shows).sort()).toEqual(["mhb", "phb"])
    })
})

describe("searchHymnDecks", () => {
    const decks = [
        show({ id: "a", name: "PHB 108 - Amazing Grace", origin: "powerpoint" }),
        show({ id: "b", name: "PHB 10 - Blessed Assurance", origin: "powerpoint" }),
        show({ id: "c", name: "PHB 100 - Holy Holy", origin: "powerpoint" }),
        show({ id: "d", name: "Untitled Deck", origin: "powerpoint" })
    ]

    it("returns everything for an empty query", () => {
        expect(searchHymnDecks(decks, "").map((d) => d.id)).toEqual(["a", "b", "c", "d"])
        expect(searchHymnDecks(decks, "   ").map((d) => d.id)).toEqual(["a", "b", "c", "d"])
    })

    it("matches hymn numbers only for a numeric query (prefix)", () => {
        expect(searchHymnDecks(decks, "108").map((d) => d.id)).toEqual(["a"])
        expect(searchHymnDecks(decks, "10").map((d) => d.id)).toEqual(["a", "b", "c"])
        expect(searchHymnDecks(decks, "100").map((d) => d.id)).toEqual(["c"])
    })

    it("matches names only for a text query — never numbers", () => {
        expect(searchHymnDecks(decks, "grace").map((d) => d.id)).toEqual(["a"])
        expect(searchHymnDecks(decks, "holy").map((d) => d.id)).toEqual(["c"])
        // a text query that looks like a number-word still matches names, not numbers
        expect(searchHymnDecks(decks, "PHB").map((d) => d.id)).toEqual(["a", "b", "c"])
    })

    it("returns nothing when there is no match", () => {
        expect(searchHymnDecks(decks, "999")).toEqual([])
        expect(searchHymnDecks(decks, "zzz")).toEqual([])
    })

    it("handles empty input", () => {
        expect(searchHymnDecks([], "108")).toEqual([])
        expect(searchHymnDecks(undefined as any, "108")).toEqual([])
    })
})

describe("applyHymnBackground", () => {
    const deck = {
        slides: {
            s1: { group: null, color: null, settings: { color: "#000" }, notes: "", items: [] },
            s2: { group: null, color: null, settings: { backgroundImage: "/old.jpg" }, notes: "", items: [] }
        },
        layouts: {
            l1: {
                name: "Default",
                notes: "",
                slides: [{ id: "s1", background: "mediaA", children: { s2: { background: "mediaB" } } }]
            }
        }
    }

    it("sets the saved image on every slide and preserves other settings", () => {
        const { slides } = applyHymnBackground(deck, "/bg.png")
        expect(slides.s1.settings.backgroundImage).toBe("/bg.png")
        expect(slides.s1.settings.color).toBe("#000")
        expect(slides.s2.settings.backgroundImage).toBe("/bg.png")
    })

    it("clears layout-level and per-child background overrides so the image wins in preview", () => {
        const { layouts } = applyHymnBackground(deck, "/bg.png")
        expect(layouts.l1.slides[0].background).toBeUndefined()
        expect(layouts.l1.slides[0].children.s2.background).toBeUndefined()
    })

    it("does not mutate the input show", () => {
        applyHymnBackground(deck, "/bg.png")
        expect(deck.slides.s2.settings.backgroundImage).toBe("/old.jpg")
        expect(deck.layouts.l1.slides[0].background).toBe("mediaA")
        expect(deck.layouts.l1.slides[0].children.s2.background).toBe("mediaB")
    })

    it("an empty path removes the slide override but leaves layout backgrounds", () => {
        const { slides, layouts } = applyHymnBackground(deck, "")
        expect(slides.s2.settings.backgroundImage).toBeUndefined()
        expect(layouts.l1.slides[0].background).toBe("mediaA")
    })

    it("handles decks with no slides or layouts", () => {
        expect(applyHymnBackground({}, "/bg.png")).toEqual({ slides: {}, layouts: {} })
    })
})

describe("toggleHymnCategory", () => {
    it("adds a category id when enabled", () => {
        expect(toggleHymnCategory([], "phb", true)).toEqual(["phb"])
        expect(toggleHymnCategory(["mhb"], "phb", true)).toEqual(["mhb", "phb"])
    })

    it("removes a category id when disabled", () => {
        expect(toggleHymnCategory(["mhb", "phb"], "phb", false)).toEqual(["mhb"])
        expect(toggleHymnCategory(["phb"], "phb", false)).toEqual([])
    })

    it("dedupes existing ids and ignores empty category ids", () => {
        expect(toggleHymnCategory(["phb", "phb", ""], "phb", true)).toEqual(["phb"])
        expect(toggleHymnCategory(["phb"], "", true)).toEqual(["phb"])
    })

    it("handles null / undefined input without mutating it", () => {
        const input = ["phb"]
        expect(toggleHymnCategory(undefined, "mhb", true)).toEqual(["mhb"])
        expect(toggleHymnCategory(null, "mhb", true)).toEqual(["mhb"])
        expect(toggleHymnCategory(input, "mhb", true)).toEqual(["phb", "mhb"])
        expect(input).toEqual(["phb"])
    })

    it("designating a category makes its non-PowerPoint shows hymn decks", () => {
        const shows = [show({ id: "a", name: "Custom Hymn", category: "phb", origin: "manual" }), show({ id: "b", name: "Song", category: "songs", origin: "manual" })]
        const ids = toggleHymnCategory([], "phb", true)
        expect(filterHymnDecks(shows, { hymnCategoryIds: ids }).map((s) => s.id)).toEqual(["a"])
        expect(getHymnCategoryIds(shows, ids)).toEqual(["phb"])
    })
})
