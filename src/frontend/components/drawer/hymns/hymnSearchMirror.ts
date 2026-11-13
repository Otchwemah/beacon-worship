/**
 * Beacon Worship — shared search normalization / mirroring for the Hymns drawer tab.
 *
 * The top drawer search and the dedicated Hymns navigation search bar edit the same query
 * while the Hymns tab is active. These helpers keep that mirroring pure and testable; the
 * actual number-vs-title matching still lives in `searchHymnDecks()`.
 */

/** Same single-space normalization the drawer search has always used (preserves a trailing space). */
export function normalizeHymnSearchQuery(value: string | null | undefined): string {
    const v = value ?? ""
    return v.trim().replace(/\s+/g, " ") + (v.endsWith(" ") ? " " : "")
}

/** Only the active Hymns tab mirrors the top drawer query into the dedicated hymn search store. */
export function shouldMirrorDrawerSearchToHymns(activeTab: string | null | undefined, drawerQuery: string, hymnQuery: string): boolean {
    return activeTab === "hymns" && drawerQuery !== hymnQuery
}
