import { get } from "svelte/store"
import { Main } from "../../../types/IPC/Main"
import { requestMain } from "../../IPC/main"
import { saved, shows, showsCache } from "../../stores"
import { isHymnFileStub } from "../../components/drawer/hymns/hymnFolders"
import { powerpointToTempShows } from "./powerpointImporter"

const PPT_TIMEOUT_MS = 180000
const inFlight = new Map<string, Promise<boolean>>()

// Convert ONE hymn .pptx, the moment the operator goes live. Folder load only indexed it.
export async function ensureHymnConverted(showId: string): Promise<boolean> {
    const cached = get(showsCache)[showId]
    if (cached?.layouts && cached.settings?.activeLayout && cached.layouts[cached.settings.activeLayout]?.slides?.length) return true

    const trimmed = get(shows)[showId]
    if (!isHymnFileStub(trimmed)) return !!cached

    const pending = inFlight.get(showId)
    if (pending) return pending

    const work = convertOne(showId, trimmed.quickAccess.sourcePath, trimmed)
    inFlight.set(showId, work)
    try {
        return await work
    } finally {
        inFlight.delete(showId)
    }
}

async function convertOne(showId: string, filePath: string, trimmed: { name?: string; category?: string | null; quickAccess?: any; thumbnail?: string }): Promise<boolean> {
    try {
        const payload = await requestMain(Main.PPT_TO_SHOW, { filePath }, undefined, PPT_TIMEOUT_MS)
        if (!payload?.content) return false

        const temp = powerpointToTempShows([{ name: payload.name || trimmed.name, content: payload.content }], trimmed.category || "")
        if (!temp.length) return false

        const show = temp[0].show
        show.name = trimmed.name || show.name
        show.category = trimmed.category || show.category
        show.quickAccess = { ...(show.quickAccess || {}), ...(trimmed.quickAccess || {}) }
        if (trimmed.thumbnail && !show.thumbnail) show.thumbnail = trimmed.thumbnail

        showsCache.update((a) => {
            a[showId] = show
            return a
        })

        if (show.thumbnail && show.thumbnail !== trimmed.thumbnail) {
            shows.update((a) => {
                if (a[showId]) a[showId].thumbnail = show.thumbnail
                return a
            })
        }

        saved.set(false)
        return true
    } catch (err) {
        console.error("Hymn convert failed for", filePath, err)
        return false
    }
}
