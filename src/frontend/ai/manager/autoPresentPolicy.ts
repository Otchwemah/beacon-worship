import type { MatchResult } from "../../../types/ai/Ai"

/**
 * Beacon Worship — Scripture auto-present policy.
 *
 * Only a confidently identified, explicitly spoken Bible reference (or explicit
 * verse-navigation cue) may ever be auto-presented, and only when the operator's
 * confidence setting allows it. Everything else is a suggestion for operator
 * preview/approval:
 *
 *  - inferred / paraphrased verse-content matches  -> never auto-present
 *  - alternative-translation matches               -> never auto-present
 *  - unclassified results (e.g. from an LLM)       -> never auto-present
 *  - non-Scripture matches                         -> never auto-present
 *
 * This module is pure and unit-tested (autoPresentPolicy.test.ts). Timing and
 * duplicate-suppression gates stay in AiManager; classification rules live here
 * so every detector path is held to the same standard.
 */

export type AutoPresentReason = "ok" | "not_scripture" | "empty_content" | "new_translation" | "inferred_content" | "unclassified" | "low_confidence"

export interface AutoPresentDecision {
    allowed: boolean
    reason: AutoPresentReason
}

/**
 * Decide whether a match may be auto-presented.
 * @param match              the detector result
 * @param confidenceThreshold minimum confidence (exclusive) required by the operator's setting
 */
export function evaluateAutoPresent(match: MatchResult, confidenceThreshold: number): AutoPresentDecision {
    if (match.type !== "scripture") return { allowed: false, reason: "not_scripture" }
    if (!match.content) return { allowed: false, reason: "empty_content" }

    // alternative translations are always operator-approved, never live
    if (match.scriptureIsNewTranslation) return { allowed: false, reason: "new_translation" }

    // robustly typed classification — never inferred from missing metadata
    if (match.scriptureMatchType === "content") return { allowed: false, reason: "inferred_content" }
    if (match.scriptureMatchType !== "reference") return { allowed: false, reason: "unclassified" }

    if (!Number.isFinite(match.confidence) || match.confidence <= confidenceThreshold) return { allowed: false, reason: "low_confidence" }

    return { allowed: true, reason: "ok" }
}

/** Human-readable explanation of a decision, for the operator UI. */
export function autoPresentReasonText(reason: AutoPresentReason): string {
    switch (reason) {
        case "ok":
            return "Explicit reference — eligible for auto-present"
        case "not_scripture":
            return "Not a Scripture match"
        case "empty_content":
            return "Empty match"
        case "new_translation":
            return "Alternative translation — preview only"
        case "inferred_content":
            return "Inferred verse content — preview only"
        case "unclassified":
            return "Unclassified match — preview only"
        case "low_confidence":
            return "Below the auto-present confidence setting"
    }
}
