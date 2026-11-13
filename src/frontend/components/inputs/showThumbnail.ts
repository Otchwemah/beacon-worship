import type { Show, Slide } from "../../../types/Show"

// Beacon Worship: pure helpers for the live first-slide thumbnail fallback.
//
// Decks imported before stored previews existed (and decks whose .pptx has no usable
// docProps/thumbnail.*) have no `show.thumbnail`. For those we draw a small preview of the
// real first slide instead of a generic icon. Kept pure so it can be unit tested without
// a DOM, and kept deliberately lightweight: the full Slide.svelte pulls in the editor,
// media loader and autosize machinery, which is far too heavy for a scrolling drawer row.

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i

export interface SlidePreview {
    slideId: string
    backgroundImage: string
    backgroundColor: string
    mediaSrc: string
    text: string
}

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

    const preview: SlidePreview = {
        slideId,
        backgroundImage,
        backgroundColor: slide.settings?.color || "",
        mediaSrc,
        text: getSlidePlainText(slide)
    }

    if (!preview.backgroundImage && !preview.backgroundColor && !preview.mediaSrc && !preview.text) return null

    return preview
}
