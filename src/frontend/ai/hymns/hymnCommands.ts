import type { ShowList } from "../../../types/Show"
import { filterHymnDecks, getHymnNumber } from "../../components/drawer/hymns/hymns"
import { normalizeNumbers } from "../scripture/numbers"

/**
 * Beacon Worship — explicit local voice hymn-number commands.
 *
 * These are deliberate operator commands ("hymn 108", "hymn number 108"), NOT inferred
 * content matches. They are resolved against the LOCAL hymn library only and never go
 * through the LLM fallback. Pure detection + resolution live here and are unit-tested;
 * side effects (startShow / toasts / suggestions) live in hymnCommandHandler.ts.
 */

export interface HymnCommand {
    number: number
    confidence: number
    rationale: string
    raw: string
}

// "hymn 108", "hymns number 108", "hymnal no. 108", "hymn #108".
// normalizeNumbers() first turns spoken numbers ("one hundred eight") into digits.
const HYMN_COMMAND_REGEX = /\b(?:hymns?|hymnal)\s*(?:number|no\.?|#)?\s*(\d{1,4})\b/i
// Nemotron often hears "hymn" as "him" / "hum". Require "number" or 2+ digits so
// "give him 2" does not fire, while "him 108" / "him number 8" still do.
const HYMN_MISHEAR_REGEX = /\b(?:him|hum)\s+(?:(?:number|no\.?|#)\s*(\d{1,4})|(\d{2,4}))\b/i

export function detectHymnCommand(text: string): HymnCommand | null {
    if (!text || !text.trim()) return null

    const normalized = normalizeNumbers(text)
    const match = normalized.match(HYMN_COMMAND_REGEX) || normalized.match(HYMN_MISHEAR_REGEX)
    if (!match) return null

    const number = Number(match[1] || match[2])
    if (!Number.isFinite(number) || number <= 0) return null

    const explicitNumberWord = /\b(?:number|no\.?|#)/i.test(match[0])
    const raw = match[0].trim()

    return {
        number,
        confidence: explicitNumberWord ? 98 : 92,
        rationale: explicitNumberWord ? `Explicit hymn-number command: "${raw}".` : `Explicit hymn command: "${raw}".`,
        raw
    }
}

export type HymnCommandStatus = "activate" | "unavailable" | "ambiguous" | "duplicate" | "already_live"

export interface HymnCommandResolution {
    status: HymnCommandStatus
    showId?: string
    showName?: string
    candidates?: ShowList[]
}

export interface ResolveHymnOptions {
    /** local hymn decks (already filtered to hymn decks) */
    decks: ShowList[]
    /** active Hymns sub-tab category, used to disambiguate duplicate numbers */
    activeCategory?: string | null
    /** show id currently live on the first active output, if any */
    liveShowId?: string | null
    /** last processed command, for transcript-chunk dedupe */
    lastCommand?: { number: number; time: number } | null
    now?: number
    dedupeMs?: number
}

export const HYMN_COMMAND_DEDUPE_MS = 15000

/** Resolve a detected hymn command against the local library. Pure — no side effects. */
export function resolveHymnCommand(command: HymnCommand, options: ResolveHymnOptions): HymnCommandResolution {
    const { decks, activeCategory = null, liveShowId = null, lastCommand = null, now = Date.now(), dedupeMs = HYMN_COMMAND_DEDUPE_MS } = options

    // repeated transcript chunks for the same hymn within the window are ignored
    if (lastCommand && lastCommand.number === command.number && now - lastCommand.time < dedupeMs) {
        return { status: "duplicate" }
    }

    const matches = (decks || []).filter((deck) => getHymnNumber(deck) === command.number)
    if (!matches.length) return { status: "unavailable" }

    // prefer the hymn book the operator is currently browsing, if it narrows to one
    let chosen = matches
    if (activeCategory && activeCategory !== "all" && activeCategory !== "unlabeled") {
        const inCategory = matches.filter((deck) => deck.category === activeCategory)
        if (inCategory.length) chosen = inCategory
    }

    if (chosen.length > 1) return { status: "ambiguous", candidates: chosen }

    const show = chosen[0]
    if (liveShowId && show.id === liveShowId) return { status: "already_live", showId: show.id, showName: show.name }

    return { status: "activate", showId: show.id, showName: show.name }
}

/** Convenience: filter a raw show list down to local hymn decks for command resolution. */
export function getLocalHymnDecks(shows: ShowList[], hymnCategoryIds: string[] = [], archivedCategoryIds: string[] = [], hiddenCategoryIds: string[] = []): ShowList[] {
    return filterHymnDecks(shows, { category: "all", hymnCategoryIds, archivedCategoryIds, hiddenCategoryIds })
}
