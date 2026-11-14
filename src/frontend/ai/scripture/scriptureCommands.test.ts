import { describe, expect, it } from "vitest"
import { detectVerseNavigationCommand, detectVersionChangeCommand, parseScriptureReference, resolveVerseNavigation, type ReferenceIndex } from "./scriptureCommands"

function index(): ReferenceIndex {
    return new Map([
        ["john 3", { bookName: "John", chapterNumber: 3, verseCount: 36 }],
        ["john 4", { bookName: "John", chapterNumber: 4, verseCount: 54 }],
        ["psalms 23", { bookName: "Psalms", chapterNumber: 23, verseCount: 6 }]
    ])
}

describe("detectVerseNavigationCommand", () => {
    it("detects next verse", () => {
        expect(detectVerseNavigationCommand("next verse")?.direction).toBe("next")
        expect(detectVerseNavigationCommand("next verse")?.unit).toBe("verse")
        expect(detectVerseNavigationCommand("go to the next verse please")?.direction).toBe("next")
        expect(detectVerseNavigationCommand("advance verses")?.direction).toBe("next")
    })

    it("detects previous verse", () => {
        expect(detectVerseNavigationCommand("previous verse")?.direction).toBe("previous")
        expect(detectVerseNavigationCommand("go back a verse")?.direction).toBeUndefined()
        expect(detectVerseNavigationCommand("back verse")?.direction).toBe("previous")
        expect(detectVerseNavigationCommand("prev verse")?.direction).toBe("previous")
    })

    it("detects next and previous chapter", () => {
        expect(detectVerseNavigationCommand("next chapter")).toEqual(expect.objectContaining({ direction: "next", unit: "chapter" }))
        expect(detectVerseNavigationCommand("the next chapter")).toEqual(expect.objectContaining({ direction: "next", unit: "chapter" }))
        expect(detectVerseNavigationCommand("previous chapter")).toEqual(expect.objectContaining({ direction: "previous", unit: "chapter" }))
        expect(detectVerseNavigationCommand("last chapter")).toEqual(expect.objectContaining({ direction: "previous", unit: "chapter" }))
    })

    it("does not fire on unrelated text", () => {
        expect(detectVerseNavigationCommand("John 3:16")).toBeNull()
        expect(detectVerseNavigationCommand("")).toBeNull()
    })
})

describe("detectVersionChangeCommand", () => {
    it("detects an explicit version change", () => {
        expect(detectVersionChangeCommand("change to the ESV version")?.query).toBe("ESV")
        expect(detectVersionChangeCommand("switch to KJV translation")?.query).toBe("KJV")
        expect(detectVersionChangeCommand("use the NIV bible")?.query).toBe("NIV")
    })

    it("requires a version/translation/bible keyword", () => {
        expect(detectVersionChangeCommand("change to hymn 108")).toBeNull()
        expect(detectVersionChangeCommand("switch to next verse")).toBeNull()
        expect(detectVersionChangeCommand("")).toBeNull()
    })

    it("does not treat preaching phrases as a version change", () => {
        expect(detectVersionChangeCommand("you read the Bible")).toBeNull()
        expect(detectVersionChangeCommand("read the Bible")).toBeNull()
        expect(detectVersionChangeCommand("when you read the Bible, look at John 8:7")).toBeNull()
        expect(detectVersionChangeCommand("turn to the Bible")).toBeNull()
        expect(detectVersionChangeCommand("go to the Bible")).toBeNull()
        expect(detectVersionChangeCommand("turn with me to John 3")).toBeNull()
    })

    it("does not fire on the local-Bibles-only toast feeding back into STT", () => {
        expect(detectVersionChangeCommand("Could not switch to the (local Bibles only)")).toBeNull()
        expect(detectVersionChangeCommand("could not switch to the local Bible")).toBeNull()
        expect(detectVersionChangeCommand("switch to the local Bible")).toBeNull()
        expect(detectVersionChangeCommand("switch to the local Bibles only")).toBeNull()
    })
})

describe("parseScriptureReference", () => {
    it("parses book chapter:verse and ranges", () => {
        expect(parseScriptureReference("John 3:16")).toEqual({ book: "John", chapter: 3, verse: 16 })
        expect(parseScriptureReference("1 John 2:3-5")).toEqual({ book: "1 John", chapter: 2, verse: 5 })
        expect(parseScriptureReference("nonsense")).toBeNull()
    })
})

describe("resolveVerseNavigation", () => {
    it("advances within a chapter", () => {
        expect(resolveVerseNavigation("next", "John 3:16", index())).toEqual({ status: "navigate", content: "John 3:17" })
    })

    it("advances across a chapter boundary", () => {
        expect(resolveVerseNavigation("next", "John 3:36", index())).toEqual({ status: "navigate", content: "John 4:1" })
    })

    it("reports end of book when there is no next chapter", () => {
        expect(resolveVerseNavigation("next", "Psalms 23:6", index())).toEqual({ status: "unavailable", reason: "end_of_book" })
    })

    it("goes back within a chapter", () => {
        expect(resolveVerseNavigation("previous", "John 3:16", index())).toEqual({ status: "navigate", content: "John 3:15" })
    })

    it("goes back across a chapter boundary to the last verse", () => {
        expect(resolveVerseNavigation("previous", "John 4:1", index())).toEqual({ status: "navigate", content: "John 3:36" })
    })

    it("reports start of book when there is no previous chapter", () => {
        expect(resolveVerseNavigation("previous", "John 3:1", index())).toEqual({ status: "unavailable", reason: "start_of_book" })
    })

    it("reports no current reference", () => {
        expect(resolveVerseNavigation("next", null, index())).toEqual({ status: "unavailable", reason: "no_current" })
        expect(resolveVerseNavigation("next", "", index())).toEqual({ status: "unavailable", reason: "no_current" })
    })

    it("reports unknown chapter", () => {
        expect(resolveVerseNavigation("next", "John 99:1", index())).toEqual({ status: "unavailable", reason: "unknown_chapter" })
    })

    it("advances a whole chapter", () => {
        expect(resolveVerseNavigation("next", "John 3:16", index(), "chapter")).toEqual({ status: "navigate", content: "John 4:1" })
    })

    it("goes back a whole chapter to verse 1", () => {
        expect(resolveVerseNavigation("previous", "John 4:12", index(), "chapter")).toEqual({ status: "navigate", content: "John 3:1" })
    })

    it("reports end of book for next chapter", () => {
        expect(resolveVerseNavigation("next", "Psalms 23:1", index(), "chapter")).toEqual({ status: "unavailable", reason: "end_of_book" })
    })
})
