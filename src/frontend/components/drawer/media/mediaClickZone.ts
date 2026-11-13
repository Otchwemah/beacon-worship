// Beacon Worship — media card click zones.
//
// The operator asked for two distinct single-click behaviours on a media tile:
//   * clicking the surround (label, padding, border area) -> preview in the Show panel ONLY
//   * clicking the middle of the artwork               -> preview AND send to live output
//
// Kept pure and fractional so it is unit testable and independent of tile size, zoom level
// or grid/list mode.

export type MediaClickZone = "preview" | "live"

// The centre region that goes live, as a fraction of the tile measured from each edge.
// 0.22 leaves a comfortable surround on a small tile without making the live target tiny.
export const LIVE_ZONE_INSET = 0.22

export interface Rect {
    x: number
    y: number
    width: number
    height: number
}

export interface Point {
    x: number
    y: number
}

/**
 * @param point  viewport coordinates of the click
 * @param rect   viewport bounding box of the whole tile (artwork + label)
 */
export function getMediaClickZone(point: Point, rect: Rect): MediaClickZone {
    if (!rect || rect.width <= 0 || rect.height <= 0) return "preview"

    const insetX = rect.width * LIVE_ZONE_INSET
    const insetY = rect.height * LIVE_ZONE_INSET

    const insideX = point.x >= rect.x + insetX && point.x <= rect.x + rect.width - insetX
    const insideY = point.y >= rect.y + insetY && point.y <= rect.y + rect.height - insetY

    return insideX && insideY ? "live" : "preview"
}

// Convenience for a MouseEvent + element, so callers do not repeat the rect plumbing.
export function zoneFromEvent(e: { clientX: number; clientY: number }, elem: Element | null | undefined): MediaClickZone {
    if (!elem?.getBoundingClientRect) return "preview"
    const r = elem.getBoundingClientRect()
    return getMediaClickZone({ x: e.clientX, y: e.clientY }, { x: r.left, y: r.top, width: r.width, height: r.height })
}
