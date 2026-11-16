import { get } from "svelte/store"
import { Main } from "../../../../types/IPC/Main"
import { requestMain } from "../../../IPC/main"
import { hymnFolders, saved } from "../../../stores"
import { firstSlidePreviewFromPpt } from "../../../converters/powerpoint/hymnFirstSlide"
import { setHymnFilePreviews } from "./hymnFolders"

// After Load folder the grid already has a tile per hymn. This queue then converts
// SLIDE 1 only of each .pptx and stores a miniature (text + shapes + background).
// Full conversion still waits until the operator opens that hymn.

const queue: { id: string; path: string }[] = []
const pending = new Map<string, any>()
const queued = new Set<string>()
const finished = new Set<string>()
let pumping = false
let flushTimer: ReturnType<typeof setTimeout> | null = null

export function enqueueMissingHymnThumbnails(folders = get(hymnFolders)) {
    Object.values(folders || {}).forEach((folder) => {
        ;(folder?.files || []).forEach((file) => {
            if (!file?.id || !file.path) return
            if (file.preview || queued.has(file.id) || finished.has(file.id)) return
            queued.add(file.id)
            queue.push({ id: file.id, path: file.path })
        })
    })
    void pump()
}

async function pump() {
    if (pumping) return
    pumping = true
    try {
        while (queue.length) {
            const next = queue.shift()
            if (!next) break
            try {
                const payload = await requestMain(Main.PPT_TO_SHOW, { filePath: next.path, firstSlideOnly: true }, undefined, 30000)
                const preview = payload?.content ? firstSlidePreviewFromPpt(payload.content) : null
                if (preview) pending.set(next.id, preview)
            } catch (err) {
                console.error("Hymn first-slide preview failed for", next.path, err)
            } finally {
                queued.delete(next.id)
                finished.add(next.id)
            }
            if (pending.size >= 8) flush()
            await yieldUi()
        }
        flush()
    } finally {
        pumping = false
        if (queue.length) void pump()
    }
}

function flush() {
    if (!pending.size) return
    const previews: Record<string, any> = {}
    pending.forEach((preview, id) => {
        previews[id] = preview
    })
    pending.clear()
    hymnFolders.update((folders) => setHymnFilePreviews(folders, previews))
    saved.set(false)
}

function yieldUi() {
    return new Promise<void>((resolve) => {
        if (flushTimer) clearTimeout(flushTimer)
        flushTimer = setTimeout(() => {
            flushTimer = null
            resolve()
        }, 40)
    })
}
