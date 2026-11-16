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
        hymnFolders: makeStore({}),
        saved: makeStore(true),
        activePopup: makeStore("import"),
        createHymnBookCategory: vi.fn((_name: string, folderPath: string) => "cat_" + folderPath),
        registerHymnFolder: vi.fn((_path: string, _name: string, categoryId: string) => {
            const id = "f_" + _path
            const folders = h.hymnFolders._get()
            folders[id] = { id, name: _name, path: _path, categoryId, icon: "folder", files: [] }
            h.hymnFolders._reset(folders)
        }),
        newToast: vi.fn()
    }
})

vi.mock("svelte/store", () => ({ get: (store: any) => store._get() }))
vi.mock("../../stores", () => ({
    hymnFolders: h.hymnFolders,
    saved: h.saved,
    activePopup: h.activePopup
}))
vi.mock("./powerpointImporter", () => ({
    createHymnBookCategory: (...args: any[]) => h.createHymnBookCategory(...args),
    registerHymnFolder: (...args: any[]) => h.registerHymnFolder(...args)
}))
vi.mock("../../utils/common", () => ({ newToast: (...args: any[]) => h.newToast(...args) }))

import { importHymnFolder } from "./hymnFolderImport"
import { hymnIdFromPath } from "../../components/drawer/hymns/hymnFolders"
import { setHymnFolderImporting } from "./hymnImportState"

describe("importHymnFolder indexes pptx files on the folder, not in shows", () => {
    beforeEach(() => {
        h.hymnFolders._reset({})
        h.saved._reset(true)
        h.activePopup._reset("import")
        h.createHymnBookCategory.mockClear()
        h.registerHymnFolder.mockClear()
        h.newToast.mockClear()
        setHymnFolderImporting(false)
    })
    afterEach(() => setHymnFolderImporting(false))

    it("stores every file on the folder row", async () => {
        await importHymnFolder({
            files: ["/h/PHB_001.pptx", "/h/PHB_002.pptx", "/h/PHB_003.pptx"],
            folderPath: "/h",
            categoryName: "PHB 2019"
        })

        const folder = Object.values(h.hymnFolders._get())[0] as any
        expect(folder.files).toHaveLength(3)
        expect(folder.files[0].id).toBe(hymnIdFromPath("/h/PHB_001.pptx"))
        expect(folder.files[0].name).toBe("PHB_001")
        expect(h.newToast).toHaveBeenCalledWith("main.finished")
    })

    it("can load a second folder without dropping the first", async () => {
        await importHymnFolder({ files: ["/a/1.pptx"], folderPath: "/a", categoryName: "Book A" })
        await importHymnFolder({ files: ["/b/1.pptx", "/b/2.pptx"], folderPath: "/b", categoryName: "Book B" })
        expect(Object.keys(h.hymnFolders._get())).toHaveLength(2)
        expect((Object.values(h.hymnFolders._get()) as any[]).reduce((n, f) => n + (f.files?.length || 0), 0)).toBe(3)
    })
})
