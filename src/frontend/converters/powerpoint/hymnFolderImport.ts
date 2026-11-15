import { get } from "svelte/store"
import { Main } from "../../../types/IPC/Main"
import type { Show } from "../../../types/Show"
import { requestMain } from "../../IPC/main"
import { updateShowsList } from "../../components/helpers/show"
import { activePopup, pdfImports, saved, shows, showsCache } from "../../stores"
import { newToast } from "../../utils/common"
import { isHymnFolderImporting, setHymnFolderImporting } from "./hymnImportState"
import { createHymnBookCategory, powerpointToTempShows, registerHymnFolder } from "./powerpointImporter"

// Beacon Worship — Hymns "Load folder" for 850+ PowerPoint decks.
//
// The previous path converted every file in the main process and pushed giant PPT JSON
// over IPC, then wrote showsCache (which broadcasts the whole library to output windows)
// on every batch. That froze Windows and dropped later files.
//
// This driver:
//   1. receives the file list (paths only)
//   2. asks main for ONE converted deck at a time
//   3. yields so the UI can paint / take input
//   4. writes names into `shows` as it goes (grid fills in)
//   5. writes the full cache once at the end (one output broadcast, one save)

export const HYMN_FOLDER_PROGRESS_KEY = "__hymn_folder__"
const LIST_FLUSH = 10
const PPT_TIMEOUT_MS = 180000

export async function importHymnFolder(data: { files: string[]; folderPath: string; categoryName?: string; truncated?: boolean }) {
    if (isHymnFolderImporting()) return

    const files = data.files || []
    if (!files.length) {
        newToast("hymns.folder_empty")
        return
    }

    setHymnFolderImporting(true)
    const categoryName = data.categoryName || "Hymns"
    const categoryId = createHymnBookCategory(categoryName)
    if (data.folderPath) registerHymnFolder(data.folderPath, categoryName, categoryId)

    reportProgress(0, files.length, "importing", categoryName)

    const converted: { id: string; show: Show }[] = []
    let failed = 0

    try {
        for (let i = 0; i < files.length; i++) {
            try {
                const payload = await requestMain(Main.PPT_TO_SHOW, { filePath: files[i] }, undefined, PPT_TIMEOUT_MS)
                if (payload?.content) {
                    const temp = powerpointToTempShows([{ name: payload.name, content: payload.content }], categoryId)
                    converted.push(...temp)
                    if (temp.length) flushTrimmed(temp)
                    else failed++
                } else {
                    failed++
                }
            } catch (err) {
                failed++
                console.error("Hymn folder import failed for", files[i], err)
            }

            reportProgress(i + 1, files.length, "importing", categoryName)
            if ((i + 1) % LIST_FLUSH === 0) updateShowsList(get(shows))
            await yieldToUi()
        }

        updateShowsList(get(shows))
    } finally {
        // Drop the flag BEFORE committing the cache so the one showsCache write
        // notifies output windows once instead of 850 times.
        setHymnFolderImporting(false)
        commitCache(converted)
        saved.set(false)
        activePopup.set(null)

        const allFailed = failed === files.length && converted.length === 0
        reportProgress(files.length, files.length, allFailed ? "error" : "complete", categoryName)
        if (!allFailed) newToast("main.finished")
        else newToast("hymns.folder_empty")
    }
}

function flushTrimmed(entries: { id: string; show: Show }[]) {
    shows.update((a) => {
        for (const { id, show } of entries) {
            a[id] = {
                name: show.name || "",
                category: show.category,
                timestamps: show.timestamps,
                quickAccess: show.quickAccess || {},
                ...(show.origin ? { origin: show.origin } : {}),
                ...(show.thumbnail ? { thumbnail: show.thumbnail } : {})
            }
        }
        return a
    })
}

function commitCache(entries: { id: string; show: Show }[]) {
    if (!entries.length) return
    showsCache.update((a) => {
        for (const { id, show } of entries) a[id] = show
        return a
    })
}

function reportProgress(done: number, total: number, status: "importing" | "complete" | "error", name?: string) {
    pdfImports.update((imports) => {
        const next = new Map(imports)
        next.set(HYMN_FOLDER_PROGRESS_KEY, { name: name || "Hymn decks", progress: done, total, status })
        return next
    })

    if (status === "complete" || status === "error") {
        setTimeout(
            () => {
                pdfImports.update((current) => {
                    const cleaned = new Map(current)
                    cleaned.delete(HYMN_FOLDER_PROGRESS_KEY)
                    return cleaned
                })
            },
            status === "error" ? 7000 : 3000
        )
    }
}

function yieldToUi() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0))
}
