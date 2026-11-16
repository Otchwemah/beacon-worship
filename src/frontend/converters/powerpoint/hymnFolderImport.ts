import { get } from "svelte/store"
import { fileNameFromPath, findFolderByPath, getFolderCategoryId, hymnIdFromPath } from "../../components/drawer/hymns/hymnFolders"
import type { HymnFileEntry } from "../../components/drawer/hymns/hymnFolders"
import { activePopup, hymnFolders, saved } from "../../stores"
import { newToast } from "../../utils/common"
import { isHymnFolderImporting, setHymnFolderImporting } from "./hymnImportState"
import { createHymnBookCategory, registerHymnFolder } from "./powerpointImporter"

// Beacon Worship — Hymns "Load folder".
//
// Index the .pptx files onto the folder row. Do NOT insert them into `shows`.
// Putting 850 stubs in the global library made every drawer tab crawl, and a click
// looked for a .show file that did not exist ("Could not find show").
// Conversion of one deck happens in hymnConvert.ts when that hymn is opened.

export async function importHymnFolder(data: { files: string[]; folderPath: string; categoryName?: string; truncated?: boolean }) {
    const files = data.files || []
    if (!files.length) {
        newToast("hymns.folder_empty")
        return
    }

    if (isHymnFolderImporting()) return
    setHymnFolderImporting(true)

    try {
        const folderPath = data.folderPath || ""
        const categoryName = data.categoryName || "Hymns"
        const existingFolderId = findFolderByPath(get(hymnFolders), folderPath)
        const categoryId = existingFolderId ? getFolderCategoryId(get(hymnFolders)[existingFolderId]) || createHymnBookCategory(categoryName, folderPath) : createHymnBookCategory(categoryName, folderPath)

        if (folderPath) registerHymnFolder(folderPath, categoryName, categoryId)

        const seen = new Set<string>()
        const fileEntries: HymnFileEntry[] = []
        for (const filePath of files) {
            const id = hymnIdFromPath(filePath)
            if (!id || seen.has(id)) continue
            seen.add(id)
            fileEntries.push({ id, name: fileNameFromPath(filePath), path: filePath })
        }

        hymnFolders.update((a) => {
            const id = findFolderByPath(a, folderPath)
            if (id && a[id]) a[id].files = fileEntries
            return a
        })

        saved.set(false)
        activePopup.set(null)
        newToast("main.finished")
    } finally {
        setHymnFolderImporting(false)
    }
}
