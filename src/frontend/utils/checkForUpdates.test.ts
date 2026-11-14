import { afterEach, describe, expect, it, vi } from "vitest"
import { getUpdateData, isNewerVersion } from "./checkForUpdates"

describe("isNewerVersion", () => {
    it("treats equal versions as not newer", () => {
        expect(isNewerVersion("1.6.6", "1.6.6")).toBe(false)
        expect(isNewerVersion("v1.6.6", "1.6.6")).toBe(false)
        expect(isNewerVersion("1.6.6", "v1.6.6")).toBe(false)
    })

    it("detects a higher patch, minor or major", () => {
        expect(isNewerVersion("1.6.7", "1.6.6")).toBe(true)
        expect(isNewerVersion("1.7.0", "1.6.6")).toBe(true)
        expect(isNewerVersion("2.0.0", "1.6.6")).toBe(true)
    })

    it("does not treat an older tag as an update", () => {
        expect(isNewerVersion("1.6.5", "1.6.6")).toBe(false)
        expect(isNewerVersion("1.5.9", "1.6.6")).toBe(false)
        expect(isNewerVersion("0.9.0", "1.6.6")).toBe(false)
    })

    it("does not treat a different-but-not-newer string as an update", () => {
        // the old `!==` comparison would have opened the popup for any other tag
        expect(isNewerVersion("1.6.6-hotfix", "1.6.6")).toBe(false)
    })

    it("treats a stable release as newer than a prerelease of the same core", () => {
        expect(isNewerVersion("1.6.6", "1.6.6-beta")).toBe(true)
        expect(isNewerVersion("1.6.6-beta", "1.6.6")).toBe(false)
    })

    it("empty is never newer", () => {
        expect(isNewerVersion("", "1.6.6")).toBe(false)
        expect(isNewerVersion("1.6.7", "")).toBe(false)
    })
})

describe("getUpdateData", () => {
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it("queries the Beacon Worship repo, not upstream FreeShow", async () => {
        const fetchMock = vi.fn(async (url: string) => {
            expect(String(url)).toContain("Otchwemah/beacon-worship")
            expect(String(url)).not.toContain("ChurchApps")
            return { ok: true, json: async () => [] }
        })
        vi.stubGlobal("fetch", fetchMock)

        const data = await getUpdateData("1.6.6", false)
        expect(data.hasUpdate).toBe(false)
        expect(data.latestVersion).toBe("")
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("reports no update when the Beacon Worship repo has no releases", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({ ok: true, json: async () => [] }))
        )
        const data = await getUpdateData("1.6.6", false)
        expect(data).toEqual({ latestVersion: "", changelog: "", hasUpdate: false })
    })

    it("does not treat an equal tag as an update", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({
                ok: true,
                json: async () => [{ draft: false, prerelease: false, tag_name: "v1.6.6", body: "same" }]
            }))
        )
        const data = await getUpdateData("1.6.6", false)
        expect(data.hasUpdate).toBe(false)
        expect(data.latestVersion).toBe("1.6.6")
    })

    it("reports an update only when our repo has a newer tag", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({
                ok: true,
                json: async () => [{ draft: false, prerelease: false, tag_name: "v1.6.7", body: "fixes" }]
            }))
        )
        const data = await getUpdateData("1.6.6", false)
        expect(data.hasUpdate).toBe(true)
        expect(data.latestVersion).toBe("1.6.7")
        expect(data.changelog).toBe("fixes")
    })

    it("treats a non-array payload as no update", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({
                ok: true,
                json: async () => ({ message: "Not Found" })
            }))
        )
        const data = await getUpdateData("1.6.6", false)
        expect(data.hasUpdate).toBe(false)
    })

    it("treats a 404 as no update rather than throwing", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({
                ok: false,
                status: 404,
                json: async () => ({ message: "Not Found" })
            }))
        )
        const data = await getUpdateData("1.6.6", false)
        expect(data.hasUpdate).toBe(false)
    })
})
