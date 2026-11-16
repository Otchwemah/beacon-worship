import fs from "fs"
import path from "path"
import yauzl from "yauzl"
import { normalizeEntryName } from "./pptEntries"

// Pull a real image off slide 1 of a .pptx so the Hymns grid can show a thumbnail
// without converting the whole deck. PowerPoint's docProps/thumbnail.* is often a
// blank white frame; the first slide's own picture is what the operator actually sees.

const SLIDE1_RELS = /(?:^|\/)ppt\/slides\/_rels\/slide1\.xml\.rels$/i
const RASTER_EXT = /\.(jpe?g|png|gif|webp|bmp)$/i
const IMAGE_REL_TYPE = /relationships\/image/i

export function isSlide1RelsEntry(name: string): boolean {
    return SLIDE1_RELS.test(normalizeEntryName(name))
}

export function isPptRasterMediaEntry(name: string): boolean {
    const normalised = normalizeEntryName(name)
    return normalised.startsWith("ppt/media/") && RASTER_EXT.test(normalised)
}

export function parseImageRelationshipTargets(relsXml: string): string[] {
    if (!relsXml) return []
    const tags = relsXml.match(/<[^>]*Relationship[^>]*>/gi) || []
    const targets: string[] = []
    for (const tag of tags) {
        if (!IMAGE_REL_TYPE.test(tag)) continue
        const match = tag.match(/Target=["']([^"']+)["']/i)
        if (match?.[1]) targets.push(match[1].trim())
    }
    return targets
}

export function resolveSlideMediaPath(target: string): string {
    const normalised = normalizeEntryName(target)
    if (!normalised) return ""
    if (normalised.startsWith("ppt/")) return normalised
    // slide1 rels live in ppt/slides/_rels/, so ../media/image1.jpeg → ppt/media/image1.jpeg
    return path.posix.normalize(`ppt/slides/${normalised}`).replace(/^\/+/, "")
}

export function chooseFirstSlideImage(relsXml: string, media: { name: string; size: number }[]): string | null {
    const wanted = new Set(parseImageRelationshipTargets(relsXml).map(resolveSlideMediaPath).filter(Boolean))
    const candidates = (media || []).filter((entry) => wanted.has(normalizeEntryName(entry.name)))
    if (!candidates.length) return null
    candidates.sort((a, b) => (b.size || 0) - (a.size || 0))
    return normalizeEntryName(candidates[0].name) || null
}

export async function pptFirstSlideThumbnail(filePath: string): Promise<string | null> {
    if (!filePath || !fs.existsSync(filePath)) return null

    try {
        const { rels, media } = await readZipMeta(filePath)
        const imageEntry = chooseFirstSlideImage(rels, media)
        if (!imageEntry) return null

        const { filePathHashCode, getThumbnailFolderPath } = await import("../../data/thumbnails")
        const ext = path.extname(imageEntry).toLowerCase() || ".jpg"
        const dest = path.join(getThumbnailFolderPath(), `hymn-slide1-${filePathHashCode(filePath)}${ext}`)
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest

        const folder = path.dirname(dest)
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

        const extracted = await extractZipEntry(filePath, imageEntry, dest)
        if (!extracted || !fs.existsSync(dest) || fs.statSync(dest).size === 0) return null
        return dest
    } catch (err) {
        console.error("Hymn first-slide thumbnail failed for", filePath, err)
        return null
    }
}

type ZipMeta = { rels: string; media: { name: string; size: number }[] }

function entryName(entry: yauzl.Entry): string {
    const raw = entry.fileName as unknown
    const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw || "")
    return normalizeEntryName(text)
}

function readZipMeta(filePath: string): Promise<ZipMeta> {
    return new Promise((resolve, reject) => {
        yauzl.open(filePath, { lazyEntries: true, decodeStrings: false } as any, (err, zipfile) => {
            if (err || !zipfile) {
                reject(err || new Error("Failed to open pptx"))
                return
            }

            const media: { name: string; size: number }[] = []
            let rels = ""
            let settled = false

            const done = (error?: unknown) => {
                if (settled) return
                settled = true
                try {
                    zipfile.close()
                } catch {
                    // ignore
                }
                if (error) reject(error instanceof Error ? error : new Error(String(error)))
                else resolve({ rels, media })
            }

            zipfile.on("error", (zipErr) => done(zipErr))
            zipfile.on("end", () => done())
            zipfile.on("entry", (entry: yauzl.Entry) => {
                const name = entryName(entry)
                if (isPptRasterMediaEntry(name)) {
                    media.push({ name, size: entry.uncompressedSize || 0 })
                    zipfile.readEntry()
                    return
                }
                if (!isSlide1RelsEntry(name)) {
                    zipfile.readEntry()
                    return
                }
                zipfile.openReadStream(entry, (streamErr, stream) => {
                    if (streamErr || !stream) {
                        zipfile.readEntry()
                        return
                    }
                    const chunks: Buffer[] = []
                    stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
                    stream.on("error", () => zipfile.readEntry())
                    stream.on("end", () => {
                        rels = Buffer.concat(chunks).toString("utf8")
                        zipfile.readEntry()
                    })
                })
            })
            zipfile.readEntry()
        })
    })
}

function extractZipEntry(filePath: string, wantedName: string, dest: string): Promise<boolean> {
    const wanted = normalizeEntryName(wantedName)
    return new Promise((resolve) => {
        yauzl.open(filePath, { lazyEntries: true, decodeStrings: false } as any, (err, zipfile) => {
            if (err || !zipfile) {
                resolve(false)
                return
            }

            let settled = false
            const finish = (ok: boolean) => {
                if (settled) return
                settled = true
                try {
                    zipfile.close()
                } catch {
                    // ignore
                }
                resolve(ok)
            }

            zipfile.on("error", () => finish(false))
            zipfile.on("end", () => finish(false))
            zipfile.on("entry", (entry: yauzl.Entry) => {
                if (entryName(entry) !== wanted) {
                    zipfile.readEntry()
                    return
                }
                zipfile.openReadStream(entry, (streamErr, stream) => {
                    if (streamErr || !stream) {
                        finish(false)
                        return
                    }
                    const chunks: Buffer[] = []
                    stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
                    stream.on("error", () => finish(false))
                    stream.on("end", () => {
                        try {
                            fs.writeFileSync(dest, Buffer.concat(chunks))
                            finish(true)
                        } catch {
                            finish(false)
                        }
                    })
                })
            })
            zipfile.readEntry()
        })
    })
}
