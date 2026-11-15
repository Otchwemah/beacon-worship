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
        showsCache: makeStore({}),
        pdfImports: makeStore(new Map()),
        saved: makeStore(true),
        activePopup: makeStore("import"),
        requestMain: vi.fn(),
        powerpointToTempShows: vi.fn(),
        createHymnBookCategory: vi.fn(() => "phb_2019"),
        registerHymnFolder: vi.fn(),
        updateShowsList: vi.fn(),
        newToast: vi.fn()
    }
})

vi.mock("svelte/store", () => ({ get: (store: any) => store._get() }))
vi.mock("../../IPC/main", () => ({ requestMain: (...args: any[]) => h.requestMain(...args) }))
vi.mock("../../stores", () => ({
    shows: h.shows,
    showsCache: h.showsCache,
    pdfImports: h.pdfImports,
    saved: h.saved,
    activePopup: h.activePopup
}))
vi.mock("./powerpointImporter", () => ({
    createHymnBookCategory: (...args: any[]) => h.createHymnBookCategory(...args),
    registerHymnFolder: (...args: any[]) => h.registerHymnFolder(...args),
    powerpointToTempShows: (...args: any[]) => h.powerpointToTempShows(...args)
}))
vi.mock("../../components/helpers/show", () => ({ updateShowsList: (...args: any[]) => h.updateShowsList(...args) }))
vi.mock("../../utils/common", () => ({ newToast: (...args: any[]) => h.newToast(...args) }))

import { importHymnFolder } from "./hymnFolderImport"
import { isHymnFolderImporting, setHymnFolderImporting } from "./hymnImportState"

describe("importHymnFolder", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        h.shows._reset({})
        h.showsCache._reset({})
        h.pdfImports._reset(new Map())
        h.saved._reset(true)
        h.activePopup._reset("import")
        h.requestMain.mockReset()
        h.powerpointToTempShows.mockReset()
        h.createHymnBookCategory.mockClear()
        h.registerHymnFolder.mockClear()
        h.updateShowsList.mockClear()
        h.newToast.mockClear()
    })
    afterEach(() => {
        setHymnFolderImporting(false)
        vi.useRealTimers()
    })

    it("imports every file, one at a time, and commits the cache once", async () => {
        const files = ["/h/PHB_001.pptx", "/h/PHB_002.pptx", "/h/PHB_003.pptx"]
        h.requestMain.mockImplementation(async (_id: string, { filePath }: { filePath: string }) => ({
            name: filePath.split("/").pop(),
            content: { ok: filePath }
        }))
        h.powerpointToTempShows.mockImplementation(([{ name }]: any[]) => [
            { id: name, show: { name, category: "phb_2019", origin: "powerpoint", timestamps: { created: 1, modified: null, used: null } } }
        ])

        const done = importHymnFolder({ files, folderPath: "/h", categoryName: "PHB 2019" })
        await vi.runAllTimersAsync()
        await done

        expect(h.requestMain).toHaveBeenCalledTimes(3)
        expect(h.powerpointToTempShows).toHaveBeenCalledTimes(3)
        expect(Object.keys(h.shows._get())).toHaveLength(3)
        expect(Object.keys(h.showsCache._get())).toHaveLength(3)
        expect(h.createHymnBookCategory).toHaveBeenCalledWith("PHB 2019")
        expect(h.registerHymnFolder).toHaveBeenCalledWith("/h", "PHB 2019", "phb_2019")
        expect(h.newToast).toHaveBeenCalledWith("main.finished")
        expect(isHymnFolderImporting()).toBe(false)
        expect(h.saved._get()).toBe(false)
    })

    it("skips a broken deck and still imports the rest", async () => {
        h.requestMain.mockImplementation(async (_id: string, { filePath }: { filePath: string }) => {
            if (filePath.includes("002")) return null
            return { name: "ok", content: { ok: true } }
        })
        h.powerpointToTempShows.mockReturnValue([{ id: "ok", show: { name: "ok", category: "phb_2019" } }])

        const done = importHymnFolder({ files: ["/h/1.pptx", "/h/002.pptx", "/h/3.pptx"], folderPath: "/h", categoryName: "PHB" })
        await vi.runAllTimersAsync()
        await done

        expect(h.requestMain).toHaveBeenCalledTimes(3)
        expect(Object.keys(h.showsCache._get()).length).toBeGreaterThan(0)
        expect(h.newToast).toHaveBeenCalledWith("main.finished")
    })

    it("does not start a second import while one is running", async () => {
        let release!: () => void
        h.requestMain.mockImplementation(() => new Promise((resolve) => (release = () => resolve({ name: "a", content: {} }))))
        h.powerpointToTempShows.mockReturnValue([{ id: "a", show: { name: "a" } }])

        const first = importHymnFolder({ files: ["/h/1.pptx"], folderPath: "/h", categoryName: "PHB" })
        const second = importHymnFolder({ files: ["/h/2.pptx"], folderPath: "/h", categoryName: "PHB" })
        await second
        expect(h.requestMain).toHaveBeenCalledTimes(1)
        release()
        await vi.runAllTimersAsync()
        await first
    })
})
