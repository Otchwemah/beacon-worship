// Beacon Worship — installs the built-in carols & hymns into the Shows tab.
//
// Goes through `history()` exactly like the text importer does, so the whole install is a
// single undoable action and the shows are persisted by the normal autosave path.

import { get } from "svelte/store"
import type { Show } from "../../../../types/Show"
import { CHRISTMAS_CAROLS } from "../../../values/carols"
import { CLASSIC_HYMNS } from "../../../values/classicHymns"
import { LIBRARY_CATEGORIES, buildLibraryShow, getMissingSongs, libraryShowId } from "../../../values/songLibrary"
import type { LibraryCollection, LibrarySong } from "../../../values/songLibrary"
import { categories, shows } from "../../../stores"
import { newToast } from "../../../utils/common"
import { history } from "../../helpers/history"
import { updateShowsList } from "../../helpers/show"

export const LIBRARY_SONGS: Record<LibraryCollection, LibrarySong[]> = {
    carols: CHRISTMAS_CAROLS,
    hymns: CLASSIC_HYMNS
}

export function getLibraryCounts() {
    const existing = Object.values(get(shows) || {}) as Show[]
    return {
        carols: getMissingSongs("carols", CHRISTMAS_CAROLS, existing).length,
        hymns: getMissingSongs("hymns", CLASSIC_HYMNS, existing).length
    }
}

/**
 * Adds any missing carols/hymns to their categories. Safe to run repeatedly — titles already
 * present in the target category (or previously installed from the library) are skipped.
 * Returns how many shows were added per collection.
 */
export function installSongLibrary(collections: LibraryCollection[] = ["carols", "hymns"]): Record<LibraryCollection, number> {
    const added: Record<LibraryCollection, number> = { carols: 0, hymns: 0 }
    const existing = Object.values(get(shows) || {}) as Show[]
    const created = Date.now()

    const newShows: { id: string; show: Show }[] = []
    const newCategories: { id: string; name: string; icon: string }[] = []

    collections.forEach((collection) => {
        const missing = getMissingSongs(collection, LIBRARY_SONGS[collection], [...existing, ...newShows.map((a) => a.show)])
        if (!missing.length) return

        const category = LIBRARY_CATEGORIES[collection]
        if (!get(categories)[category.id]) newCategories.push(category)

        missing.forEach((song) => {
            newShows.push({ id: libraryShowId(collection, song.id), show: buildLibraryShow(collection, song, created) })
        })
        added[collection] = missing.length
    })

    if (!newShows.length) {
        newToast("songs.library_already_installed")
        return added
    }

    // one history entry => one Ctrl+Z undoes the whole install
    newCategories.forEach((category) => {
        history({
            id: "UPDATE",
            newData: { data: { name: category.name, icon: category.icon } },
            oldData: { id: category.id },
            location: { page: "drawer", id: "category_shows" }
        })
    })

    history({ id: "SHOWS", newData: { data: newShows, replace: true }, location: { page: "show" } })

    setTimeout(() => updateShowsList(get(shows)), 50)
    newToast("songs.library_installed")

    return added
}
