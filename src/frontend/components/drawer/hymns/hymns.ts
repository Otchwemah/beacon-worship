import type { ShowList } from "../../../../types/Show"

/**
 * Beacon Worship — Hymns library helpers.
 *
 * The Hymns tab is a standalone bottom drawer tab surfacing the operator's hymn decks.
 *
 * Where hymn decks come from: importing a .pptx/.ppt/.key through the PowerPoint importer
 * (converters/powerpoint/powerpointImporter.ts) produces a normal FreeShow show with
 * `origin: "powerpoint"`, filed under a category (default "presentation"). `origin` is part
 * of TrimmedShow, so it is already present in the drawer's show list — identifying hymn
 * decks needs no extra show loading.
 *
 * These functions are pure and unit-tested (hymns.test.ts).
 */

/** Categories may be explicitly designated as hymn books in addition to PowerPoint imports. */
export interface HymnFilterOptions {
    /** category id, or "all" / null for every hymn deck */
    category?: string | null
    /** extra category ids treated as hymn books even without a PowerPoint origin */
    hymnCategoryIds?: string[]
    /** hide archived categories / private shows, matching the Shows drawer behaviour */
    archivedCategoryIds?: string[]
    /** category ids the active profile may not see */
    hiddenCategoryIds?: string[]
}

/** A hymn deck is a PowerPoint-derived show, or a show in a designated hymn-book category. */
export function isHymnDeck(show: Pick<ShowList, "origin" | "category">, hymnCategoryIds: string[] = []): boolean {
    if (!show) return false
    if (show.origin === "powerpoint") return true
    return !!show.category && hymnCategoryIds.includes(show.category)
}

/**
 * Hymn number used for ordering and for voice "hymn number" commands.
 * Explicit metadata wins; otherwise a number at the START of the name (optionally after a
 * short book prefix) is used — e.g. "PHB 108", "PHB108", "108 - Amazing Grace".
 * Deliberately does not match trailing numbers, so "Amazing Grace 108" or "10,000 Reasons"
 * are not mis-numbered.
 */
export function getHymnNumber(show: { name?: string; quickAccess?: any; meta?: any }): number | null {
    const explicit = show?.quickAccess?.number ?? show?.meta?.number
    if (explicit !== undefined && explicit !== null && explicit !== "") {
        const n = Number(explicit)
        if (Number.isFinite(n)) return n
    }

    const name = (show?.name || "").trim()
    const match = name.match(/^(?:[A-Za-z]{1,6}[ ._-]*)?(\d{1,4})(?!\d)/)
    if (!match) return null

    const n = Number(match[1])
    return Number.isFinite(n) ? n : null
}

/** Filter the drawer show list down to hymn decks, honouring category and profile visibility. */
export function filterHymnDecks(shows: ShowList[], options: HymnFilterOptions = {}): ShowList[] {
    const { category = "all", hymnCategoryIds = [], archivedCategoryIds = [], hiddenCategoryIds = [] } = options

    return (shows || []).filter((show) => {
        if (!show || show.private) return false
        if (!isHymnDeck(show, hymnCategoryIds)) return false

        const cat = show.category || ""
        if (archivedCategoryIds.includes(cat)) return false
        if (hiddenCategoryIds.includes(cat)) return false

        if (category && category !== "all") {
            if (category === "unlabeled") return !show.category
            return show.category === category
        }
        return true
    })
}

/** Order hymn decks by hymn number (natural, not lexicographic), then name. Unnumbered go last. */
export function sortHymnDecks(shows: ShowList[]): ShowList[] {
    return [...(shows || [])].sort((a, b) => {
        const na = getHymnNumber(a)
        const nb = getHymnNumber(b)

        if (na !== null && nb !== null && na !== nb) return na - nb
        if (na !== null && nb === null) return -1
        if (na === null && nb !== null) return 1

        return (a?.name || "").localeCompare(b?.name || "", undefined, { numeric: true, sensitivity: "base" })
    })
}

/** The distinct hymn-book categories present in the library, for the tab's navigation. */
export function getHymnCategoryIds(shows: ShowList[], hymnCategoryIds: string[] = []): string[] {
    const ids = new Set<string>()
    for (const show of shows || []) {
        if (show?.private) continue
        if (!isHymnDeck(show, hymnCategoryIds)) continue
        if (show.category) ids.add(show.category)
    }
    return [...ids]
}
