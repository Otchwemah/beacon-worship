import { readdir } from "fs/promises"
import path from "path"

// Beacon Worship — "Load folder" for the Hymns tab.
//
// Lets the operator point at a folder of .pptx hymn books and import them all in one go,
// instead of multi-selecting files in a dialog. The pure helpers below are unit tested;
// scanImportFolder() is the only part that touches the filesystem.

export const HYMN_DECK_EXTENSIONS = ["pptx", "ppt"]

// Office writes "~$Name.pptx" lock files next to open decks. They are not presentations.
const TEMP_FILE_PREFIXES = ["~$", "."]

export function getLowerExtension(filePath: string): string {
    const ext = path.extname(filePath)
    return ext ? ext.slice(1).toLowerCase() : ""
}

export function isImportableFile(filePath: string, extensions: string[]): boolean {
    if (!filePath) return false

    const base = path.basename(filePath)
    if (TEMP_FILE_PREFIXES.some((prefix) => base.startsWith(prefix))) return false

    const wanted = extensions.map((a) => a.replace(/^\./, "").toLowerCase())
    return wanted.includes(getLowerExtension(filePath))
}

// "Hymn 2" must sort before "Hymn 10". Zero-padded names (PHB_001) already sort correctly,
// but unpadded ones do not, and hymn order is the whole point of this library.
export function compareNaturally(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
}

export function collectImportableFiles(paths: string[], extensions: string[]): string[] {
    const seen = new Set<string>()
    const result: string[] = []

    paths.forEach((filePath) => {
        if (!isImportableFile(filePath, extensions)) return
        // case-insensitive filesystems (macOS/Windows) can surface the same file twice
        const key = process.platform === "linux" ? filePath : filePath.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        result.push(filePath)
    })

    return result.sort((a, b) => compareNaturally(path.basename(a), path.basename(b)) || compareNaturally(a, b))
}

export type ScanOptions = {
    recursive?: boolean
    maxDepth?: number
    maxFiles?: number
}

export type ScanResult = {
    files: string[]
    truncated: boolean
    foldersScanned: number
}

// Walks a folder for importable decks. Does not follow symlinked directories (avoids cycles)
// and skips hidden folders such as .git or .Trashes.
export async function scanImportFolder(folderPath: string, extensions: string[], options: ScanOptions = {}): Promise<ScanResult> {
    const recursive = options.recursive !== false
    const maxDepth = options.maxDepth ?? 5
    const maxFiles = options.maxFiles ?? 2000

    const found: string[] = []
    let truncated = false
    let foldersScanned = 0

    async function walk(dir: string, depth: number) {
        if (truncated) return

        let entries
        try {
            entries = await readdir(dir, { withFileTypes: true })
        } catch {
            // unreadable folder (permissions, removed mid-scan) — skip, don't fail the import
            return
        }

        foldersScanned++

        for (const entry of entries) {
            if (found.length >= maxFiles) {
                truncated = true
                return
            }

            const full = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                if (!recursive || depth >= maxDepth) continue
                if (entry.name.startsWith(".")) continue
                await walk(full, depth + 1)
                continue
            }

            // isFile() is false for symlinks; never follow them
            if (!entry.isFile()) continue
            if (isImportableFile(full, extensions)) found.push(full)
        }
    }

    await walk(folderPath, 0)

    return { files: collectImportableFiles(found, extensions), truncated, foldersScanned }
}

// Folder name becomes the hymn-book category name: "PHB 2019" -> "PHB 2019",
// "presbyterian_hymns" -> "presbyterian hymns".
export function categoryNameFromFolder(folderPath: string): string {
    const base = path.basename(folderPath.replace(/[\\/]+$/, ""))
    const cleaned = base.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim()
    return cleaned || "Hymns"
}
