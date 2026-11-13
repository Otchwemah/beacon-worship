import { describe, expect, it } from "vitest"
import { DECK_THUMBNAIL_BASENAME, getPowerpointEntryFileName, isPowerpointDiskEntry, isPowerpointMediaEntry, isPowerpointThumbnailEntry, normalizeEntryName } from "./pptEntries"

describe("normalizeEntryName", () => {
    it("converts backslashes and strips leading ./ and slashes", () => {
        expect(normalizeEntryName("docProps\\thumbnail.jpeg")).toBe("docProps/thumbnail.jpeg")
        expect(normalizeEntryName("./docProps/thumbnail.jpeg")).toBe("docProps/thumbnail.jpeg")
        expect(normalizeEntryName("/ppt/media/image1.png")).toBe("ppt/media/image1.png")
    })

    it("tolerates non-string input", () => {
        expect(normalizeEntryName(undefined as any)).toBe("")
        expect(normalizeEntryName(null as any)).toBe("")
    })
})

describe("isPowerpointThumbnailEntry", () => {
    it("accepts the raster previews PowerPoint writes", () => {
        for (const name of ["docProps/thumbnail.jpeg", "docProps/thumbnail.jpg", "docProps/thumbnail.png", "docProps/thumbnail.gif", "docProps/thumbnail.webp", "docProps/thumbnail.bmp"]) {
            expect(isPowerpointThumbnailEntry(name)).toBe(true)
        }
    })

    it("is case insensitive and tolerates alternate separators", () => {
        expect(isPowerpointThumbnailEntry("docProps/Thumbnail.JPEG")).toBe(true)
        expect(isPowerpointThumbnailEntry("docProps\\thumbnail.png")).toBe(true)
    })

    it("rejects EMF/WMF previews Chromium cannot decode", () => {
        expect(isPowerpointThumbnailEntry("docProps/thumbnail.emf")).toBe(false)
        expect(isPowerpointThumbnailEntry("docProps/thumbnail.wmf")).toBe(false)
    })

    it("rejects unrelated entries", () => {
        expect(isPowerpointThumbnailEntry("docProps/core.xml")).toBe(false)
        expect(isPowerpointThumbnailEntry("ppt/media/thumbnail.jpeg")).toBe(false)
        expect(isPowerpointThumbnailEntry("docProps/thumbnail.jpeg.exe")).toBe(false)
    })
})

describe("isPowerpointMediaEntry / isPowerpointDiskEntry", () => {
    it("keeps media and fonts on disk", () => {
        expect(isPowerpointMediaEntry("ppt/media/image1.png")).toBe(true)
        expect(isPowerpointMediaEntry("ppt/fonts/font1.fntdata")).toBe(true)
        expect(isPowerpointMediaEntry("ppt/slides/slide1.xml")).toBe(false)
    })

    it("treats media, fonts and the preview as disk entries but leaves XML in memory", () => {
        expect(isPowerpointDiskEntry("ppt/media/video1.mp4")).toBe(true)
        expect(isPowerpointDiskEntry("ppt/fonts/font1.fntdata")).toBe(true)
        expect(isPowerpointDiskEntry("docProps/thumbnail.jpeg")).toBe(true)
        expect(isPowerpointDiskEntry("ppt/slides/slide1.xml")).toBe(false)
        expect(isPowerpointDiskEntry("docProps/thumbnail.emf")).toBe(false)
    })
})

describe("getPowerpointEntryFileName", () => {
    it("uses a distinct name for the deck preview so embedded media cannot clash", () => {
        expect(getPowerpointEntryFileName("docProps/thumbnail.jpeg")).toBe(`${DECK_THUMBNAIL_BASENAME}.jpeg`)
        expect(getPowerpointEntryFileName("docProps/thumbnail.PNG")).toBe(`${DECK_THUMBNAIL_BASENAME}.png`)
        expect(getPowerpointEntryFileName("ppt/media/thumbnail.jpeg")).toBe("thumbnail.jpeg")
    })

    it("uses the basename for media and fonts", () => {
        expect(getPowerpointEntryFileName("ppt/media/image1.png")).toBe("image1.png")
        expect(getPowerpointEntryFileName("ppt/fonts/font1.fntdata")).toBe("font1.fntdata")
    })

    it("returns null for in-memory entries and unsafe paths", () => {
        expect(getPowerpointEntryFileName("ppt/slides/slide1.xml")).toBeNull()
        expect(getPowerpointEntryFileName("docProps/thumbnail.emf")).toBeNull()
        expect(getPowerpointEntryFileName("ppt/media/")).toBeNull()
        expect(getPowerpointEntryFileName("ppt/media/../secret")).toBe("secret")
    })
})
