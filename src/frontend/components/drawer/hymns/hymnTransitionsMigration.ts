import { get } from "svelte/store"
import { shows, showsCache, special } from "../../../stores"
import { newToast } from "../../../utils/common"
import { loadShows } from "../../helpers/setShow"
import { repairHymnTransitions, shouldRepairHymnTransitions } from "./hymnTransitions"

// Beacon Worship — one-time repair of hymn decks imported before the transition fix.
//
// Runs after the stores are loaded and the save subscriber is attached, so the repaired
// layouts are persisted by the normal save path. Each show is recorded in
// special.hymnTransitionsRepaired, so this is a no-op on every later launch and an operator
// who deliberately re-disables a transition afterwards is not overridden again.

const BATCH_SIZE = 20

export async function repairImportedHymnTransitions(): Promise<number> {
    const allShows = get(shows)
    const repaired: string[] = get(special).hymnTransitionsRepaired || []

    const candidates = Object.keys(allShows).filter((id) => shouldRepairHymnTransitions(allShows[id], repaired, id))
    if (!candidates.length) return 0

    let fixedShows = 0
    const done: string[] = []

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
        const batch = candidates.slice(i, i + BATCH_SIZE)

        try {
            await loadShows(batch)
        } catch (err) {
            console.error("Hymn transition repair: could not load batch", err)
            continue
        }

        const updates: { id: string; layouts: any }[] = []

        batch.forEach((id) => {
            const full = get(showsCache)[id]
            if (!full) return

            const { layouts, changed } = repairHymnTransitions(full)
            if (changed) updates.push({ id, layouts })
            // mark as processed either way, so a deck with nothing to fix is not reloaded
            done.push(id)
        })

        if (updates.length) {
            showsCache.update((a) => {
                updates.forEach(({ id, layouts }) => {
                    if (a[id]) a[id].layouts = layouts
                })
                return a
            })
            fixedShows += updates.length
        }
    }

    if (done.length) {
        special.update((a) => {
            a.hymnTransitionsRepaired = [...new Set([...(a.hymnTransitionsRepaired || []), ...done])]
            return a
        })
    }

    if (fixedShows) newToast("hymns.transitions_repaired")

    return fixedShows
}
