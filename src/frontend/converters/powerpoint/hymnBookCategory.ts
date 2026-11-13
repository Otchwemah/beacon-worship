// Beacon Worship — category id derivation for hymn-book folder imports.
//
// This MUST stay byte-identical to the id rule in converters/importHelpers.ts createCategory():
//     name.toLowerCase().replace(/[()]/g, "").trim().replace(/\s+/g, "_")
// If it drifts, a folder import would register category X as a hymn book while createCategory()
// actually created category Y, and the imported decks would not appear in the Hymns tab.

export function hymnBookCategoryId(name: string): string {
    return (name || "")
        .toLowerCase()
        .replace(/[()]/g, "")
        .trim()
        .replace(/\s+/g, "_")
}
