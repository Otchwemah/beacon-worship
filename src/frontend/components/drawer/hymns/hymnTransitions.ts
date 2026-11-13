// Beacon Worship — hymn slide transitions.
//
// The PowerPoint importer used to stamp every layout slide with
//     transition: { type: "none", duration: 0, easing: "linear" }
// and output.ts getOutputTransitions() resolves a slide transition with
//     slideData?.transition?.type ? slideData.transition : null
// "none" is a truthy string, so that per-slide value always won over the style transition and
// the global transition setting. Result: hymn decks never animated, and changing the
// transition in Settings appeared to do nothing.
//
// New imports simply omit the transition so it inherits. This module repairs decks that were
// already imported with the hardcoded value.

export type SlideTransition = { type?: string; duration?: number; easing?: string } | null | undefined

// The exact shape the old importer wrote. Anything else is a deliberate operator choice
// (including a hand-set "none") and must be left alone.
const IMPORTER_TRANSITION_DURATION = 0

export function isImporterDisabledTransition(transition: SlideTransition): boolean {
    if (!transition || typeof transition !== "object") return false
    return transition.type === "none" && (transition.duration ?? 0) === IMPORTER_TRANSITION_DURATION
}

export type LayoutLike = { slides?: any[]; [key: string]: any }
export type ShowLike = { origin?: string; slides?: Record<string, any>; layouts?: Record<string, LayoutLike>; [key: string]: any }

/**
 * Remove the importer's hardcoded "no transition" from a deck so it inherits the operator's
 * transition again. Pure: returns new objects, never mutates the input.
 *
 * @returns slides/layouts plus how many entries were repaired
 */
export function repairHymnTransitions(show: ShowLike): { layouts: Record<string, LayoutLike>; changed: number } {
    let changed = 0
    const layouts: Record<string, LayoutLike> = {}

    for (const [id, layout] of Object.entries(show?.layouts || {})) {
        if (!Array.isArray(layout?.slides)) {
            layouts[id] = layout
            continue
        }

        const slides = layout.slides.map((layoutSlide: any) => {
            if (!layoutSlide || typeof layoutSlide !== "object") return layoutSlide

            let copy = layoutSlide
            let touched = false

            if (isImporterDisabledTransition(layoutSlide.transition)) {
                if (copy === layoutSlide) copy = { ...layoutSlide }
                delete copy.transition
                touched = true
            }

            if (layoutSlide.children && typeof layoutSlide.children === "object") {
                const children: Record<string, any> = {}
                let childrenTouched = false

                for (const [childId, child] of Object.entries(layoutSlide.children as Record<string, any>)) {
                    if (child && typeof child === "object" && isImporterDisabledTransition(child.transition)) {
                        const childCopy = { ...child }
                        delete childCopy.transition
                        children[childId] = childCopy
                        childrenTouched = true
                    } else {
                        children[childId] = child
                    }
                }

                if (childrenTouched) {
                    if (copy === layoutSlide) copy = { ...layoutSlide }
                    copy.children = children
                    touched = true
                }
            }

            if (touched) changed++
            return copy
        })

        layouts[id] = { ...layout, slides }
    }

    return { layouts, changed }
}

// Only decks we imported are repaired. A show the operator built by hand keeps whatever
// transition they chose, even if it happens to be "none" with duration 0.
export function shouldRepairHymnTransitions(show: ShowLike, repairedIds: string[] | null | undefined, showId: string): boolean {
    if (!showId) return false
    if ((repairedIds || []).includes(showId)) return false
    return show?.origin === "powerpoint"
}
