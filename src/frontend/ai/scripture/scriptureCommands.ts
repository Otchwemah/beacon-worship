/**
 * Beacon Worship — explicit Scripture voice commands (next/previous verse, version change).
 *
 * These are deliberate operator commands, distinct from inferred verse-content matches.
 * Navigation commands are resolved against the LOCAL Bible cache and then handed to the
 * existing Scripture auto-present policy as `reference`-type matches, so the operator's
 * confidence setting still decides live vs preview. Version changes stay local-only and
 * suggestion-based. Pure detection + resolution live here and are unit-tested.
 */

export type VerseDirection = "next" | "previous"
export type NavigationUnit = "verse" | "chapter"

export interface VerseNavigationCommand {
    direction: VerseDirection
    unit: NavigationUnit
    confidence: number
    rationale: string
    raw: string
}

const NEXT_VERSE_REGEX = /\b(?:next|forward|advance)\s+(?:verse|verses)\b/i
const PREVIOUS_VERSE_REGEX = /\b(?:previous|prev|back|last)\s+(?:verse|verses)\b/i
const NEXT_CHAPTER_REGEX = /\b(?:next|forward|advance)\s+chapter\b/i
const PREVIOUS_CHAPTER_REGEX = /\b(?:previous|prev|back|last)\s+chapter\b/i

export function detectVerseNavigationCommand(text: string): VerseNavigationCommand | null {
    if (!text || !text.trim()) return null

    const nextVerse = text.match(NEXT_VERSE_REGEX)
    if (nextVerse) return { direction: "next", unit: "verse", confidence: 98, rationale: `Explicit next-verse command: "${nextVerse[0].trim()}".`, raw: nextVerse[0].trim() }

    const previousVerse = text.match(PREVIOUS_VERSE_REGEX)
    if (previousVerse) return { direction: "previous", unit: "verse", confidence: 98, rationale: `Explicit previous-verse command: "${previousVerse[0].trim()}".`, raw: previousVerse[0].trim() }

    const nextChapter = text.match(NEXT_CHAPTER_REGEX)
    if (nextChapter) return { direction: "next", unit: "chapter", confidence: 98, rationale: `Explicit next-chapter command: "${nextChapter[0].trim()}".`, raw: nextChapter[0].trim() }

    const previousChapter = text.match(PREVIOUS_CHAPTER_REGEX)
    if (previousChapter) return { direction: "previous", unit: "chapter", confidence: 98, rationale: `Explicit previous-chapter command: "${previousChapter[0].trim()}".`, raw: previousChapter[0].trim() }

    return null
}

export interface VersionChangeCommand {
    query: string
    confidence: number
    rationale: string
    raw: string
}

// Operator commands only: "change to the ESV version", "switch to KJV translation", "use the NIV bible".
//
// "read" / "go" / "turn" are NOT verbs here. Preaching is full of "read the Bible",
// "turn to the Bible", "go to John" — those must never be version switches.
// A version/translation/bible keyword is still required, and the captured name must
// look like a real translation (NIV, ESV, Twi…), not "the" / "local" / "holy".
const VERSION_CHANGE_REGEX = /\b(?:(?:change|switch)\s+(?:over\s+)?(?:to|into)\s+|(?:use)\s+)(?:the\s+)?([A-Za-z0-9][A-Za-z0-9 .'\-]{0,40}?)\s+(?:version|translation|bible)\b/i

const VERSION_QUERY_STOPWORDS = new Set(["the", "a", "an", "this", "that", "these", "those", "local", "my", "our", "your", "his", "her", "their", "same", "other", "it", "its", "some", "any", "all", "only", "holy", "word", "from", "to", "bible", "bibles", "version", "translation"])

export function isPlausibleVersionQuery(query: string): boolean {
    const words = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .filter((word) => !VERSION_QUERY_STOPWORDS.has(word))
    if (!words.length) return false
    const joined = words.join(" ")
    return joined.length >= 2 && joined.length <= 40
}

export function detectVersionChangeCommand(text: string): VersionChangeCommand | null {
    if (!text || !text.trim()) return null
    const match = text.match(VERSION_CHANGE_REGEX)
    if (!match) return null

    const query = match[1].trim()
    if (!isPlausibleVersionQuery(query)) return null

    return { query, confidence: 95, rationale: `Explicit version-change command: "${match[0].trim()}".`, raw: match[0].trim() }
}

export interface ParsedReference {
    book: string
    chapter: number
    verse: number
}

export function parseScriptureReference(refStr: string): ParsedReference | null {
    if (!refStr) return null
    const match = refStr.match(/^((?:[1-3]\s+)?[\p{L}\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/u)
    if (!match) return null
    return {
        book: match[1].trim(),
        chapter: parseInt(match[2], 10),
        verse: match[4] ? parseInt(match[4], 10) : parseInt(match[3], 10)
    }
}

/** Minimal shape of BibleCacheData.referenceIndex needed for navigation. */
export type ReferenceIndex = Map<string, { bookName: string; chapterNumber: number; verseCount: number }>

export type VerseNavigationResolution =
    | { status: "navigate"; content: string }
    | { status: "unavailable"; reason: "no_current" | "unknown_chapter" | "end_of_book" | "start_of_book" }

/** Resolve a next/previous verse or chapter command against the local Bible reference index. Pure. */
export function resolveVerseNavigation(direction: VerseDirection, currentRef: string | null | undefined, referenceIndex: ReferenceIndex, unit: NavigationUnit = "verse"): VerseNavigationResolution {
    const current = currentRef ? parseScriptureReference(currentRef) : null
    if (!current) return { status: "unavailable", reason: "no_current" }

    const key = `${current.book.toLowerCase()} ${current.chapter}`
    const chapterData = referenceIndex.get(key)
    if (!chapterData) return { status: "unavailable", reason: "unknown_chapter" }

    if (unit === "chapter") {
        const delta = direction === "next" ? 1 : -1
        const neighbour = referenceIndex.get(`${current.book.toLowerCase()} ${current.chapter + delta}`)
        if (neighbour && neighbour.verseCount >= 1) {
            return { status: "navigate", content: `${neighbour.bookName} ${neighbour.chapterNumber}:1` }
        }
        return { status: "unavailable", reason: direction === "next" ? "end_of_book" : "start_of_book" }
    }

    if (direction === "next") {
        if (current.verse < chapterData.verseCount) {
            return { status: "navigate", content: `${chapterData.bookName} ${chapterData.chapterNumber}:${current.verse + 1}` }
        }
        const nextChapter = referenceIndex.get(`${current.book.toLowerCase()} ${current.chapter + 1}`)
        if (nextChapter && nextChapter.verseCount >= 1) {
            return { status: "navigate", content: `${nextChapter.bookName} ${nextChapter.chapterNumber}:1` }
        }
        return { status: "unavailable", reason: "end_of_book" }
    }

    // previous
    if (current.verse > 1) {
        return { status: "navigate", content: `${chapterData.bookName} ${chapterData.chapterNumber}:${current.verse - 1}` }
    }
    const prevChapter = referenceIndex.get(`${current.book.toLowerCase()} ${current.chapter - 1}`)
    if (prevChapter && prevChapter.verseCount >= 1) {
        return { status: "navigate", content: `${prevChapter.bookName} ${prevChapter.chapterNumber}:${prevChapter.verseCount}` }
    }
    return { status: "unavailable", reason: "start_of_book" }
}

export const SCRIPTURE_COMMAND_DEDUPE_MS = 4000
