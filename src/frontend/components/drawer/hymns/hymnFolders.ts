import type { ShowList } from "../../../../types/Show"
import type { Categories } from "../../../../types/Tabs"

// Beacon Worship — Hymns system folders.
//
// Mirrors the Media tab model: the operator adds a folder from the LEFT panel, it is
// persisted, and it stays there until they remove it. Unlike media (read live from disk),
// hymn decks are indexed on load (the original .pptx stays on disk) and converted only
// when that hymn goes live. Each folder remembers the category its decks belong to.
// Selecting the folder filters the grid to that category; "All" spans every folder.

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

// Stable ids so loading the same folder twice does not duplicate decks, and two folders
// with the same display name (e.g. two "Hymns" directories) stay separate.
export function pathHash(path: string): string {
    const s = normaliseFolderPath(path)
    if (!s) return ""
    let hash = 0
    for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i)
        hash |= 0
    }
    return (hash < 0 ? "i" : "a") + Math.abs(hash).toString(36)
}

export function hymnIdFromPath(filePath: string): string {
    return "hymn_" + pathHash(filePath)
}

export function hymnCategoryIdFromFolder(folderPath: string, name: string): string {
    if (folderPath) return "hymnfolder_" + pathHash(folderPath)
    return (name || "")
        .toLowerCase()
        .replace(/[()]/g, "")
        .trim()
        .replace(/\s+/g, "_")
}

export function fileNameFromPath(filePath: string): string {
    const base = (filePath || "").replace(/\\/g, "/").split("/").pop() || "Hymn"
    return base.replace(/\.(pptx|ppt|ppsx|pps)$/i, "") || "Hymn"
}

export function isHymnFileStub(show: { quickAccess?: any } | null | undefined): boolean {
    return !!show?.quickAccess?.sourcePath
}

export type HymnFileEntry = { id: string; name: string; path: string }
export type HymnFolderEntry = { id: string; name: string; path: string; categoryId: string; icon: string; files?: HymnFileEntry[] }

export function createFolderEntry(id: string, name: string, path: string, categoryId: string, files: HymnFileEntry[] = []): HymnFolderEntry {
    return { id, name: name || "Hymns", path, categoryId, icon: "folder", files }
}

export function fileToShowList(file: HymnFileEntry, categoryId: string): ShowList {
    return {
        id: file.id,
        name: file.name,
        category: categoryId || null,
        origin: "powerpoint",
        timestamps: { created: 0, modified: null, used: null },
        quickAccess: { sourcePath: file.path }
    }
}

export function decksFromHymnFolders(folders: Categories, folderId?: string): ShowList[] {
    const entries = Object.entries(folders || {})
    const selected = folderId && folders?.[folderId] ? entries.filter(([id]) => id === folderId) : entries
    const decks: ShowList[] = []
    const seen = new Set<string>()
    selected.forEach(([, folder]) => {
        const categoryId = getFolderCategoryId(folder)
        ;(folder?.files || []).forEach((file) => {
            if (!file?.id || seen.has(file.id)) return
            seen.add(file.id)
            decks.push(fileToShowList(file, categoryId))
        })
    })
    return decks
}

export function findHymnFile(folders: Categories, showId: string): { id: string; name: string; path: string; categoryId: string } | null {
    if (!showId) return null
    for (const folder of Object.values(folders || {})) {
        const file = (folder?.files || []).find((f) => f.id === showId)
        if (file) return { ...file, categoryId: getFolderCategoryId(folder) }
    }
    return null
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
                count: Array.isArray(folder?.files) ? folder.files.length : categoryId ? decks.filter((deck) => deck.category === categoryId).length : 0
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
