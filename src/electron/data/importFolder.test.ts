import { mkdtemp, mkdir, rm, writeFile } from "fs/promises"
import { tmpdir } from "os"
import path from "path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { HYMN_DECK_EXTENSIONS, categoryNameFromFolder, collectImportableFiles, compareNaturally, getLowerExtension, isImportableFile, scanImportFolder } from "./importFolder"

describe("getLowerExtension", () => {
    it("lowercases and strips the dot", () => {
        expect(getLowerExtension("/hymns/PHB_108.PPTX")).toBe("pptx")
        expect(getLowerExtension("a/b/c.PpTx")).toBe("pptx")
    })

    it("returns empty string when there is no extension", () => {
        expect(getLowerExtension("/hymns/README")).toBe("")
        expect(getLowerExtension("")).toBe("")
    })
})

describe("isImportableFile", () => {
    it("accepts ppt and pptx regardless of case", () => {
        expect(isImportableFile("/h/PHB_001.pptx", HYMN_DECK_EXTENSIONS)).toBe(true)
        expect(isImportableFile("/h/PHB_002.PPTX", HYMN_DECK_EXTENSIONS)).toBe(true)
        expect(isImportableFile("/h/old.ppt", HYMN_DECK_EXTENSIONS)).toBe(true)
    })

    it("rejects other formats", () => {
        ;["/h/song.pdf", "/h/notes.txt", "/h/deck.pptm", "/h/README"].forEach((p) => {
            expect(isImportableFile(p, HYMN_DECK_EXTENSIONS), p).toBe(false)
        })
    })

    it("rejects Office lock files and dotfiles", () => {
        expect(isImportableFile("/h/~$PHB_108.pptx", HYMN_DECK_EXTENSIONS)).toBe(false)
        expect(isImportableFile("/h/.PHB_108.pptx", HYMN_DECK_EXTENSIONS)).toBe(false)
    })

    it("rejects empty paths", () => {
        expect(isImportableFile("", HYMN_DECK_EXTENSIONS)).toBe(false)
    })

    it("tolerates extensions written with a leading dot", () => {
        expect(isImportableFile("/h/a.pptx", [".pptx"])).toBe(true)
    })
})

describe("compareNaturally / collectImportableFiles", () => {
    it("sorts hymn numbers numerically, not lexicographically", () => {
        const names = ["Hymn 10.pptx", "Hymn 2.pptx", "Hymn 1.pptx"]
        expect([...names].sort(compareNaturally)).toEqual(["Hymn 1.pptx", "Hymn 2.pptx", "Hymn 10.pptx"])
    })

    it("filters, de-duplicates and natural-sorts in one pass", () => {
        const input = ["/h/Hymn 10.pptx", "/h/notes.txt", "/h/Hymn 2.pptx", "/h/Hymn 2.pptx", "/h/~$Hymn 2.pptx", "/h/Hymn 1.pptx"]
        expect(collectImportableFiles(input, HYMN_DECK_EXTENSIONS)).toEqual(["/h/Hymn 1.pptx", "/h/Hymn 2.pptx", "/h/Hymn 10.pptx"])
    })

    it("returns an empty array when nothing matches", () => {
        expect(collectImportableFiles(["/h/a.txt", "/h/b.pdf"], HYMN_DECK_EXTENSIONS)).toEqual([])
        expect(collectImportableFiles([], HYMN_DECK_EXTENSIONS)).toEqual([])
    })

    it("keeps zero-padded hymn book names in order", () => {
        const input = ["/h/PHB_108.pptx", "/h/PHB_002.pptx", "/h/PHB_010.pptx", "/h/PHB_001.pptx"]
        expect(collectImportableFiles(input, HYMN_DECK_EXTENSIONS).map((p) => path.basename(p))).toEqual(["PHB_001.pptx", "PHB_002.pptx", "PHB_010.pptx", "PHB_108.pptx"])
    })
})

describe("categoryNameFromFolder", () => {
    it("uses the folder basename", () => {
        expect(categoryNameFromFolder("/Users/me/Hymns/PHB 2019")).toBe("PHB 2019")
    })

    it("turns underscores into spaces and collapses whitespace", () => {
        expect(categoryNameFromFolder("/h/presbyterian_hymn__book")).toBe("presbyterian hymn book")
    })

    it("ignores trailing separators", () => {
        expect(categoryNameFromFolder("/h/PHB/")).toBe("PHB")
        expect(categoryNameFromFolder("/h/PHB///")).toBe("PHB")
    })

    it("falls back to Hymns for an empty name", () => {
        expect(categoryNameFromFolder("/")).toBe("Hymns")
        expect(categoryNameFromFolder("")).toBe("Hymns")
    })
})

describe("scanImportFolder", () => {
    let root = ""

    beforeAll(async () => {
        root = await mkdtemp(path.join(tmpdir(), "beacon-hymns-"))
        await writeFile(path.join(root, "PHB_002.pptx"), "x")
        await writeFile(path.join(root, "PHB_001.pptx"), "x")
        await writeFile(path.join(root, "PHB_010.pptx"), "x")
        await writeFile(path.join(root, "notes.txt"), "x")
        await writeFile(path.join(root, "~$PHB_001.pptx"), "x")

        await mkdir(path.join(root, "More"))
        await writeFile(path.join(root, "More", "PHB_108.pptx"), "x")

        await mkdir(path.join(root, ".hidden"))
        await writeFile(path.join(root, ".hidden", "PHB_999.pptx"), "x")

        await mkdir(path.join(root, "Empty"))
    })

    afterAll(async () => {
        if (root) await rm(root, { recursive: true, force: true })
    })

    it("finds decks recursively, skipping hidden folders and lock files", async () => {
        const result = await scanImportFolder(root, HYMN_DECK_EXTENSIONS)
        expect(result.files.map((p) => path.basename(p))).toEqual(["PHB_001.pptx", "PHB_002.pptx", "PHB_010.pptx", "PHB_108.pptx"])
        expect(result.truncated).toBe(false)
        expect(result.foldersScanned).toBeGreaterThan(1)
    })

    it("stays in the top folder when recursive is false", async () => {
        const result = await scanImportFolder(root, HYMN_DECK_EXTENSIONS, { recursive: false })
        expect(result.files.map((p) => path.basename(p))).toEqual(["PHB_001.pptx", "PHB_002.pptx", "PHB_010.pptx"])
    })

    it("respects maxFiles and reports truncation", async () => {
        const result = await scanImportFolder(root, HYMN_DECK_EXTENSIONS, { maxFiles: 2 })
        expect(result.files.length).toBe(2)
        expect(result.truncated).toBe(true)
    })

    it("respects maxDepth", async () => {
        const result = await scanImportFolder(root, HYMN_DECK_EXTENSIONS, { maxDepth: 0 })
        expect(result.files.map((p) => path.basename(p))).toEqual(["PHB_001.pptx", "PHB_002.pptx", "PHB_010.pptx"])
    })

    it("returns empty for a folder with no decks", async () => {
        const result = await scanImportFolder(path.join(root, "Empty"), HYMN_DECK_EXTENSIONS)
        expect(result.files).toEqual([])
        expect(result.truncated).toBe(false)
    })

    it("does not throw on a missing folder", async () => {
        const result = await scanImportFolder(path.join(root, "does-not-exist"), HYMN_DECK_EXTENSIONS)
        expect(result.files).toEqual([])
        expect(result.foldersScanned).toBe(0)
    })
})
