import { get } from "svelte/store"
import { Main } from "../../../../types/IPC/Main"
import { requestMain } from "../../../IPC/main"
import { hymnFolders, saved } from "../../../stores"
import { setHymnFileThumbnails } from "./hymnFolders"

// After Load folder the grid already has a tile per hymn. This queue then copies the
// first-slide picture out of each .pptx, one file at a time, so 850 decks do not freeze
// the app. Full conversion still waits until the operator opens that hymn.

const queue: { id: string; path: string }[] = []
const pending = new Map<string, string>()
const queued = new Set<string>()
const finished = new Set<string>()
let pumping = false
let flushTimer: ReturnType<typeof setTimeout> | null = null

export function enqueueMissingHymnThumbnails(folders = get(hymnFolders)) {
    Object.values(folders || {}).forEach((folder) => {
        ;(folder?.files || []).forEach((file) => {
            if (!file?.id || !file.path) return
            if (file.thumbnail || queued.has(file.id) || finished.has(file.id)) return
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
                const thumbnail = await requestMain(Main.PPT_FIRST_SLIDE_THUMB, { filePath: next.path }, undefined, 20000)
                if (thumbnail) pending.set(next.id, thumbnail)
            } catch (err) {
                console.error("Hymn thumbnail failed for", next.path, err)
            } finally {
                queued.delete(next.id)
                finished.add(next.id)
            }
            if (pending.size >= 12) flush()
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
    const thumbs: Record<string, string> = {}
    pending.forEach((path, id) => {
        thumbs[id] = path
    })
    pending.clear()
    hymnFolders.update((folders) => setHymnFileThumbnails(folders, thumbs))
    saved.set(false)
}

function yieldUi() {
    return new Promise<void>((resolve) => {
        if (flushTimer) clearTimeout(flushTimer)
        flushTimer = setTimeout(() => {
            flushTimer = null
            resolve()
        }, 30)
    })
}
