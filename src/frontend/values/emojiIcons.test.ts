import { describe, expect, it } from "vitest"
import { drawerTabs } from "./tabs"
import { emojiIcons, getEmojiIcon, hasEmojiIcon } from "./emojiIcons"

// Beacon Worship: emoji are scoped to the main navigation. These tests lock that scope so
// a later "make everything emoji" change cannot silently break small toolbar glyphs.

describe("emojiIcons — navigation coverage", () => {
    it("has an emoji for every drawer tab icon", () => {
        Object.entries(drawerTabs).forEach(([id, tab]) => {
            expect(hasEmojiIcon(tab.icon), `drawer tab '${id}' (icon '${tab.icon}') should have an emoji`).toBe(true)
        })
    })

    it("has an emoji for the top show/edit/stage buttons", () => {
        ;["show", "edit", "stage"].forEach((id) => {
            expect(hasEmojiIcon(id), `top button '${id}' should have an emoji`).toBe(true)
        })
    })

    it("leaves utility glyphs on SVG", () => {
        // these must NOT get emoji: they are small, need recolouring, or must align precisely
        ;["close", "back", "next", "previous", "search", "undo", "redo", "add", "remove", "check", "arrowDown", "drag", "draw", "settings"].forEach((id) => {
            expect(hasEmojiIcon(id), `'${id}' should stay an SVG icon`).toBe(false)
        })
    })

    it("returns an empty string for unmapped ids so Icon.svelte can fall back", () => {
        expect(getEmojiIcon("close")).toBe("")
        expect(getEmojiIcon("totally-unknown-icon")).toBe("")
        expect(getEmojiIcon("")).toBe("")
    })

    it("maps hymns and its icon id 'book' to the same glyph", () => {
        expect(getEmojiIcon("hymns")).toBe(getEmojiIcon("book"))
        expect(drawerTabs.hymns.icon).toBe("book")
    })

    it("uses distinct glyphs for every drawer tab", () => {
        const glyphs = Object.values(drawerTabs).map((tab) => getEmojiIcon(tab.icon))
        expect(new Set(glyphs).size, "each tab should be visually distinguishable").toBe(glyphs.length)
    })

    it("contains only non-empty single grapheme values", () => {
        Object.entries(emojiIcons).forEach(([id, glyph]) => {
            expect(glyph.length, `'${id}' glyph should not be empty`).toBeGreaterThan(0)
            // emoji here are 1-2 code points plus optional variation selector / ZWJ sequences
            expect(glyph.trim(), `'${id}' glyph should have no surrounding whitespace`).toBe(glyph)
        })
    })
})

describe("drawerTabs — Beacon Worship workflow order", () => {
    it("orders tabs shows, media, hymns, scripture, sermon, audio, overlays, templates, calendar, functions", () => {
        expect(Object.keys(drawerTabs)).toEqual(["shows", "media", "hymns", "scripture", "sermon", "audio", "overlays", "templates", "calendar", "functions"])
    })

    it("puts Hymns on Ctrl/Cmd+3, Scripture on Ctrl/Cmd+4, Sermon on Ctrl/Cmd+5", () => {
        const keys = Object.keys(drawerTabs)
        expect(keys.indexOf("hymns") + 1).toBe(3)
        expect(keys.indexOf("scripture") + 1).toBe(4)
        expect(keys.indexOf("sermon") + 1).toBe(5)
    })

    it("keeps the first nine tabs on Ctrl+1..9, with Functions click-only", () => {
        expect(Object.keys(drawerTabs).length).toBe(10)
        expect(Object.keys(drawerTabs)[8]).toBe("calendar")
        expect(Object.keys(drawerTabs)[9]).toBe("functions")
    })
})
