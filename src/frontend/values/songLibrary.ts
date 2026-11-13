// Beacon Worship — built-in song library (Christmas carols + classic hymns).
//
// This module is deliberately import-free (types only) so it can be unit tested without
// pulling in Svelte stores / pdfjs. `installSongLibrary.ts` does the store wiring.
//
// Every text here is PUBLIC DOMAIN (authors died before 1955, texts published before 1929).
// No CCLI-covered modern lyrics are bundled.

import type { Item, Show, Slide } from "../../types/Show"

export interface LibrarySong {
    id: string
    title: string
    author?: string
    composer?: string
    year?: string
    verses: string[]
    chorus?: string
    // "each" (default) repeats the chorus after every verse; "last" only after the final verse
    chorusAfter?: "each" | "last"
}

export type LibraryCollection = "carols" | "hymns"

export const LIBRARY_CATEGORIES: Record<LibraryCollection, { id: string; name: string; icon: string }> = {
    carols: { id: "christmas_carols", name: "Christmas Carols", icon: "song" },
    hymns: { id: "classic_hymns", name: "Classic Hymns", icon: "song" }
}

// A slide is 1920x1080. One centred text box with room to breathe, auto-shrinking so long
// verses still fit without the operator having to reformat anything.
const LYRIC_BOX = "top:80px;left:80px;height:920px;width:1760px;"
const TITLE_BOX = "top:330px;left:80px;height:280px;width:1760px;"
const CREDIT_BOX = "top:640px;left:80px;height:200px;width:1760px;"

const LYRIC_STYLE = "font-size:72px;"
const TITLE_STYLE = "font-size:110px;font-weight:bold;"
const CREDIT_STYLE = "font-size:44px;opacity:0.75;"

// Deterministic ids keep re-installs idempotent and make the unit tests stable.
export function libraryShowId(collection: LibraryCollection, songId: string): string {
    return `beacon_${collection}_${songId}`
}

function slideId(collection: LibraryCollection, songId: string, index: number): string {
    return `${libraryShowId(collection, songId)}_${index}`
}

function textItem(text: string, boxStyle: string, textStyle: string, align = "text-align: center;"): Item {
    return {
        type: "text",
        style: boxStyle,
        align: "",
        // shrinkToFit so a 6-line verse never overflows the slide
        textFit: "shrinkToFit",
        lines: text.split("\n").map((value) => ({ align, text: [{ value, style: textStyle }] }))
    }
}

export function librarySlide(text: string, group: string | null): Slide {
    return {
        group,
        color: null,
        settings: {},
        notes: "",
        items: [textItem(text, LYRIC_BOX, LYRIC_STYLE)]
    }
}

function titleSlide(song: LibrarySong): Slide {
    const items: Item[] = [textItem(song.title, TITLE_BOX, TITLE_STYLE)]
    const credit = [song.author, song.composer ? `Tune: ${song.composer}` : "", song.year].filter(Boolean).join("  •  ")
    if (credit) items.push(textItem(credit, CREDIT_BOX, CREDIT_STYLE))
    return { group: "intro", color: null, settings: {}, notes: "", items }
}

/**
 * Builds a complete Show for a library song.
 *
 * Slide order: TITLE, then verse 1, chorus, verse 2, chorus, ... The title slide is first on
 * purpose — deck thumbnails are generated from the first slide, so every carol/hymn gets a
 * readable name card instead of a wall of lyric text.
 */
export function buildLibraryShow(collection: LibraryCollection, song: LibrarySong, created = 0): Show {
    const slides: { [key: string]: Slide } = {}
    const layoutSlides: { id: string }[] = []

    let index = 0
    function add(slide: Slide) {
        const id = slideId(collection, song.id, index++)
        slides[id] = slide
        layoutSlides.push({ id })
        return id
    }

    add(titleSlide(song))

    // The chorus is stored ONCE and re-referenced in the layout, so editing it updates every
    // repeat (this is how Beacon Worship's own text importer behaves).
    let chorusId: string | null = null
    const wantsChorusEach = Boolean(song.chorus) && song.chorusAfter !== "last"

    song.verses.forEach((verse, verseIndex) => {
        add(librarySlide(verse, "verse"))
        if (!song.chorus) return

        const isLast = verseIndex === song.verses.length - 1
        if (!wantsChorusEach && !isLast) return

        if (chorusId === null) chorusId = add(librarySlide(song.chorus, "chorus"))
        else layoutSlides.push({ id: chorusId })
    })

    const layoutId = `${libraryShowId(collection, song.id)}_layout`

    return {
        name: song.title,
        origin: "beacon-library",
        category: LIBRARY_CATEGORIES[collection].id,
        settings: { activeLayout: layoutId, template: null },
        timestamps: { created, modified: null, used: null },
        quickAccess: {},
        metadata: { tags: [collection === "carols" ? "Christmas" : "Hymn"] },
        meta: {
            title: song.title,
            author: song.author || "",
            composer: song.composer || "",
            year: song.year || "",
            copyright: "Public Domain"
        },
        slides,
        layouts: { [layoutId]: { name: "Default", notes: "", slides: layoutSlides } },
        media: {}
    } as Show
}

/** Titles already present in the library, so re-installing never creates duplicates. */
export function getMissingSongs(collection: LibraryCollection, songs: LibrarySong[], existingShows: { name?: string; origin?: string; category?: string | null }[]): LibrarySong[] {
    const taken = new Set(
        existingShows
            .filter((show) => show && (show.origin === "beacon-library" || show.category === LIBRARY_CATEGORIES[collection].id))
            .map((show) => normaliseTitle(show.name || ""))
    )
    return songs.filter((song) => !taken.has(normaliseTitle(song.title)))
}

export function normaliseTitle(title: string): string {
    return (title || "")
        .toLowerCase()
        .replace(/[.,!?'’"]/g, "")
        .replace(/\s+/g, " ")
        .trim()
}
