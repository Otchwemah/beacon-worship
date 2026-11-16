import { get } from "svelte/store"
import { Main } from "../../../types/IPC/Main"
import { requestMain } from "../../IPC/main"
import { hymnFolders, saved, shows, showsCache, special } from "../../stores"
import { findHymnFile, isHymnFileStub, setHymnFileThumbnails } from "../../components/drawer/hymns/hymnFolders"
import { getSlidePreview } from "../../components/inputs/showThumbnail"
import { powerpointToTempShows } from "./powerpointImporter"

const PPT_TIMEOUT_MS = 180000
const inFlight = new Map<string, Promise<boolean>>()

// Convert ONE hymn .pptx when the operator opens it. Folder load only indexed the path.
export async function ensureHymnConverted(showId: string): Promise<boolean> {
    const cached = get(showsCache)[showId]
    if (cached?.layouts && cached.settings?.activeLayout && cached.layouts[cached.settings.activeLayout]?.slides?.length) return true

    const trimmed = get(shows)[showId]
    const file = findHymnFile(get(hymnFolders), showId)
    const sourcePath = trimmed?.quickAccess?.sourcePath || file?.path
    if (!sourcePath) return !!cached
    if (!isHymnFileStub(trimmed) && !file) return !!cached

    const pending = inFlight.get(showId)
    if (pending) return pending

    const work = convertOne(showId, sourcePath, {
        name: trimmed?.name || file?.name,
        category: trimmed?.category || file?.categoryId || "",
        quickAccess: { ...(trimmed?.quickAccess || {}), sourcePath },
        thumbnail: file?.thumbnail || trimmed?.thumbnail
    })
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
        const preview = getSlidePreview(show)
        const firstSlideImage = preview?.backgroundImage || preview?.mediaSrc || preview?.items?.find((item) => item.isImage && item.src)?.src || ""
        const hymnBg = get(special).hymnBackgroundImage || ""
        const fromSlide = firstSlideImage && firstSlideImage !== hymnBg ? firstSlideImage : ""
        const thumbnail = trimmed.thumbnail || fromSlide || ""
        if (thumbnail) show.thumbnail = thumbnail

        showsCache.update((a) => {
            a[showId] = show
            return a
        })

        // Persist only this one converted hymn in the library — never the whole folder.
        shows.update((a) => {
            a[showId] = {
                name: show.name || "",
                category: show.category,
                origin: "powerpoint",
                timestamps: show.timestamps,
                quickAccess: show.quickAccess || {},
                ...(show.thumbnail ? { thumbnail: show.thumbnail } : {})
            }
            return a
        })

        if (thumbnail) {
            hymnFolders.update((folders) => setHymnFileThumbnails(folders, { [showId]: thumbnail }))
        }

        saved.set(false)
        return true
    } catch (err) {
        console.error("Hymn convert failed for", filePath, err)
        return false
    }
}
