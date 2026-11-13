import path from "path"

// Beacon Worship: helpers deciding which .pptx package entries must become real files on disk.
//
// Media and fonts are streamed straight to disk to avoid OOM on large embedded videos.
// The deck preview (docProps/thumbnail.*) is small, but it also needs a real filesystem path
// so the Hymns/Shows drawer rows can render it as a plain <img src>.

const MEDIA_PREFIXES = ["ppt/media/", "ppt/fonts/"]

// PowerPoint stores the deck preview here. EMF/WMF previews are excluded on purpose:
// Chromium cannot decode them, so accepting them would yield a broken image in the drawer.
const THUMBNAIL_ENTRY = /^docProps\/thumbnail\.(jpe?g|png|gif|webp|bmp)$/i

// Written under a distinct name so a deck that also embeds ppt/media/thumbnail.jpeg
// cannot overwrite its own preview.
export const DECK_THUMBNAIL_BASENAME = "deck-thumbnail"

// Package entry names are always forward-slashed, but be tolerant of archives that
// use backslashes or a leading "./" / "/" so a valid preview is never skipped.
export function normalizeEntryName(entryName: string): string {
    if (typeof entryName !== "string") return ""
    return entryName
        .replace(/\\/g, "/")
        .replace(/^\.\//, "")
        .replace(/^\/+/, "")
}

export function isPowerpointThumbnailEntry(entryName: string): boolean {
    return THUMBNAIL_ENTRY.test(normalizeEntryName(entryName))
}

export function isPowerpointMediaEntry(entryName: string): boolean {
    const name = normalizeEntryName(entryName)
    return MEDIA_PREFIXES.some((prefix) => name.startsWith(prefix))
}

// True when the entry should be extracted to disk rather than buffered in memory.
export function isPowerpointDiskEntry(entryName: string): boolean {
    return isPowerpointMediaEntry(entryName) || isPowerpointThumbnailEntry(entryName)
}

// Destination file name inside the per-deck import folder, or null to keep the entry in memory.
export function getPowerpointEntryFileName(entryName: string): string | null {
    const name = normalizeEntryName(entryName)

    if (isPowerpointThumbnailEntry(name)) {
        return DECK_THUMBNAIL_BASENAME + path.extname(name).toLowerCase()
    }

    if (isPowerpointMediaEntry(name)) {
        // zip directory entries end with "/" and have no file name of their own
        // (path.basename("ppt/media/") would otherwise return "media").
        if (name.endsWith("/")) return null
        const base = path.basename(name)
        // guard against traversal / empty names
        if (!base || base === "." || base === "..") return null
        return base
    }

    return null
}
