import { describe, expect, it } from "vitest"
import { normalizeMishearings } from "./mishearings"

describe("normalizeMishearings", () => {
    it("maps Ghanaian/ASR book names used in live preaching", () => {
        expect(normalizeMishearings("Hosiah chapter 1")).toContain("hosea")
        expect(normalizeMishearings("Donut chapter 1")).toContain("jonah")
        expect(normalizeMishearings("Isiah 40 verse 8")).toContain("isaiah")
        expect(normalizeMishearings("Obadayah 1")).toContain("obadiah")
        expect(normalizeMishearings("Zachariah 4")).toContain("zechariah")
        expect(normalizeMishearings("Habakuk 2")).toContain("habakkuk")
        expect(normalizeMishearings("Deutronomy 6")).toContain("deuteronomy")
        expect(normalizeMishearings("Malakai 3")).toContain("malachi")
    })

    it("does not rewrite ordinary English", () => {
        expect(normalizeMishearings("a number of people")).toBe("a number of people")
        expect(normalizeMishearings("turn with me to John")).toBe("turn with me to john")
        expect(normalizeMishearings("for God so loved the world")).toBe("for god so loved the world")
    })

    it("still hears 'chapter for' as chapter four", () => {
        expect(normalizeMishearings("John chapter for")).toBe("john chapter four")
    })
})
