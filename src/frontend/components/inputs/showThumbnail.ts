import type { Show, Slide } from "../../../types/Show"

// Beacon Worship: pure helpers for the live first-slide thumbnail fallback.
//
// Decks imported before stored previews existed (and decks whose .pptx has no usable
// docProps/thumbnail.*) have no `show.thumbnail`. For those we draw a small preview of the
// real first slide instead of a generic icon. Kept pure so it can be unit tested without
// a DOM, and kept deliberately lightweight: the full Slide.svelte pulls in the editor,
// media loader and autosize machinery, which is far too heavy for a scrolling drawer row.

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i

// A positioned, styled box from the real slide. Styles are the same absolute-pixel CSS the
// output uses, against a 1920x1080 canvas, so scaling the canvas reproduces the slide.
export interface PreviewRun {
    value: string
    style: string
}

// A slide line keeps its OWN alignment. The PowerPoint importer sets this per line and
// defaults to LEFT, so forcing centre on the whole box mis-arranges every hymn column.
export interface PreviewLine {
    align: string
    runs: PreviewRun[]
}

export interface PreviewItem {
    id: string
    style: string
    align: string
    runs: PreviewRun[]
    lines: PreviewLine[]
    src: string
    isImage: boolean
    fit: string
    // PowerPoint shapes (coloured panels, dividers, gradient rectangles) are imported as
    // type:"icon" with a normalized SVG in customSvg and NO text lines. Dropping them is
    // what removed the three GA/TWI/ENGLISH colour blocks from hymn thumbnails.
    customSvg: string
    // mirrors IconItem.svelte: when the item sets a colour, the SVG paths inherit it
    useCurrentColor: boolean
}

export interface SlidePreview {
    slideId: string
    backgroundImage: string
    backgroundColor: string
    mediaSrc: string
    text: string
    // faithful first-slide rendering
    items: PreviewItem[]
    width: number
    height: number
}

export const SLIDE_CANVAS = { width: 1920, height: 1080 }

// The first slide of the active layout, falling back to the first stored slide.
export function getFirstSlideId(show: Pick<Show, "slides" | "layouts" | "settings"> | null | undefined): string {
    if (!show?.slides) return ""

    const layoutId = show.settings?.activeLayout
    const layout = layoutId ? show.layouts?.[layoutId] : null
    const refId = layout?.slides?.[0]?.id
    if (refId && show.slides[refId]) return refId

    return Object.keys(show.slides)[0] || ""
}

// Slide text is stored as items -> lines -> text runs. Strip any inline markup so the
// preview shows words rather than tags.
export function getSlidePlainText(slide: Slide | null | undefined): string {
    if (!slide?.items?.length) return ""

    const parts: string[] = []
    for (const item of slide.items) {
        if (!item?.lines?.length) continue
        for (const line of item.lines) {
            const value = (line?.text || []).map((run) => run?.value || "").join("")
            const clean = stripTags(value).trim()
            if (clean) parts.push(clean)
        }
    }

    return parts.join("\n")
}

function stripTags(value: string): string {
    return value
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
}

// Resolve what the preview should draw. Returns null when there is nothing to show,
// so the caller can fall back to the normal icon.
export function getSlidePreview(show: Show | null | undefined): SlidePreview | null {
    const slideId = getFirstSlideId(show)
    if (!show || !slideId) return null

    const slide = show.slides[slideId]
    if (!slide) return null

    const layoutId = show.settings?.activeLayout
    const layout = layoutId ? show.layouts?.[layoutId] : null
    const layoutSlide = layout?.slides?.find((a) => a?.id === slideId)

    // an explicit slide background wins over the layout's background media
    const backgroundImage = slide.settings?.backgroundImage || (layoutSlide?.background ? show.media?.[layoutSlide.background]?.path || "" : "") || ""

    // Item types use "media" for both images and video, so also require an image extension
    // to avoid feeding a video file into an <img>.
    const mediaSrc = (slide.items || []).find((item) => item?.src && (!item.type || item.type === "media") && IMAGE_EXTENSION.test(item.src))?.src || ""

    const items = getPreviewItems(slide)
    const resolution = slide.settings?.resolution || SLIDE_CANVAS

    const preview: SlidePreview = {
        slideId,
        backgroundImage,
        backgroundColor: slide.settings?.color || "",
        mediaSrc,
        text: getSlidePlainText(slide),
        items,
        width: resolution.width || SLIDE_CANVAS.width,
        height: resolution.height || SLIDE_CANVAS.height
    }

    if (!preview.backgroundImage && !preview.backgroundColor && !preview.mediaSrc && !preview.text && !items.length) return null

    return preview
}

// Extract the slide's boxes in paint order, keeping their original CSS so the thumbnail is a
// real miniature of the slide rather than a generic text summary. Timers, clocks and other
// dynamic items are skipped: they would render as empty boxes in a static preview.
export function getPreviewItems(slide: Slide | null | undefined): PreviewItem[] {
    if (!slide?.items?.length) return []

    const out: PreviewItem[] = []

    slide.items.forEach((item, index) => {
        if (!item) return
        if (item.timer || item.timerId || item.clock || item.events) return
        // live inputs have no static appearance
        if (item.device) return

        const isImage = Boolean(item.src) && IMAGE_EXTENSION.test(item.src || "")
        // a non-image media src (video) cannot be drawn into an <img>; show its box only
        const src = isImage ? item.src || "" : ""

        const runs: PreviewRun[] = []
        const lines: PreviewLine[] = []
        for (const line of item.lines || []) {
            const lineRuns = (line?.text || []).map((run) => ({ value: run?.value || "", style: run?.style || "" }))
            if (lineRuns.some((r) => stripTags(r.value).trim().length)) {
                lines.push({ align: line?.align || "", runs: lineRuns })
                runs.push(...lineRuns)
                // preserve line breaks between lines
                runs.push({ value: "\n", style: "" })
            }
        }
        while (runs.length && runs[runs.length - 1].value === "\n") runs.pop()

        const customSvg = typeof item.customSvg === "string" ? item.customSvg : ""

        // keep anything that paints: text, an image, a shape, or a filled box
        if (!runs.length && !src && !customSvg && !item.style?.includes("background")) return

        const style = item.style || ""
        out.push({
            id: item.id || `item-${index}`,
            style,
            align: item.align || "",
            runs,
            lines,
            src,
            isImage,
            fit: item.fit || "contain",
            customSvg,
            useCurrentColor: style.includes("color:") && !style.includes("color:;")
        })
    })

    return out
}
