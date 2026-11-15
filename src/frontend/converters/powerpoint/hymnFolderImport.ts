import { get } from "svelte/store"
import type { TrimmedShow } from "../../../types/Show"
import { fileNameFromPath, findFolderByPath, getFolderCategoryId, hymnIdFromPath } from "../../components/drawer/hymns/hymnFolders"
import { updateShowsList } from "../../components/helpers/show"
import { activePopup, hymnFolders, saved, shows } from "../../stores"
import { newToast } from "../../utils/common"
import { isHymnFolderImporting, setHymnFolderImporting } from "./hymnImportState"
import { createHymnBookCategory, registerHymnFolder } from "./powerpointImporter"

// Beacon Worship — Hymns "Load folder".
//
// Church hymn books live on disk as .pptx files. Folder load must NOT convert them.
// Converting 850 decks at once froze the whole app on Windows (CPU + IPC + broadcasting
// the library to output windows). Load folder only indexes the files (name + path) so the
// grid appears immediately. The one deck the operator actually goes live is converted
// then, in hymnConvert.ts.
//
// Multiple folders are first-class: each folder gets its own category id (from its path),
// so two directories both named "Hymns" do not merge, and a second Load folder is not
// blocked by the first.

export async function importHymnFolder(data: { files: string[]; folderPath: string; categoryName?: string; truncated?: boolean }) {
    const files = data.files || []
    if (!files.length) {
        newToast("hymns.folder_empty")
        return
    }

    // Indexing is a single store write — only block a stacked click on the same tick.
    if (isHymnFolderImporting()) return
    setHymnFolderImporting(true)

    try {
        const folderPath = data.folderPath || ""
        const categoryName = data.categoryName || "Hymns"
        const existingFolderId = findFolderByPath(get(hymnFolders), folderPath)
        const categoryId = existingFolderId ? getFolderCategoryId(get(hymnFolders)[existingFolderId]) || createHymnBookCategory(categoryName, folderPath) : createHymnBookCategory(categoryName, folderPath)

        if (folderPath) registerHymnFolder(folderPath, categoryName, categoryId)

        const current = get(shows)
        const additions: { [id: string]: TrimmedShow } = {}
        const now = Date.now()

        for (const filePath of files) {
            const id = hymnIdFromPath(filePath)
            if (!id || current[id] || additions[id]) continue
            additions[id] = {
                name: fileNameFromPath(filePath),
                category: categoryId,
                origin: "powerpoint",
                timestamps: { created: now, modified: null, used: null },
                quickAccess: { sourcePath: filePath }
            }
        }

        const added = Object.keys(additions).length
        if (added) {
            shows.update((a) => {
                Object.assign(a, additions)
                return a
            })
            updateShowsList(get(shows))
            saved.set(false)
        }

        activePopup.set(null)
        newToast("main.finished")
    } finally {
        setHymnFolderImporting(false)
    }
}
