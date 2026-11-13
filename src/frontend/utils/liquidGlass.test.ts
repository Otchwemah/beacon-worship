import { describe, expect, it } from "vitest"
import { shouldApplyLiquidGlass } from "./liquidGlass"

describe("shouldApplyLiquidGlass", () => {
    it("is default-on for the main/control window", () => {
        expect(shouldApplyLiquidGlass(null, {})).toBe(true)
        expect(shouldApplyLiquidGlass(null, undefined)).toBe(true)
        expect(shouldApplyLiquidGlass(null, null)).toBe(true)
        expect(shouldApplyLiquidGlass(null, { liquidGlass: true })).toBe(true)
    })

    it("never applies to audience/output windows", () => {
        expect(shouldApplyLiquidGlass("output", {})).toBe(false)
        expect(shouldApplyLiquidGlass("output", { liquidGlass: true })).toBe(false)
    })

    it("never applies to the PDF export window", () => {
        expect(shouldApplyLiquidGlass("pdf", {})).toBe(false)
    })

    it("can be disabled by the operator", () => {
        expect(shouldApplyLiquidGlass(null, { liquidGlass: false })).toBe(false)
    })
})
