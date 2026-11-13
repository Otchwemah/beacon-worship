import { describe, expect, it } from "vitest"
import { getFirstSlideId, getSlidePlainText, getSlidePreview } from "./showThumbnail"

const line = (value: string) => ({ align: "", text: [{ value, style: "" }] })

function makeShow(overrides: any = {}) {
    return {
        settings: { activeLayout: "L1", template: null },
        slides: {
            s1: { group: null, color: null, notes: "", settings: { color: "#101820" }, items: [{ style: "", lines: [line("Amazing grace")] }] },
            s2: { group: null, color: null, notes: "", settings: {}, items: [] }
        },
        layouts: { L1: { name: "Default", notes: "", slides: [{ id: "s1" }, { id: "s2" }] } },
        media: {},
        ...overrides
    } as any
}

describe("getFirstSlideId", () => {
    it("uses the first slide of the active layout", () => {
        expect(getFirstSlideId(makeShow())).toBe("s1")
    })

    it("follows the layout order rather than object key order", () => {
        const show = makeShow()
        show.layouts.L1.slides = [{ id: "s2" }, { id: "s1" }]
        expect(getFirstSlideId(show)).toBe("s2")
    })

    it("falls back to the first stored slide when the layout ref is stale or missing", () => {
        const show = makeShow()
        show.layouts.L1.slides = [{ id: "gone" }]
        expect(getFirstSlideId(show)).toBe("s1")
        expect(getFirstSlideId(makeShow({ layouts: {} }))).toBe("s1")
        expect(getFirstSlideId(makeShow({ settings: {} }))).toBe("s1")
    })

    it("returns empty for missing/empty shows", () => {
        expect(getFirstSlideId(null)).toBe("")
        expect(getFirstSlideId(undefined)).toBe("")
        expect(getFirstSlideId(makeShow({ slides: {} }))).toBe("")
    })
})

describe("getSlidePlainText", () => {
    it("joins text runs and lines", () => {
        const slide = { items: [{ lines: [{ text: [{ value: "Amazing " }, { value: "grace" }] }, line("how sweet")] }] } as any
        expect(getSlidePlainText(slide)).toBe("Amazing grace\nhow sweet")
    })

    it("strips inline markup and entities", () => {
        const slide = { items: [{ lines: [line("<b>Holy</b>&nbsp;Lord &amp; King")] }] } as any
        expect(getSlidePlainText(slide)).toBe("Holy Lord & King")
    })

    it("skips empty lines and media-only items", () => {
        const slide = { items: [{ src: "/img.png" }, { lines: [line("   "), line("Verse one")] }] } as any
        expect(getSlidePlainText(slide)).toBe("Verse one")
    })

    it("tolerates missing data", () => {
        expect(getSlidePlainText(null)).toBe("")
        expect(getSlidePlainText({} as any)).toBe("")
        expect(getSlidePlainText({ items: [{}] } as any)).toBe("")
    })
})

describe("getSlidePreview", () => {
    it("returns the first slide's colour and text", () => {
        const preview = getSlidePreview(makeShow())
        expect(preview).not.toBeNull()
        expect(preview!.slideId).toBe("s1")
        expect(preview!.backgroundColor).toBe("#101820")
        expect(preview!.text).toBe("Amazing grace")
    })

    it("prefers an explicit slide background over the layout background media", () => {
        const show = makeShow({ media: { m1: { path: "/layout-bg.png" } } })
        show.layouts.L1.slides[0].background = "m1"
        show.slides.s1.settings.backgroundImage = "/hymn-bg.png"
        expect(getSlidePreview(show)!.backgroundImage).toBe("/hymn-bg.png")
    })

    it("uses the layout background media when the slide has none", () => {
        const show = makeShow({ media: { m1: { path: "/layout-bg.png" } } })
        show.layouts.L1.slides[0].background = "m1"
        expect(getSlidePreview(show)!.backgroundImage).toBe("/layout-bg.png")
    })

    it("picks up an image item as the preview source", () => {
        const show = makeShow()
        show.slides.s1.items = [{ style: "", src: "/picture.png", type: "media" }]
        expect(getSlidePreview(show)!.mediaSrc).toBe("/picture.png")
    })

    it("does not use a video item as an image preview", () => {
        const show = makeShow()
        show.slides.s1.items = [{ style: "", src: "/clip.mp4", type: "media" }]
        expect(getSlidePreview(show)!.mediaSrc).toBe("")
    })

    it("returns null when there is nothing to draw so the icon fallback is used", () => {
        expect(getSlidePreview(null)).toBeNull()
        expect(getSlidePreview(makeShow({ slides: {} }))).toBeNull()
        const empty = makeShow()
        empty.slides.s1 = { settings: {}, items: [] }
        expect(getSlidePreview(empty)).toBeNull()
    })
})
