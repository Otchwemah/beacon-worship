// Beacon Worship — live-override policy (pure, no imports).
//
// Kept separate from liveOverride.ts so it can be unit tested: liveOverride.ts transitively
// imports the output/action stack, which pulls in pdfjs and needs a DOM. Same split as
// hymns/hymnSearchMirror.ts and utils/liquidGlass.ts.

export function isLiveOverrideEnabled(settings: any): boolean {
    // default ON; only an explicit false disables it
    return settings?.liveOverride !== false
}

// Content types that own the screen. Overlays, effects and audio are additive by design:
// overlays sit on top of any feed, and audio must keep playing across content changes.
const ADDITIVE_TYPES = new Set(["overlay", "effect", "audio"])

export function shouldOverrideForType(type: string | null | undefined): boolean {
    if (!type) return true // a plain show/deck
    return !ADDITIVE_TYPES.has(type)
}
