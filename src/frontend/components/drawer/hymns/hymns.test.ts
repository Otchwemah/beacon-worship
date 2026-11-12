import { describe, expect, it } from "vitest"
import type { ShowList } from "../../../../types/Show"
import { filterHymnDecks, getHymnCategoryIds, getHymnNumber, isHymnDeck, sortHymnDecks } from "./hymns"

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
