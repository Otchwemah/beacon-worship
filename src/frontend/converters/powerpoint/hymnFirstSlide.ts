import { get } from "svelte/store"
import type { Show } from "../../../types/Show"
import { getSlidePreview, type SlidePreview } from "../../components/inputs/showThumbnail"
import { special } from "../../stores"
import { PowerPointPackage } from "./PowerPointHelper"

// Build the Hymns-grid miniature from slide 1. If a hymn background is set in Settings,
// stamp it on the preview so tiles match what the operator sees after opening the deck.

export function firstSlidePreviewFromPpt(content: any): SlidePreview | null {
    if (!content) return null

    let pkg: PowerPointPackage
    try {
        pkg = new PowerPointPackage(content)
    } catch {
        return null
    }

    const presentation = pkg.getPresentation()
    const target = presentation?.slideOrder?.[0]
    if (!presentation || !target) return null

    const converted = pkg.getSlide(presentation, target)
    if (!converted?.items?.length && !converted?.bgColor) return null

    const fullBleed = (converted.items || []).find((item: any) => item?.src && /width:\s*1920px/i.test(item.style || "") && /height:\s*1080px/i.test(item.style || ""))

    const show = {
        slides: {
            preview: {
                group: ".",
                color: null,
                settings: { color: converted.bgColor || "", ...(fullBleed?.src ? { backgroundImage: fullBleed.src } : {}) },
                notes: "",
                items: converted.items || []
            }
        },
        layouts: { default: { name: "", notes: "", slides: [{ id: "preview" }] } },
        settings: { activeLayout: "default", template: null },
        media: {}
    } as Show

    const preview = getSlidePreview(show)
    if (!preview) return null

    const hymnBg = get(special).hymnBackgroundImage || ""
    if (hymnBg) return { ...preview, backgroundImage: hymnBg }
    return preview
}
