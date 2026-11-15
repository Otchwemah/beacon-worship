// Keep only the parts PowerPointHelper reads. Binary zip entries stay on disk via contentPaths.
export function slimPowerpointJson(json: any) {
    if (!json || typeof json !== "object") return json

    const out: any = {}
    for (const key of Object.keys(json)) {
        if (key === "contentPaths" || key === "deckThumbnailPath") {
            out[key] = json[key]
            continue
        }
        if (typeof Buffer !== "undefined" && Buffer.isBuffer(json[key])) continue
        if (key === "[Content_Types].xml" || key.endsWith(".xml") || key.endsWith(".rels")) out[key] = json[key]
    }
    return out
}
