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
        expect(detectVerseNavigationCommand("go to the next verse please")?.direction).toBe("next")
        expect(detectVerseNavigationCommand("advance verses")?.direction).toBe("next")
    })

    it("detects previous verse", () => {
        expect(detectVerseNavigationCommand("previous verse")?.direction).toBe("previous")
        expect(detectVerseNavigationCommand("go back a verse")?.direction).toBeUndefined()
        expect(detectVerseNavigationCommand("back verse")?.direction).toBe("previous")
        expect(detectVerseNavigationCommand("prev verse")?.direction).toBe("previous")
    })

    it("does not fire on unrelated text", () => {
        expect(detectVerseNavigationCommand("John 3:16")).toBeNull()
        expect(detectVerseNavigationCommand("the next chapter")).toBeNull()
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
})
