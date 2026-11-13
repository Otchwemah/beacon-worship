import { get } from "svelte/store"
import { outputs, showsCache } from "../../../stores"
import { getActiveOutputs, setOutput } from "../../helpers/output"
import { getLayoutRef } from "../../helpers/show"
import { updateOut } from "../../helpers/showActions"
import { prepareLiveOverride } from "../../output/liveOverride"

// Beacon Worship — send a deck live.
//
// Extracted from ShowButton.doubleClick's "show" branch so the Hymns GRID tiles and the
// Hymns/Shows LIST rows share one code path. Duplicating it would let the grid drift from the
// list on the live-override policy, the already-live guard, or Alt-to-bypass.

export type PresentDeckResult = "presented" | "already-live" | "unavailable"

/**
 * @param showId deck to present
 * @param extra false when Alt is held — skips updateOut's extra actions, and the override
 */
export function presentDeck(showId: string, extra = true): PresentDeckResult {
    const cache = get(showsCache)
    const show = cache[showId]
    const layoutId = show?.settings?.activeLayout

    if (!show?.settings || !layoutId || !show.layouts?.[layoutId]?.slides?.length) return "unavailable"

    const outputId = getActiveOutputs(get(outputs), false, true, true)[0]
    const currentOutput = get(outputs)[outputId] || ({} as any)

    const layoutRef = getLayoutRef(showId)
    const firstEnabledIndex = layoutRef.findIndex((a: any) => !a.data.disabled)

    // Already live at this exact slide: no-op. This check MUST come before the override,
    // otherwise clearing first would blank the output and then return.
    const slide = currentOutput.out?.slide || null
    if (slide?.id === showId && slide?.index === firstEnabledIndex && slide?.layout === layoutId) return "already-live"

    if (extra) prepareLiveOverride()

    updateOut(showId, firstEnabledIndex, layoutRef, extra)
    setOutput("slide", { id: showId, layout: layoutId, index: firstEnabledIndex })

    return "presented"
}
