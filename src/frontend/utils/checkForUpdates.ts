import { get } from "svelte/store"
import { activePopup, alertUpdates, isDev, popupData, special } from "./../stores"

interface UpdateData {
    latestVersion: string
    changelog: string
    hasUpdate: boolean
}

const RELEASES_URL = "https://api.github.com/repos/Otchwemah/beacon-worship/releases"
const EMPTY_UPDATE: UpdateData = { latestVersion: "", changelog: "", hasUpdate: false }

/**
 * True only when `latest` is a strictly newer version than `current`.
 * String inequality is not enough: Beacon Worship ships as 1.6.6, and comparing
 * that with any other project's tag (or any other string) used to open the
 * "download update" popup on every fresh install.
 */
export function isNewerVersion(latest: string, current: string): boolean {
    if (!latest || !current) return false

    const parse = (v: string) => {
        const trimmed = v.trim().replace(/^v/i, "")
        const [core, pre = ""] = trimmed.split("-")
        const parts = core.split(".").map((n) => {
            const x = parseInt(n, 10)
            return Number.isFinite(x) ? x : 0
        })
        while (parts.length < 3) parts.push(0)
        return { parts: parts.slice(0, 3), pre }
    }

    const a = parse(latest)
    const b = parse(current)
    if (a.parts.join(".") === b.parts.join(".") && a.pre === b.pre) return false

    for (let i = 0; i < 3; i++) {
        if (a.parts[i] > b.parts[i]) return true
        if (a.parts[i] < b.parts[i]) return false
    }
    // equal numeric core: a stable release is newer than a prerelease of the same core
    if (!a.pre && b.pre) return true
    if (a.pre && !b.pre) return false
    return a.pre > b.pre
}

export async function getUpdateData(currentVersion: string, includeBeta: boolean): Promise<UpdateData> {
    const response = await fetch(RELEASES_URL)
    if (!response.ok) {
        if (response.status === 404) return EMPTY_UPDATE
        throw new Error(`Beacon Worship releases ${response.status}`)
    }

    const data = await response.json()
    if (!Array.isArray(data)) return EMPTY_UPDATE

    const latestAll = data.filter((a: any) => a.draft === false)[0]
    const latestRelease = data.filter((a: any) => a.draft === false && a.prerelease === false)[0]

    const tagOf = (release: any) => (release?.tag_name || "").replace(/^v/i, "")
    const latestVersionAll = tagOf(latestAll)
    const latestVersionStable = tagOf(latestRelease) || latestVersionAll
    const latestVersion = includeBeta ? latestVersionAll : latestVersionStable
    const changelog = includeBeta ? latestAll?.body || "" : latestRelease?.body || latestAll?.body || ""

    return {
        latestVersion,
        changelog,
        hasUpdate: isNewerVersion(latestVersion, currentVersion)
    }
}

export function checkForUpdates(currentVersion: string) {
    if (get(isDev) || get(alertUpdates) === false) return
    const includeBeta = currentVersion.includes("-beta") || get(special).betaVersionAlert

    getUpdateData(currentVersion, includeBeta)
        .then(({ latestVersion, changelog, hasUpdate }) => {
            if (get(activePopup) !== null) return
            if (!hasUpdate) return

            popupData.set({ changelog, latestVersion })
            activePopup.set("new_update")
        })
        .catch((error) => {
            console.warn(error)
        })
}
