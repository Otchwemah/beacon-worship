/**
 * Beacon Worship — PowerPoint media path resolution.
 *
 * `pptToShow` extracts `ppt/media/*` to disk and records a map from the package entry name
 * to the extracted file path. Slide/background relationships, however, can reference that
 * media with different spellings: relative targets (`../media/image1.png`), leading slashes,
 * backslashes, URL-encoded names, or case differences. If the lookup misses, the converted
 * slide keeps a package-relative path and its preview/thumbnail cannot load.
 *
 * This helper is pure and unit-tested. It returns the extracted filesystem path when it can
 * be found, otherwise null (the caller may fall back to the original target).
 */

function decodeSafe(value: string): string {
    try {
        return decodeURIComponent(value)
    } catch {
        return value
    }
}

/** Normalize separators / leading slashes so package paths can be compared reliably. */
export function normalizePowerpointPath(value: string): string {
    return value
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .replace(/\/{2,}/g, "/")
}

/** Resolve an OPC relative target against the part that references it (e.g. ppt/slides/slide1.xml). */
export function resolvePowerpointTarget(fromPath: string | null | undefined, target: string): string {
    const normalizedTarget = normalizePowerpointPath(target)
    if (!fromPath || normalizedTarget.startsWith("ppt/") || /^[a-zA-Z]:\//.test(normalizedTarget)) return normalizedTarget

    const base = normalizePowerpointPath(fromPath)
    const baseDir = base.includes("/") ? base.slice(0, base.lastIndexOf("/") + 1) : ""
    const combined = (baseDir + normalizedTarget).split("/")
    const parts: string[] = []
    for (const part of combined) {
        if (!part || part === ".") continue
        if (part === "..") parts.pop()
        else parts.push(part)
    }
    return parts.join("/")
}

/**
 * Find the extracted file path for a PowerPoint media target.
 * `contentPaths` maps package entry names (e.g. "ppt/media/image1.png") to filesystem paths.
 */
export function resolvePowerpointMediaPath(target: string | null | undefined, contentPaths: Record<string, string> | null | undefined, fromPath?: string | null): string | null {
    if (!target || typeof target !== "string") return null

    // External / already-usable URLs are returned unchanged.
    if (/^(https?|data|file|blob):/i.test(target)) return target

    const paths = contentPaths || {}
    const normalizedTarget = normalizePowerpointPath(target)
    const decodedTarget = normalizePowerpointPath(decodeSafe(target))
    const resolvedTarget = resolvePowerpointTarget(fromPath, target)
    const basename = normalizedTarget.split("/").pop() || ""

    const candidates = [target, normalizedTarget, decodedTarget, resolvedTarget, normalizePowerpointPath(decodeSafe(resolvedTarget))]
    if (basename && !normalizedTarget.startsWith("ppt/media/")) candidates.push(`ppt/media/${basename}`)

    // Exact / normalized candidate lookup.
    for (const candidate of candidates) {
        if (paths[candidate]) return paths[candidate]
    }

    // Case-insensitive / decoded lookup over the recorded package entries.
    const normalizedEntries = Object.entries(paths).map(([key, value]) => ({ key: normalizePowerpointPath(decodeSafe(key)).toLowerCase(), value }))
    for (const candidate of candidates) {
        const needle = normalizePowerpointPath(decodeSafe(candidate)).toLowerCase()
        const match = normalizedEntries.find((entry) => entry.key === needle)
        if (match) return match.value
    }

    // Last resort: match by basename inside ppt/media/ (handles unusual relative folders).
    if (basename) {
        const needle = decodeSafe(basename).toLowerCase()
        const match = normalizedEntries.find((entry) => entry.key.startsWith("ppt/media/") && entry.key.split("/").pop() === needle)
        if (match) return match.value
    }

    return null
}
