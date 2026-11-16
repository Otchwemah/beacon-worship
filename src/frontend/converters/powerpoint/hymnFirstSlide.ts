import type { Show } from "../../../types/Show"
import { getSlidePreview, type SlidePreview } from "../../components/inputs/showThumbnail"
import { PowerPointPackage } from "./PowerPointHelper"

// Build the Hymns-grid miniature from slide 1 only. Does not apply the Settings hymn
// background — that would paint every tile the same and hide the lyrics.

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

    return getSlidePreview(show)
}
