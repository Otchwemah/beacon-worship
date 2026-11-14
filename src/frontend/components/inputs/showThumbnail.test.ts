import { describe, expect, it } from "vitest"
import { getFirstSlideId, getSlidePlainText, getSlidePreview, getPreviewItems } from "./showThumbnail"

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

describe("getPreviewItems — faithful first-slide rendering", () => {
    const slide: any = {
        group: null,
        color: null,
        notes: "",
        settings: {},
        items: [
            { id: "a", style: "top:0px;left:0px;width:640px;height:1080px;", align: "text-align: center;", lines: [{ align: "", text: [{ value: "Yijiemɔ", style: "font-size:60px;color:#ffffff;" }] }] },
            { id: "b", style: "top:0px;left:640px;width:640px;height:1080px;", lines: [{ align: "", text: [{ value: "Line 1", style: "color:#00ff00;" }] }, { align: "", text: [{ value: "Line 2", style: "" }] }] },
            { id: "img", type: "media", style: "top:0;left:0;width:1920px;height:1080px;", src: "/media/bg.png", fit: "fill" },
            { id: "vid", type: "media", style: "top:0;left:0;", src: "/media/clip.mp4" },
            { id: "timer", style: "top:0;left:0;", timer: { id: "t1" } },
            { id: "cam", style: "top:0;left:0;", device: { id: "cam1", name: "Cam" } }
        ]
    }

    it("keeps original positioning and run styling so the thumbnail matches the slide", () => {
        const items = getPreviewItems(slide)
        const first = items.find((a) => a.id === "a")!
        expect(first.style).toContain("left:0px")
        expect(first.align).toBe("text-align: center;")
        expect(first.runs[0]).toEqual({ value: "Yijiemɔ", style: "font-size:60px;color:#ffffff;" })
    })

    it("preserves line breaks between lines", () => {
        const second = getPreviewItems(slide).find((a) => a.id === "b")!
        expect(second.runs.map((r) => r.value)).toEqual(["Line 1", "\n", "Line 2"])
    })

    it("includes image media with its fit", () => {
        const items = getPreviewItems(slide)
        expect(items.find((a) => a.id === "img")!.src).toBe("/media/bg.png")
        expect(items.find((a) => a.id === "img")!.fit).toBe("fill")
    })

    it("drops a video-only box: it has no static appearance to draw", () => {
        expect(getPreviewItems(slide).map((a) => a.id)).not.toContain("vid")
    })

    it("skips timers and live inputs which have no static appearance", () => {
        const ids = getPreviewItems(slide).map((a) => a.id)
        expect(ids).not.toContain("timer")
        expect(ids).not.toContain("cam")
    })

    it("returns nothing for an empty slide", () => {
        expect(getPreviewItems(null)).toEqual([])
        expect(getPreviewItems({ items: [] } as any)).toEqual([])
    })

    it("getSlidePreview exposes the canvas size and items", () => {
        const show: any = { slides: { s1: slide }, layouts: { l1: { slides: [{ id: "s1" }] } }, settings: { activeLayout: "l1" } }
        const preview = getSlidePreview(show)!
        expect(preview.width).toBe(1920)
        expect(preview.height).toBe(1080)
        expect(preview.items.length).toBeGreaterThan(0)
    })

    it("honours a custom slide resolution", () => {
        const custom: any = { ...slide, settings: { resolution: { width: 1280, height: 720 } } }
        const show: any = { slides: { s1: custom }, layouts: { l1: { slides: [{ id: "s1" }] } }, settings: { activeLayout: "l1" } }
        const preview = getSlidePreview(show)!
        expect(preview.width).toBe(1280)
        expect(preview.height).toBe(720)
    })
})

