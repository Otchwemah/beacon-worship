import { describe, expect, it } from "vitest"
import { LIVE_ZONE_INSET, getMediaClickZone, zoneFromEvent } from "./mediaClickZone"

const rect = { x: 100, y: 200, width: 200, height: 100 }

describe("getMediaClickZone", () => {
    it("goes live when clicking the middle of the tile", () => {
        expect(getMediaClickZone({ x: 200, y: 250 }, rect)).toBe("live")
    })

    it("previews only when clicking the left surround", () => {
        expect(getMediaClickZone({ x: 105, y: 250 }, rect)).toBe("preview")
    })

    it("previews only when clicking the right surround", () => {
        expect(getMediaClickZone({ x: 295, y: 250 }, rect)).toBe("preview")
    })

    it("previews only when clicking the top surround", () => {
        expect(getMediaClickZone({ x: 200, y: 203 }, rect)).toBe("preview")
    })

    it("previews only when clicking the bottom label area", () => {
        expect(getMediaClickZone({ x: 200, y: 297 }, rect)).toBe("preview")
    })

    it("treats the exact corners as preview", () => {
        expect(getMediaClickZone({ x: 100, y: 200 }, rect)).toBe("preview")
        expect(getMediaClickZone({ x: 300, y: 300 }, rect)).toBe("preview")
    })

    it("includes the live-zone boundary itself", () => {
        const x = rect.x + rect.width * LIVE_ZONE_INSET
        const y = rect.y + rect.height * LIVE_ZONE_INSET
        expect(getMediaClickZone({ x, y }, rect)).toBe("live")
    })

    it("just outside the live boundary is preview", () => {
        const x = rect.x + rect.width * LIVE_ZONE_INSET - 0.5
        expect(getMediaClickZone({ x, y: 250 }, rect)).toBe("preview")
    })

    it("scales with tile size, so zoom does not change the behaviour", () => {
        const big = { x: 0, y: 0, width: 1000, height: 600 }
        expect(getMediaClickZone({ x: 500, y: 300 }, big)).toBe("live")
        expect(getMediaClickZone({ x: 50, y: 300 }, big)).toBe("preview")

        const small = { x: 0, y: 0, width: 40, height: 24 }
        expect(getMediaClickZone({ x: 20, y: 12 }, small)).toBe("live")
        expect(getMediaClickZone({ x: 2, y: 12 }, small)).toBe("preview")
    })

    it("fails safe to preview for a degenerate rect", () => {
        expect(getMediaClickZone({ x: 0, y: 0 }, { x: 0, y: 0, width: 0, height: 0 })).toBe("preview")
        expect(getMediaClickZone({ x: 0, y: 0 }, null as any)).toBe("preview")
    })
})

describe("zoneFromEvent", () => {
    const elem = { getBoundingClientRect: () => ({ left: 100, top: 200, width: 200, height: 100 }) } as any

    it("maps a centre click to live", () => {
        expect(zoneFromEvent({ clientX: 200, clientY: 250 }, elem)).toBe("live")
    })

    it("maps an edge click to preview", () => {
        expect(zoneFromEvent({ clientX: 101, clientY: 250 }, elem)).toBe("preview")
    })

    it("fails safe when there is no element", () => {
        expect(zoneFromEvent({ clientX: 200, clientY: 250 }, null)).toBe("preview")
        expect(zoneFromEvent({ clientX: 200, clientY: 250 }, undefined)).toBe("preview")
    })
})
