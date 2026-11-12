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

/**
 * Hymn search for the dedicated Hymns search bar.
 * Number matching is used ONLY when the query is numeric: a digits-only query matches hymn
 * numbers (by prefix, so "10" finds 10, 100…109). Any other query matches deck names only —
 * it never matches on numbers. Empty query returns everything.
 */
export function searchHymnDecks(decks: ShowList[], query: string): ShowList[] {
    const q = (query || "").trim().toLowerCase()
    if (!q) return decks || []

    if (/^\d+$/.test(q)) {
        return (decks || []).filter((deck) => {
            const n = getHymnNumber(deck)
            return n !== null && String(n).startsWith(q)
        })
    }

    return (decks || []).filter((deck) => (deck.name || "").toLowerCase().includes(q))
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

/**
 * Replace the background on every slide of a hymn deck with the operator's saved image.
 *
 * FreeShow resolves a slide background in two places:
 *  - `slide.settings.backgroundImage` — used by the live output (showActions) and the preview.
 *  - `layoutSlide.background` (a media id) — takes precedence in the Show-panel preview.
 * To make the saved image win everywhere we set it on every slide AND clear any layout-level
 * background overrides (including per-child layout overrides). Pure: returns new slides/layouts
 * objects and never mutates the input. An empty path removes the hymn override from slides but
 * leaves layout backgrounds untouched.
 */
export function applyHymnBackground(show: { slides?: Record<string, any>; layouts?: Record<string, any> }, backgroundPath: string): { slides: Record<string, any>; layouts: Record<string, any> } {
    const path = (backgroundPath || "").trim()

    const slides: Record<string, any> = {}
    for (const [id, slide] of Object.entries(show?.slides || {})) {
        const settings = { ...(slide?.settings || {}) }
        if (path) settings.backgroundImage = path
        else delete settings.backgroundImage
        slides[id] = { ...slide, settings }
    }

    const layouts: Record<string, any> = {}
    for (const [id, layout] of Object.entries(show?.layouts || {})) {
        const layoutSlides = Array.isArray(layout?.slides)
            ? layout.slides.map((layoutSlide: any) => {
                  const copy = { ...layoutSlide }
                  if (path) {
                      delete copy.background
                      if (copy.children && typeof copy.children === "object") {
                          copy.children = Object.fromEntries(
                              Object.entries(copy.children).map(([childId, child]: [string, any]) => {
                                  const childCopy = { ...(child || {}) }
                                  delete childCopy.background
                                  return [childId, childCopy]
                              })
                          )
                      }
                  }
                  return copy
              })
            : layout?.slides
        layouts[id] = { ...layout, slides: layoutSlides }
    }

    return { slides, layouts }
}
