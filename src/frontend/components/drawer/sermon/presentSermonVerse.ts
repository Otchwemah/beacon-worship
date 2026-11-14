import { get } from "svelte/store"
import { activeScripture, drawerTabsData, outLocked } from "../../../stores"
import { newToast } from "../../../utils/common"
import { startShow } from "../../helpers/showActions"
import { parseEngScriptureRefToNumbers, playScripture, resolveScriptureReference } from "../bible/scripture"
import { formatSermonReference } from "./sermonReference"
import { sermonLive, type SermonVerse } from "./sermonStore"
import { lookupVerseText } from "./verseLookup"

/**
 * Send a verse or hymn to the audience output WITHOUT leaving the Sermon tab.
 * startScripture() switches the drawer to Scripture (so Scripture.svelte can
 * consume openScripture). The Sermon console must stay put, so we set
 * activeScripture and call playScripture() directly. Hymns use startShow().
 */
export async function presentSermonVerse(verse: SermonVerse): Promise<boolean> {
    if (get(outLocked)) {
        newToast("main.locked")
        return false
    }

    if (verse.kind === "hymn") {
        if (!verse.hymnShowId) {
            newToast("That hymn is not in the local library")
            return false
        }
        await startShow(verse.hymnShowId)
        sermonLive.set({ ...verse, timestamp: Date.now() })
        return true
    }

    const parsed = parseEngScriptureRefToNumbers(verse.reference)
    const resolved = parsed || (await resolveScriptureReference(verse.reference))
    if (!resolved) {
        newToast("Could not find that verse in the local Bible")
        return false
    }

    // parseEngScriptureRefToNumbers stores the reference string in `id`; playScripture
    // loads the Bible from the Scripture tab's active sub-tab, so prefer that.
    const bibleId = get(drawerTabsData).scripture?.activeSubTab || (!parsed ? resolved.id : "") || ""
    if (!bibleId) {
        newToast("Could not find that verse in the local Bible")
        return false
    }

    activeScripture.set({
        id: bibleId,
        reference: { book: resolved.book, chapters: [resolved.chapter], verses: [resolved.verses] }
    })

    await playScripture()

    const pretty = formatSermonReference(resolved)
    const text = verse.text || (await lookupVerseText(pretty)) || (await lookupVerseText(verse.reference))
    const live: SermonVerse = { ...verse, reference: pretty, text, timestamp: Date.now() }
    sermonLive.set(live)
    const { AiManager } = await import("../../../ai/manager/AiManager")
    AiManager.liveContent = verse.reference
    return true
}
