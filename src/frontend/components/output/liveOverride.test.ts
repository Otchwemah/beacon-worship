import { describe, expect, it } from "vitest"
import { isLiveOverrideEnabled, shouldOverrideForType } from "./liveOverridePolicy"

// The policy helpers are pure so they can be tested without a DOM or an Electron output.
// prepareLiveOverride() itself is covered by the regression harness on CI.

describe("isLiveOverrideEnabled", () => {
    it("defaults to enabled when the setting is absent", () => {
        expect(isLiveOverrideEnabled({})).toBe(true)
        expect(isLiveOverrideEnabled(undefined)).toBe(true)
        expect(isLiveOverrideEnabled(null)).toBe(true)
    })

    it("is enabled when explicitly true", () => {
        expect(isLiveOverrideEnabled({ liveOverride: true })).toBe(true)
    })

    it("is disabled only by an explicit false", () => {
        expect(isLiveOverrideEnabled({ liveOverride: false })).toBe(false)
    })

    it("ignores unrelated settings", () => {
        expect(isLiveOverrideEnabled({ liquidGlass: false, hymnCategoryIds: ["phb"] })).toBe(true)
    })

    it("does not treat falsy-but-not-false values as disabled", () => {
        // guards against a settings migration writing 0 / "" and silently turning this off
        expect(isLiveOverrideEnabled({ liveOverride: 0 })).toBe(true)
        expect(isLiveOverrideEnabled({ liveOverride: "" })).toBe(true)
    })
})

describe("shouldOverrideForType", () => {
    it("overrides for content that owns the screen", () => {
        ;["show", "image", "video", "pdf", "player", "scripture"].forEach((type) => {
            expect(shouldOverrideForType(type), type).toBe(true)
        })
    })

    it("treats a plain deck (no type) as content", () => {
        expect(shouldOverrideForType(undefined)).toBe(true)
        expect(shouldOverrideForType(null)).toBe(true)
        expect(shouldOverrideForType("")).toBe(true)
    })

    it("never overrides for overlays — they layer on top of any feed", () => {
        expect(shouldOverrideForType("overlay")).toBe(false)
        expect(shouldOverrideForType("effect")).toBe(false)
    })

    it("never overrides for audio — it keeps playing in the background", () => {
        expect(shouldOverrideForType("audio")).toBe(false)
    })
})
