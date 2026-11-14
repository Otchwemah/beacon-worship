import { describe, expect, it } from "vitest"
import { enqueueVerse, removeQueuedVerse, verseFromSuggestion, type SermonVerse } from "./sermonStore"

function verse(reference: string, id = reference): SermonVerse {
    return { id, reference, text: "", confidence: 90, timestamp: 1 }
}

describe("sermon queue", () => {
    it("adds a verse at the front", () => {
        const next = enqueueVerse([], verse("John 3:16"))
        expect(next.map((item) => item.reference)).toEqual(["John 3:16"])
    })

    it("does not enqueue the same reference twice", () => {
        const once = enqueueVerse([], verse("John 3:16"))
        const twice = enqueueVerse(once, verse("John 3:16", "other"))
        expect(twice).toHaveLength(1)
    })

    it("removes by id", () => {
        const queued = enqueueVerse(enqueueVerse([], verse("John 3:16")), verse("Romans 8:28"))
        expect(removeQueuedVerse(queued, "Romans 8:28")).toHaveLength(1)
    })
})

describe("verseFromSuggestion", () => {
    it("copies the scripture suggestion fields", () => {
        const card = verseFromSuggestion({ id: "abc", content: "John 3:16", confidence: 98, scriptureMatchType: "reference", timestamp: 5 }, "For God so loved")
        expect(card).toMatchObject({ id: "abc", reference: "John 3:16", text: "For God so loved", matchType: "reference", confidence: 98 })
    })
})
