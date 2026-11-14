import { describe, expect, it } from "vitest"
import type { BibleCacheData } from "./BibleCacheManager"
import { BibleSearchDetector } from "./BibleSearchDetector"
import { CHAPTER_PATTERN, ORDINAL_PREFIX_PATTERN, VERSE_PATTERN } from "./referenceDictionary"

function cacheFor(books: Array<{ name: string; chapter: number; verses: number }>): BibleCacheData {
    const referenceIndex = new Map<string, { bookName: string; chapterNumber: number; startVerseId: number; verseCount: number }>()
    const bookNames: string[] = []
    let startVerseId = 0
    for (const book of books) {
        if (!bookNames.includes(book.name)) bookNames.push(book.name)
        referenceIndex.set(`${book.name.toLowerCase()} ${book.chapter}`, {
            bookName: book.name,
            chapterNumber: book.chapter,
            startVerseId,
            verseCount: book.verses
        })
        startVerseId += book.verses
    }
    const bookPattern = bookNames.map((b) => b.replace(/\s+/g, "\\s+")).join("|")
    const refRegex = new RegExp(`\\b((?:(?:[1-3]|${ORDINAL_PREFIX_PATTERN})\\s+)?(?:${bookPattern}))\\b\\s*(?:${CHAPTER_PATTERN})?\\s*(\\d+)(?:[\\s,:.]+(?:${VERSE_PATTERN})?\\s*(\\d+)(?:\\s*[-–—]\\s*(\\d+))?)?`, "iu")
    return {
        versePool: [],
        verseToIdMap: new Map(),
        referenceIndex,
        vocabPool: [],
        vocabToIdMap: new Map(),
        wordIdf: new Float32Array(),
        wordPostingsOffsets: new Uint32Array(),
        wordPostings: new Uint32Array(),
        verseTokensOffsets: new Uint32Array(),
        verseTokens: new Uint32Array(),
        bookNames,
        refRegex,
        totalVerses: startVerseId
    }
}

const detector = new BibleSearchDetector(
    cacheFor([
        { name: "John", chapter: 3, verses: 36 },
        { name: "John", chapter: 4, verses: 54 },
        { name: "Hosea", chapter: 1, verses: 11 },
        { name: "Jonah", chapter: 1, verses: 17 },
        { name: "Isaiah", chapter: 40, verses: 31 },
        { name: "Numbers", chapter: 6, verses: 27 },
        { name: "Obadiah", chapter: 1, verses: 21 }
    ])
)

describe("BibleSearchDetector explicit references", () => {
    it("keeps a citation when the pastor keeps preaching after it", async () => {
        const transcript =
            "Turn with me to John chapter 3 verse 16 and for God so loved the world that he gave his only begotten Son that whoever believes in him should not perish but have everlasting life amen"
        const match = await detector.search(transcript, "")
        expect(match).toMatchObject({
            type: "scripture",
            content: "John 3:16",
            scriptureMatchType: "reference"
        })
        expect(match!.confidence).toBeGreaterThanOrEqual(75)
    })

    it("still catches a short spoken reference", async () => {
        const match = await detector.search("John chapter 3 verse 16", "")
        expect(match?.content).toBe("John 3:16")
        expect(match?.scriptureMatchType).toBe("reference")
    })

    it("does not wait on content matching once a citation is found", async () => {
        const started = Date.now()
        const match = await detector.search("John 3:16", "")
        expect(match?.scriptureMatchType).toBe("reference")
        expect(Date.now() - started).toBeLessThan(50)
    })

    it("resolves Ghanaian/ASR book names to an explicit reference", async () => {
        expect((await detector.search("Hosiah chapter 1 verse 1", ""))?.content).toBe("Hosea 1:1")
        expect((await detector.search("Donut chapter 1 verse 1", ""))?.content).toBe("Jonah 1:1")
        expect((await detector.search("Isiah chapter 40 verse 8", ""))?.content).toBe("Isaiah 40:8")
        expect((await detector.search("Obadayah chapter 1 verse 1", ""))?.content).toBe("Obadiah 1:1")
        expect((await detector.search("Number chapter 6 verse 24", ""))?.content).toBe("Numbers 6:24")
    })
})
