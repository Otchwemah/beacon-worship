// Tiny flag module so listeners.ts can skip output broadcasts during a folder import
// without importing PowerPointHelper at startup.

let hymnFolderImportActive = false

export function isHymnFolderImporting() {
    return hymnFolderImportActive
}

export function setHymnFolderImporting(active: boolean) {
    hymnFolderImportActive = active
}
