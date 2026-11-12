import { describe, expect, it } from "vitest"
import type { MatchResult } from "../../../types/ai/Ai"
import { autoPresentReasonText, evaluateAutoPresent } from "./autoPresentPolicy"

const explicitReference: MatchResult = {
    type: "scripture",
    content: "John 3:16",
    confidence: 98,
    scriptureMatchType: "reference"
}

describe("evaluateAutoPresent — Beacon Worship Scripture live policy", () => {
    it("allows a confidently identified explicit reference above the threshold", () => {
        const decision = evaluateAutoPresent(explicitReference, 95)
        expect(decision.allowed).toBe(true)
        expect(decision.reason).toBe("ok")
    })

    it("blocks inferred/paraphrased verse-content matches even at high confidence", () => {
        const match: MatchResult = { ...explicitReference, confidence: 98, scriptureMatchType: "content" }
        const decision = evaluateAutoPresent(match, 50)
        expect(decision.allowed).toBe(false)
        expect(decision.reason).toBe("inferred_content")
    })

    it("blocks alternative-translation matches even when explicitly referenced", () => {
        const match: MatchResult = { ...explicitReference, scriptureIsNewTranslation: true, scriptureTranslation: "kjv" }
        const decision = evaluateAutoPresent(match, 50)
        expect(decision.allowed).toBe(false)
        expect(decision.reason).toBe("new_translation")
    })

    it("blocks unclassified results (missing scriptureMatchType), e.g. from an LLM", () => {
        const match: MatchResult = { type: "scripture", content: "John 3:16", confidence: 99 }
        const decision = evaluateAutoPresent(match, 50)
        expect(decision.allowed).toBe(false)
        expect(decision.reason).toBe("unclassified")
    })

    it("blocks non-Scripture matches", () => {
        for (const type of ["scripture_version", "lyrics", "quote", "announcement", "empty"] as const) {
            const decision = evaluateAutoPresent({ ...explicitReference, type }, 50)
            expect(decision.allowed).toBe(false)
            expect(decision.reason).toBe("not_scripture")
        }
    })

    it("blocks explicit references at or below the confidence threshold", () => {
        expect(evaluateAutoPresent({ ...explicitReference, confidence: 95 }, 95).reason).toBe("low_confidence")
        expect(evaluateAutoPresent({ ...explicitReference, confidence: 75 }, 95).reason).toBe("low_confidence")
        expect(evaluateAutoPresent({ ...explicitReference, confidence: 96 }, 95).allowed).toBe(true)
    })

    it("blocks empty content and non-finite confidence", () => {
        expect(evaluateAutoPresent({ ...explicitReference, content: "" }, 50).reason).toBe("empty_content")
        expect(evaluateAutoPresent({ ...explicitReference, confidence: NaN }, 50).reason).toBe("low_confidence")
        expect(evaluateAutoPresent({ ...explicitReference, confidence: Infinity }, 50).reason).toBe("low_confidence")
    })

    it("provides operator-readable rationale for every decision", () => {
        for (const reason of ["ok", "not_scripture", "empty_content", "new_translation", "inferred_content", "unclassified", "low_confidence"] as const) {
            expect(autoPresentReasonText(reason).length).toBeGreaterThan(0)
        }
    })
})
