import { describe, expect, it } from "vitest"
import type { ShowList } from "../../../types/Show"
import { detectHymnCommand, getLocalHymnDecks, HYMN_COMMAND_DEDUPE_MS, resolveHymnCommand } from "./hymnCommands"

function show(partial: Partial<ShowList> & { id: string }): ShowList {
    return { name: "", category: null, timestamps: { created: 0, modified: null, used: null }, ...partial } as ShowList
}

describe("detectHymnCommand", () => {
    it("detects an explicit hymn number", () => {
        const cmd = detectHymnCommand("hymn 108")
        expect(cmd?.number).toBe(108)
        expect(cmd?.confidence).toBe(92)
    })

    it("detects 'hymn number' with higher confidence", () => {
        const cmd = detectHymnCommand("please open hymn number 108")
        expect(cmd?.number).toBe(108)
        expect(cmd?.confidence).toBe(98)
    })

    it("accepts no./# variants and imperative verbs", () => {
        expect(detectHymnCommand("hymnal no. 42")?.number).toBe(42)
        expect(detectHymnCommand("hymn #7")?.number).toBe(7)
        expect(detectHymnCommand("show hymn 108")?.number).toBe(108)
    })

    it("normalizes spoken numbers", () => {
        expect(detectHymnCommand("hymn one hundred eight")?.number).toBe(108)
        expect(detectHymnCommand("hymn number twenty five")?.number).toBe(25)
    })

    it("requires the hymn keyword — does not fire on scripture or songs", () => {
        expect(detectHymnCommand("John 3:16")).toBeNull()
        expect(detectHymnCommand("amazing grace")).toBeNull()
        expect(detectHymnCommand("song 108")).toBeNull()
        expect(detectHymnCommand("hymn")).toBeNull()
        expect(detectHymnCommand("")).toBeNull()
    })

    it("rejects non-positive numbers", () => {
        expect(detectHymnCommand("hymn 0")).toBeNull()
    })
})

describe("resolveHymnCommand", () => {
    const decks = [
        show({ id: "a", name: "PHB 108", origin: "powerpoint", category: "phb" }),
        show({ id: "b", name: "MHB 108", origin: "powerpoint", category: "mhb" }),
        show({ id: "c", name: "PHB 9", origin: "powerpoint", category: "phb" })
    ]
    const cmd = detectHymnCommand("hymn 108")!

    it("activates a unique local match", () => {
        const res = resolveHymnCommand(detectHymnCommand("hymn 9")!, { decks })
        expect(res.status).toBe("activate")
        expect(res.showId).toBe("c")
    })

    it("reports unavailable numbers without a live change", () => {
        const res = resolveHymnCommand(detectHymnCommand("hymn 999")!, { decks })
        expect(res.status).toBe("unavailable")
        expect(res.showId).toBeUndefined()
    })

    it("reports ambiguity when the number exists in multiple books", () => {
        const res = resolveHymnCommand(cmd, { decks })
        expect(res.status).toBe("ambiguous")
        expect(res.candidates?.map((d) => d.id).sort()).toEqual(["a", "b"])
    })

    it("uses the active hymn-book category to disambiguate", () => {
        const res = resolveHymnCommand(cmd, { decks, activeCategory: "mhb" })
        expect(res.status).toBe("activate")
        expect(res.showId).toBe("b")
    })

    it("dedupes repeated transcript chunks for the same number", () => {
        const now = 100000
        const res = resolveHymnCommand(cmd, { decks: [decks[0]], lastCommand: { number: 108, time: now - 1000 }, now })
        expect(res.status).toBe("duplicate")
    })

    it("allows the same command again after the dedupe window", () => {
        const now = 100000
        const res = resolveHymnCommand(cmd, { decks: [decks[0]], lastCommand: { number: 108, time: now - HYMN_COMMAND_DEDUPE_MS - 1 }, now })
        expect(res.status).toBe("activate")
    })

    it("does not re-trigger a hymn that is already live", () => {
        const res = resolveHymnCommand(cmd, { decks: [decks[0]], liveShowId: "a" })
        expect(res.status).toBe("already_live")
    })
})

describe("getLocalHymnDecks", () => {
    it("returns only local hymn decks, excluding archived/private/hidden", () => {
        const shows = [
            show({ id: "1", origin: "powerpoint", category: "phb" }),
            show({ id: "2", category: "songs" }),
            show({ id: "3", origin: "powerpoint", category: "old" }),
            show({ id: "4", origin: "powerpoint", category: "phb", private: true }),
            show({ id: "5", origin: "powerpoint", category: "hidden" })
        ]
        expect(getLocalHymnDecks(shows, [], ["old"], ["hidden"]).map((s) => s.id)).toEqual(["1"])
    })
})
