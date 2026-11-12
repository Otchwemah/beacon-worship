import { get } from "svelte/store"
import { uid } from "uid"
import type { AiSuggestion } from "../../../types/ai/Ai"
import type { ShowList } from "../../../types/Show"
import { keysToID } from "../../components/helpers/array"
import { getFirstActiveOutput } from "../../components/helpers/output"
import { startShow } from "../../components/helpers/showActions"
import { activeProfile, aiSuggestions, categories, drawerTabsData, shows, special } from "../../stores"
import { newToast } from "../../utils/common"
import { translateText } from "../../utils/language"
import { getAccess } from "../../utils/profile"
import { getLocalHymnDecks, resolveHymnCommand, type HymnCommand, type HymnCommandResolution } from "./hymnCommands"

/**
 * Beacon Worship — side effects for explicit local hymn-number commands.
 *
 * Guarantees:
 *  - resolves against the LOCAL show library only (no network, no LLM);
 *  - activates only the requested local hymn deck via the canonical startShow() helper;
 *  - dedupes repeated transcript chunks (see resolveHymnCommand);
 *  - reports unavailable / ambiguous numbers WITHOUT changing the live output.
 */

let lastCommand: { number: number; time: number } | null = null

const SUGGESTION_MAX_AGE = 5 * 60 * 1000
const SUGGESTION_LIMIT = 15

export async function handleHymnCommand(command: HymnCommand): Promise<HymnCommandResolution> {
    const now = Date.now()

    const profile = get(activeProfile) ? getAccess("shows") : {}
    const hiddenCategoryIds = Object.entries(profile)
        .filter(([, level]) => level === "none")
        .map(([id]) => id)
    const archivedCategoryIds = Object.entries(get(categories))
        .filter(([, category]) => category?.isArchive)
        .map(([id]) => id)
    const hymnCategoryIds = get(special).hymnCategoryIds || []

    const decks: ShowList[] = getLocalHymnDecks(keysToID(get(shows)), hymnCategoryIds, archivedCategoryIds, hiddenCategoryIds)
    const activeCategory = get(drawerTabsData).hymns?.activeSubTab || null
    const liveShowId = getFirstActiveOutput()?.out?.slide?.id || null

    const resolution = resolveHymnCommand(command, { decks, activeCategory, liveShowId, lastCommand, now })

    // repeated chunks / already-live: no action, no feedback spam
    if (resolution.status === "duplicate" || resolution.status === "already_live") return resolution

    // record dedupe for any actionable or reportable outcome
    lastCommand = { number: command.number, time: now }

    const label = `Hymn ${command.number}${resolution.showName ? " — " + resolution.showName : ""}`

    if (resolution.status === "activate" && resolution.showId) {
        try {
            await startShow(resolution.showId)
            newToast(translateText("hymns.voice_presented", null, [String(command.number)]))
            addHymnSuggestion(command, label, "presented")
        } catch (err) {
            console.error("Failed to present hymn command:", err)
            newToast(translateText("hymns.voice_error"))
            addHymnSuggestion(command, label, "error")
        }
    } else if (resolution.status === "unavailable") {
        newToast(translateText("hymns.voice_unavailable", null, [String(command.number)]))
        addHymnSuggestion(command, label, "unavailable")
    } else if (resolution.status === "ambiguous") {
        newToast(translateText("hymns.voice_ambiguous", null, [String(command.number)]))
        addHymnSuggestion(command, label, "ambiguous")
    }

    return resolution
}

function addHymnSuggestion(command: HymnCommand, content: string, action: string) {
    const suggestion: AiSuggestion = {
        id: uid(5),
        kind: "hymn",
        action,
        content,
        timestamp: Date.now(),
        confidence: command.confidence,
        rationale: command.rationale
    }

    aiSuggestions.update((list) => {
        const now = Date.now()
        let active = list.filter((a) => now - a.timestamp < SUGGESTION_MAX_AGE)
        active = active.filter((a) => a.content !== content)
        return [suggestion, ...active].slice(0, SUGGESTION_LIMIT)
    })
}

/** Test / session helper: forget the last processed command. */
export function resetHymnCommandDedupe() {
    lastCommand = null
}
