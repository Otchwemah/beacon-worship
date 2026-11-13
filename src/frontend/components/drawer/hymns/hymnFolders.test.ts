import { describe, expect, it } from "vitest"
import type { ShowList } from "../../../../types/Show"
import { createFolderEntry, filterDecksByFolder, findFolderByPath, getFolderCategoryId, getFolderRows, normaliseFolderPath, removeFolder } from "./hymnFolders"

const deck = (id: string, category: string | null): ShowList => ({ id, name: id, category, timestamps: { created: 0, modified: null, used: null } })

const folders = {
    f1: { name: "PHB 2019", path: "/Users/me/Hymns/PHB 2019", categoryId: "phb_2019", icon: "folder" },
    f2: { name: "Methodist", path: "/Users/me/Hymns/Methodist", categoryId: "methodist", icon: "folder" }
}

const decks = [deck("a", "phb_2019"), deck("b", "phb_2019"), deck("c", "methodist"), deck("d", "other"), deck("e", null)]

describe("normaliseFolderPath / findFolderByPath", () => {
    it("ignores trailing separators and case", () => {
        expect(normaliseFolderPath("/A/B/")).toBe("/a/b")
        expect(normaliseFolderPath("/A/B///")).toBe("/a/b")
        expect(normaliseFolderPath("")).toBe("")
    })

    it("finds an already-loaded folder regardless of trailing slash", () => {
        expect(findFolderByPath(folders, "/Users/me/Hymns/PHB 2019")).toBe("f1")
        expect(findFolderByPath(folders, "/Users/me/Hymns/PHB 2019/")).toBe("f1")
        expect(findFolderByPath(folders, "/users/me/hymns/methodist")).toBe("f2")
    })

    it("returns empty for unknown or empty paths", () => {
        expect(findFolderByPath(folders, "/nope")).toBe("")
        expect(findFolderByPath(folders, "")).toBe("")
        expect(findFolderByPath({}, "/a")).toBe("")
    })
})

describe("createFolderEntry / getFolderCategoryId", () => {
    it("builds a folder row linked to its category", () => {
        expect(createFolderEntry("f9", "Ga Hymnal", "/h/Ga", "ga_hymnal")).toEqual({ id: "f9", name: "Ga Hymnal", path: "/h/Ga", categoryId: "ga_hymnal", icon: "folder" })
    })

    it("falls back to Hymns for an empty name", () => {
        expect(createFolderEntry("f9", "", "/h", "h").name).toBe("Hymns")
    })

    it("reads the category id defensively", () => {
        expect(getFolderCategoryId({ categoryId: "x" })).toBe("x")
        expect(getFolderCategoryId({})).toBe("")
        expect(getFolderCategoryId(null)).toBe("")
        expect(getFolderCategoryId(undefined)).toBe("")
    })
})

describe("filterDecksByFolder", () => {
    it("'all' spans every folder and ungrouped decks", () => {
        expect(filterDecksByFolder(decks, "all", folders).map((d) => d.id)).toEqual(["a", "b", "c", "d", "e"])
        expect(filterDecksByFolder(decks, "", folders).length).toBe(5)
    })

    it("narrows to the selected folder's category", () => {
        expect(filterDecksByFolder(decks, "f1", folders).map((d) => d.id)).toEqual(["a", "b"])
        expect(filterDecksByFolder(decks, "f2", folders).map((d) => d.id)).toEqual(["c"])
    })

    it("returns nothing for a folder whose category is missing", () => {
        expect(filterDecksByFolder(decks, "f3", { f3: { name: "Broken", path: "/x" } })).toEqual([])
    })

    it("ignores an unknown selection rather than blanking the grid", () => {
        expect(filterDecksByFolder(decks, "deleted-folder", folders).length).toBe(5)
    })

    it("treats 'unlabeled' as the unfiltered library view", () => {
        expect(filterDecksByFolder(decks, "unlabeled", folders).length).toBe(5)
    })
})

describe("getFolderRows", () => {
    it("counts decks per folder and sorts naturally", () => {
        const rows = getFolderRows({ z: { name: "Hymns 10", categoryId: "phb_2019" }, a: { name: "Hymns 2", categoryId: "methodist" } }, decks)
        expect(rows.map((r) => r.label)).toEqual(["Hymns 2", "Hymns 10"])
        expect(rows.map((r) => r.count)).toEqual([1, 2])
    })

    it("defaults the icon and tolerates an empty folder map", () => {
        expect(getFolderRows({ f: { name: "X" } }, decks)[0].icon).toBe("folder")
        expect(getFolderRows({}, decks)).toEqual([])
    })

    it("reports zero for a folder with no linked category", () => {
        expect(getFolderRows({ f: { name: "X", path: "/x" } }, decks)[0].count).toBe(0)
    })
})

describe("removeFolder", () => {
    it("removes only the panel entry by default, keeping the hymns", () => {
        const result = removeFolder(folders, "f1", decks, false)
        expect(Object.keys(result.folders)).toEqual(["f2"])
        expect(result.deckIds).toEqual([])
        expect(result.categoryId).toBe("phb_2019")
    })

    it("also collects the folder's decks when asked", () => {
        const result = removeFolder(folders, "f1", decks, true)
        expect(result.deckIds).toEqual(["a", "b"])
    })

    it("never mutates the input folder map", () => {
        removeFolder(folders, "f1", decks, true)
        expect(Object.keys(folders)).toEqual(["f1", "f2"])
    })

    it("is a no-op for an unknown folder id", () => {
        const result = removeFolder(folders, "nope", decks, true)
        expect(Object.keys(result.folders)).toEqual(["f1", "f2"])
        expect(result.deckIds).toEqual([])
    })

    it("collects no decks when the folder has no category", () => {
        const result = removeFolder({ f: { name: "X", path: "/x" } }, "f", decks, true)
        expect(result.deckIds).toEqual([])
    })
})
