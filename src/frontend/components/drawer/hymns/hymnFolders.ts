import type { ShowList } from "../../../../types/Show"
import type { Categories } from "../../../../types/Tabs"

// Beacon Worship — Hymns system folders.
//
// Mirrors the Media tab model: the operator adds a folder from the LEFT panel, it is
// persisted, and it stays there until they remove it. Unlike media (read live from disk),
// hymn decks are converted into the library on load, so each folder remembers the shows
// category its decks were imported into. Selecting the folder filters the grid to that
// category; "All" spans every folder.

export function getFolderCategoryId(folder: { categoryId?: string } | null | undefined): string {
    return folder?.categoryId || ""
}

// A folder is identified by its absolute path, so loading the same folder twice is a no-op.
export function findFolderByPath(folders: Categories, path: string): string {
    if (!path) return ""
    const normalised = normaliseFolderPath(path)
    return Object.entries(folders || {}).find(([, folder]) => normaliseFolderPath(folder?.path || "") === normalised)?.[0] || ""
}

export function normaliseFolderPath(path: string): string {
    // macOS/Windows are case-insensitive and tolerate trailing separators
    return (path || "").replace(/[\\/]+$/, "").toLowerCase()
}

export type HymnFolderEntry = { id: string; name: string; path: string; categoryId: string; icon: string }

export function createFolderEntry(id: string, name: string, path: string, categoryId: string): HymnFolderEntry {
    return { id, name: name || "Hymns", path, categoryId, icon: "folder" }
}

/**
 * Decks belonging to the current left-panel selection.
 * "all" (or empty) spans every loaded folder plus any hymn decks that were imported the
 * normal way; a folder id narrows to that folder's category.
 */
export function filterDecksByFolder(decks: ShowList[], selection: string, folders: Categories): ShowList[] {
    if (!selection || selection === "all" || selection === "unlabeled") return decks

    const folder = folders?.[selection]
    if (!folder) return decks

    const categoryId = getFolderCategoryId(folder)
    if (!categoryId) return []

    return decks.filter((deck) => deck.category === categoryId)
}

// Left-panel rows, sorted by name, with per-folder deck counts.
export function getFolderRows(folders: Categories, decks: ShowList[]): { id: string; label: string; icon: string; count: number; path: string }[] {
    return Object.entries(folders || {})
        .map(([id, folder]) => {
            const categoryId = getFolderCategoryId(folder)
            return {
                id,
                label: folder?.name || id,
                icon: folder?.icon || "folder",
                path: folder?.path || "",
                count: categoryId ? decks.filter((deck) => deck.category === categoryId).length : 0
            }
        })
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" }))
}

/**
 * Remove a folder from the panel. Optionally also drop the decks imported from it.
 * Returns the folder ids to delete from the library so the caller can do it through history
 * (undoable) rather than mutating the store here.
 */
export function removeFolder(folders: Categories, folderId: string, decks: ShowList[], alsoRemoveDecks: boolean): { folders: Categories; deckIds: string[]; categoryId: string } {
    const next = { ...(folders || {}) }
    const folder = next[folderId]
    delete next[folderId]

    const categoryId = getFolderCategoryId(folder)
    const deckIds = alsoRemoveDecks && categoryId ? decks.filter((deck) => deck.category === categoryId).map((deck) => deck.id) : []

    return { folders: next, deckIds, categoryId }
}
