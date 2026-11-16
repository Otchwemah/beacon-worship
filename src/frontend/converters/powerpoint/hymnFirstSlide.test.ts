import { describe, expect, it } from "vitest"
import { firstSlidePreviewFromPpt } from "./hymnFirstSlide"

describe("firstSlidePreviewFromPpt", () => {
    it("returns null for missing or empty packages", () => {
        expect(firstSlidePreviewFromPpt(null)).toBeNull()
        expect(firstSlidePreviewFromPpt({})).toBeNull()
    })
})