describe("faithful hymn thumbnails — shapes, alignment and gradients", () => {
    // Mirrors a real Presbyterian hymn deck: a gradient background plus three coloured
    // SVG panels (GA / TWI / ENGLISH), each with its own left-aligned lyric textbox.
    const panel = (id: string, left: number, fill: string): any => ({
        id,
        type: "icon",
        style: `top:600px;left:${left}px;width:640px;height:480px;`,
        customSvg: `<svg viewBox="0 0 1 1"><path d="M0 0 L1 0 L1 1 L0 1 Z" fill="${fill}"/></svg>`
    })
    const lyric = (id: string, left: number, value: string): any => ({
        id,
        style: `top:640px;left:${left}px;width:600px;height:400px;`,
        lines: [{ align: "text-align: left;", text: [{ value, style: "font-size:48px;color:#ffffff;" }] }]
    })

    const slide: any = {
        settings: { color: "linear-gradient(135deg, #123456 0%, #654321 100%)" },
        items: [panel("ga", 0, "#1b3a6b"), panel("twi", 640, "#1e5c3a"), panel("en", 1280, "#6b1b2a"), lyric("gaText", 20, "Mike mitsui"), lyric("twiText", 660, "Awurade, me kra"), lyric("enText", 1300, "Sing with the tongue")]
    }

    it("KEEPS the coloured SVG panels — dropping them removed the three colour divisions", () => {
        const items = getPreviewItems(slide)
        const shapes = items.filter((a) => a.customSvg)
        expect(shapes).toHaveLength(3)
        expect(shapes.map((a) => a.id)).toEqual(["ga", "twi", "en"])
        expect(shapes[0].customSvg).toContain("#1b3a6b")
    })

    it("keeps panel geometry so each colour sits under its own column", () => {
        const twi = getPreviewItems(slide).find((a) => a.id === "twi")!
        expect(twi.style).toContain("left:640px")
        expect(twi.style).toContain("width:640px")
    })

    it("paints shapes before the text that sits on them", () => {
        expect(getPreviewItems(slide).map((a) => a.id)).toEqual(["ga", "twi", "en", "gaText", "twiText", "enText"])
    })

    it("PRESERVES per-line alignment instead of forcing everything centre", () => {
        const text = getPreviewItems(slide).find((a) => a.id === "gaText")!
        expect(text.lines).toHaveLength(1)
        expect(text.lines[0].align).toBe("text-align: left;")
        expect(text.lines[0].runs[0].value).toBe("Mike mitsui")
    })

    it("keeps right and justified alignment too", () => {
        const s: any = { items: [{ id: "x", style: "top:0;left:0;", lines: [{ align: "text-align: right;", text: [{ value: "R", style: "" }] }, { align: "text-align: justify;", text: [{ value: "J", style: "" }] }] }] }
        expect(getPreviewItems(s).map((a) => a.lines[0].align)).toEqual(["text-align: right;"])
        expect(getPreviewItems(s)[0].lines.map((l) => l.align)).toEqual(["text-align: right;", "text-align: justify;"])
    })

    it("inherits the item colour for SVG paths only when a real colour is set", () => {
        const withColor: any = { items: [{ id: "a", type: "icon", style: "color:#ff0000;", customSvg: "<svg/>" }, { id: "b", type: "icon", style: "color:;", customSvg: "<svg/>" }, { id: "c", type: "icon", style: "top:0;", customSvg: "<svg/>" }] }
        const items = getPreviewItems(withColor)
        expect(items.find((a) => a.id === "a")!.useCurrentColor).toBe(true)
        expect(items.find((a) => a.id === "b")!.useCurrentColor).toBe(false)
        expect(items.find((a) => a.id === "c")!.useCurrentColor).toBe(false)
    })

    it("passes a gradient background through untouched (must be used as `background`)", () => {
        const show: any = { slides: { s1: slide }, layouts: { l1: { slides: [{ id: "s1" }] } }, settings: { activeLayout: "l1" } }
        expect(getSlidePreview(show)!.backgroundColor).toBe("linear-gradient(135deg, #123456 0%, #654321 100%)")
    })

    it("still drops an item that paints nothing at all", () => {
        const empty: any = { items: [{ id: "noop", style: "top:0;left:0;width:10px;height:10px;" }] }
        expect(getPreviewItems(empty)).toEqual([])
    })
})
