import { writable } from "svelte/store"

/**
 * Beacon Worship — Sermon operator console (Pewbeam/Loghema-style workflow).
 *
 * Manual (default): detections appear as cards. Nothing goes to the projector until
 * the operator previews it and presses Play / Go Live.
 * Auto: explicit spoken references may auto-present under the existing Scripture policy.
 * Paraphrases are always preview-only.
 */

export type SermonMode = "manual" | "auto"

export interface SermonVerse {
    id: string
    reference: string
    text: string
    confidence: number
    matchType?: "reference" | "content"
    timestamp: number
    kind?: "scripture" | "hymn"
    hymnShowId?: string
}

export const sermonMode = writable<SermonMode>("manual")
export const sermonGoLive = writable(false)
export const sermonPreview = writable<SermonVerse | null>(null)
export const sermonQueue = writable<SermonVerse[]>([])
export const sermonLive = writable<SermonVerse | null>(null)

export function verseFromSuggestion(suggestion: { id: string; content: string; confidence: number; scriptureMatchType?: "reference" | "content"; timestamp: number; kind?: string; hymnShowId?: string }, text = ""): SermonVerse {
    return {
        id: suggestion.id,
        reference: suggestion.content,
        text,
        confidence: suggestion.confidence,
        matchType: suggestion.scriptureMatchType,
        timestamp: suggestion.timestamp,
        kind: suggestion.kind === "hymn" ? "hymn" : "scripture",
        hymnShowId: suggestion.hymnShowId
    }
}

export function enqueueVerse(queue: SermonVerse[], verse: SermonVerse): SermonVerse[] {
    if (queue.some((item) => item.reference === verse.reference)) return queue
    return [verse, ...queue].slice(0, 40)
}

export function removeQueuedVerse(queue: SermonVerse[], id: string): SermonVerse[] {
    return queue.filter((item) => item.id !== id)
}
