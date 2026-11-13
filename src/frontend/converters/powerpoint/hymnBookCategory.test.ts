import { describe, expect, it } from "vitest"
import { hymnBookCategoryId } from "./hymnBookCategory"

// The id rule must match createCategory() in converters/importHelpers.ts exactly, otherwise
// a folder import registers one category as a hymn book while a different one gets created.
const createCategoryIdRule = (name: string) =>
    name
        .toLowerCase()
        .replace(/[()]/g, "")
        .trim()
        .replace(/\s+/g, "_")

describe("hymnBookCategoryId", () => {
    it("matches the createCategory id rule for realistic folder names", () => {
        const names = ["PHB 2019", "Presbyterian Hymn Book", "Hymns (Old)", "  Methodist  Hymns  ", "Twi Hymns", "Ga Hymnal", "PHB_2019", "hymns"]
        names.forEach((name) => {
            expect(hymnBookCategoryId(name), name).toBe(createCategoryIdRule(name))
        })
    })

    it("lowercases and underscores spaces", () => {
        expect(hymnBookCategoryId("PHB 2019")).toBe("phb_2019")
    })

    it("strips parentheses", () => {
        expect(hymnBookCategoryId("Hymns (Old)")).toBe("hymns_old")
    })

    it("collapses runs of whitespace", () => {
        expect(hymnBookCategoryId("  Methodist   Hymns  ")).toBe("methodist_hymns")
    })

    it("leaves an existing underscore id untouched", () => {
        expect(hymnBookCategoryId("phb_2019")).toBe("phb_2019")
    })

    it("returns empty string for empty input so the caller can bail out", () => {
        expect(hymnBookCategoryId("")).toBe("")
        expect(hymnBookCategoryId("   ")).toBe("")
    })
})
