import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => {
    const makeStore = (initial: any) => {
        let value = initial
        return {
            subscribe: (fn: (v: any) => void) => {
                fn(value)
                return () => {}
            },
            set: (v: any) => {
                value = v
            },
            update: (fn: (v: any) => any) => {
                value = fn(value)
                return value
            },
            _get: () => value,
            _reset: (v: any) => {
                value = v
            }
        }
    }
    return {
        shows: makeStore({}),
        hymnFolders: makeStore({}),
        saved: makeStore(true),
        activePopup: makeStore("import"),
        createHymnBookCategory: vi.fn((_name: string, folderPath: string) => "hymnfolder_" + (folderPath || "x")),
        registerHymnFolder: vi.fn(),
        updateShowsList: vi.fn(),
        newToast: vi.fn()
    }
})

vi.mock("svelte/store", () => ({ get: (store: any) => store._get() }))
vi.mock("../../stores", () => ({
    shows: h.shows,
    hymnFolders: h.hymnFolders,
    saved: h.saved,
    activePopup: h.activePopup
}))
vi.mock("./powerpointImporter", () => ({
    createHymnBookCategory: (...args: any[]) => h.createHymnBookCategory(...args),
    registerHymnFolder: (...args: any[]) => h.registerHymnFolder(...args)
}))
vi.mock("../../components/helpers/show", () => ({ updateShowsList: (...args: any[]) => h.updateShowsList(...args) }))
vi.mock("../../utils/common", () => ({ newToast: (...args: any[]) => h.newToast(...args) }))

import { importHymnFolder } from "./hymnFolderImport"
import { hymnIdFromPath } from "../../components/drawer/hymns/hymnFolders"
import { setHymnFolderImporting } from "./hymnImportState"

describe("importHymnFolder indexes pptx files without converting", () => {
    beforeEach(() => {
        h.shows._reset({})
        h.hymnFolders._reset({})
        h.saved._reset(true)
        h.activePopup._reset("import")
        h.createHymnBookCategory.mockClear()
        h.registerHymnFolder.mockClear()
        h.updateShowsList.mockClear()
        h.newToast.mockClear()
        setHymnFolderImporting(false)
    })
    afterEach(() => setHymnFolderImporting(false))

    it("adds every file as a stub with sourcePath and does not convert", async () => {
        await importHymnFolder({
            files: ["/h/PHB_001.pptx", "/h/PHB_002.pptx", "/h/PHB_003.pptx"],
            folderPath: "/h",
            categoryName: "PHB 2019"
        })

        const shows = h.shows._get()
        expect(Object.keys(shows)).toHaveLength(3)
        expect(shows[hymnIdFromPath("/h/PHB_001.pptx")].quickAccess.sourcePath).toBe("/h/PHB_001.pptx")
        expect(shows[hymnIdFromPath("/h/PHB_001.pptx")].origin).toBe("powerpoint")
        expect(shows[hymnIdFromPath("/h/PHB_001.pptx")].name).toBe("PHB_001")
        expect(h.registerHymnFolder).toHaveBeenCalledWith("/h", "PHB 2019", "hymnfolder_/h")
        expect(h.newToast).toHaveBeenCalledWith("main.finished")
    })

    it("can load a second folder without dropping the first", async () => {
        h.createHymnBookCategory.mockImplementation((_n: string, p: string) => "cat_" + p)
        await importHymnFolder({ files: ["/a/1.pptx"], folderPath: "/a", categoryName: "Book A" })
        await importHymnFolder({ files: ["/b/1.pptx", "/b/2.pptx"], folderPath: "/b", categoryName: "Book B" })

        expect(Object.keys(h.shows._get())).toHaveLength(3)
        expect(h.registerHymnFolder).toHaveBeenCalledTimes(2)
        expect(h.shows._get()[hymnIdFromPath("/a/1.pptx")].category).toBe("cat_/a")
        expect(h.shows._get()[hymnIdFromPath("/b/1.pptx")].category).toBe("cat_/b")
    })

    it("does not duplicate decks when the same folder is loaded again", async () => {
        await importHymnFolder({ files: ["/h/1.pptx", "/h/2.pptx"], folderPath: "/h", categoryName: "PHB" })
        await importHymnFolder({ files: ["/h/1.pptx", "/h/2.pptx", "/h/3.pptx"], folderPath: "/h", categoryName: "PHB" })
        expect(Object.keys(h.shows._get())).toHaveLength(3)
    })
})
