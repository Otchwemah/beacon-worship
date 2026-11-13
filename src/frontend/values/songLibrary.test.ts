import { describe, expect, it } from "vitest"
import { CHRISTMAS_CAROLS } from "./carols"
import { CLASSIC_HYMNS } from "./classicHymns"
import { LIBRARY_CATEGORIES, buildLibraryShow, getMissingSongs, libraryShowId, normaliseTitle } from "./songLibrary"

describe("song library data", () => {
    it("ships a substantial library", () => {
        expect(CHRISTMAS_CAROLS.length).toBeGreaterThanOrEqual(30)
        expect(CLASSIC_HYMNS.length).toBeGreaterThanOrEqual(50)
    })

    it("has unique ids and titles across both collections", () => {
        const all = [...CHRISTMAS_CAROLS, ...CLASSIC_HYMNS]
        expect(new Set(all.map((a) => a.id)).size).toBe(all.length)
        expect(new Set(all.map((a) => normaliseTitle(a.title))).size).toBe(all.length)
    })

    it("every song has a title and at least one non-empty verse", () => {
        for (const song of [...CHRISTMAS_CAROLS, ...CLASSIC_HYMNS]) {
            expect(song.title.length).toBeGreaterThan(0)
            expect(song.verses.length).toBeGreaterThan(0)
            for (const verse of song.verses) expect(verse.trim().length).toBeGreaterThan(0)
        }
    })

    it("marks every text as public domain", () => {
        const show = buildLibraryShow("hymns", CLASSIC_HYMNS[0])
        expect(show.meta.copyright).toBe("Public Domain")
    })
})

describe("buildLibraryShow", () => {
    const song = {
        id: "test_song",
        title: "Test Song",
        author: "Anon",
        verses: ["Verse one line", "Verse two line"],
        chorus: "Chorus line"
    }

    it("puts the TITLE slide first so the deck thumbnail is a readable name card", () => {
        const show = buildLibraryShow("carols", song)
        const layout = show.layouts[show.settings.activeLayout]
        const first = show.slides[layout.slides[0].id]
        const text = first.items.map((item: any) => item.lines.map((l: any) => l.text[0].value).join("")).join(" ")
        expect(text).toContain("Test Song")
        expect(first.group).toBe("intro")
    })

    it("interleaves verse and chorus", () => {
        const show = buildLibraryShow("carols", song)
        const layout = show.layouts[show.settings.activeLayout]
        const groups = layout.slides.map((s: any) => show.slides[s.id].group)
        expect(groups).toEqual(["intro", "verse", "chorus", "verse", "chorus"])
    })

    it("stores the chorus once and re-references it, so edits apply to every repeat", () => {
        const show = buildLibraryShow("carols", song)
        const layout = show.layouts[show.settings.activeLayout]
        const chorusRefs = layout.slides.filter((s: any) => show.slides[s.id].group === "chorus")
        expect(chorusRefs).toHaveLength(2)
        expect(chorusRefs[0].id).toBe(chorusRefs[1].id)
        expect(Object.values(show.slides).filter((s: any) => s.group === "chorus")).toHaveLength(1)
    })

    it('chorusAfter:"last" only adds the chorus at the end', () => {
        const show = buildLibraryShow("hymns", { ...song, chorusAfter: "last" })
        const layout = show.layouts[show.settings.activeLayout]
        expect(layout.slides.map((s: any) => show.slides[s.id].group)).toEqual(["intro", "verse", "verse", "chorus"])
    })

    it("handles a hymn with no chorus", () => {
        const show = buildLibraryShow("hymns", { id: "x", title: "No Chorus", verses: ["a", "b", "c"] })
        const layout = show.layouts[show.settings.activeLayout]
        expect(layout.slides.map((s: any) => show.slides[s.id].group)).toEqual(["intro", "verse", "verse", "verse"])
    })

    it("produces deterministic ids so re-installing is idempotent", () => {
        expect(JSON.stringify(buildLibraryShow("hymns", song))).toBe(JSON.stringify(buildLibraryShow("hymns", song)))
        expect(libraryShowId("carols", "abc")).toBe("beacon_carols_abc")
    })

    it("assigns the right category and library origin", () => {
        expect(buildLibraryShow("carols", song).category).toBe(LIBRARY_CATEGORIES.carols.id)
        expect(buildLibraryShow("hymns", song).category).toBe(LIBRARY_CATEGORIES.hymns.id)
        expect(buildLibraryShow("hymns", song).origin).toBe("beacon-library")
    })

    it("keeps lyric text inside a 1920x1080 slide and auto-shrinks long verses", () => {
        const show = buildLibraryShow("hymns", song)
        const lyric = Object.values(show.slides).find((s: any) => s.group === "verse") as any
        expect(lyric.items[0].textFit).toBe("shrinkToFit")
        const style: string = lyric.items[0].style
        expect(style).toContain("width:1760px")
        expect(style).toContain("height:920px")
    })

    it("splits every lyric line into its own line entry", () => {
        const show = buildLibraryShow("hymns", { id: "m", title: "Multi", verses: ["one\ntwo\nthree"] })
        const lyric = Object.values(show.slides).find((s: any) => s.group === "verse") as any
        expect(lyric.items[0].lines.map((l: any) => l.text[0].value)).toEqual(["one", "two", "three"])
    })
})

describe("getMissingSongs — never duplicates", () => {
    const songs = [
        { id: "a", title: "Amazing Grace", verses: ["v"] },
        { id: "b", title: "Holy, Holy, Holy", verses: ["v"] }
    ]

    it("returns everything for an empty library", () => {
        expect(getMissingSongs("hymns", songs, [])).toHaveLength(2)
    })

    it("skips a song already installed by the library", () => {
        const existing = [{ name: "Amazing Grace", origin: "beacon-library", category: "classic_hymns" }]
        expect(getMissingSongs("hymns", songs, existing).map((a) => a.id)).toEqual(["b"])
    })

    it("skips a song the user already had in that category, even from another source", () => {
        const existing = [{ name: "Amazing Grace", category: "classic_hymns" }]
        expect(getMissingSongs("hymns", songs, existing).map((a) => a.id)).toEqual(["b"])
    })

    it("ignores punctuation and case when matching titles", () => {
        const existing = [{ name: "amazing grace!", origin: "beacon-library" }]
        expect(getMissingSongs("hymns", songs, existing).map((a) => a.id)).toEqual(["b"])
    })

    it("does not treat an unrelated category as a match", () => {
        const existing = [{ name: "Amazing Grace", category: "my_songs" }]
        expect(getMissingSongs("hymns", songs, existing)).toHaveLength(2)
    })

    it("tolerates malformed existing entries", () => {
        expect(getMissingSongs("hymns", songs, [null as any, {} as any])).toHaveLength(2)
    })
})
