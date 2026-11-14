import { stripMarkdown } from "json-bible/lib/markdown"
import { get } from "svelte/store"
import { drawerTabsData } from "../../../stores"
import { loadJsonBible, parseEngScriptureRefToNumbers, resolveScriptureReference } from "../bible/scripture"

function versePlainText(verse: any): string {
    if (!verse) return ""
    const html = typeof verse.getHTML === "function" ? verse.getHTML() : ""
    const raw = typeof verse.getText === "function" ? verse.getText() : verse.text || html
    return stripMarkdown(String(raw || "").replace(/<[^>]+>/g, " "))
        .replace(/\s+/g, " ")
        .trim()
}

/** Load the verse text for a canonical reference from the active local Bible. */
export async function lookupVerseText(reference: string, bibleId?: string): Promise<string> {
    const id = bibleId || get(drawerTabsData).scripture?.activeSubTab || ""
    const resolved = parseEngScriptureRefToNumbers(reference) || (await resolveScriptureReference(reference, id))
    if (!id || !resolved) return ""

    try {
        const bible = await loadJsonBible(id)
        if (!bible) return ""
        const book = await bible.getBook(resolved.book)
        const chapter = await book.getChapter(resolved.chapter)
        const parts: string[] = []
        for (const verseNumber of resolved.verses) {
            const text = versePlainText(chapter.getVerse(verseNumber))
            if (text) parts.push(text)
        }
        return parts.join(" ")
    } catch {
        return ""
    }
}
