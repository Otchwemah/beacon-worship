<script lang="ts">
    import { get } from "svelte/store"
    import { activeProfile, categories, saved, showsCache, sortedShowsList, special } from "../../../stores"
    import { newToast } from "../../../utils/common"
    import { getAccess } from "../../../utils/profile"
    import { imageExtensions } from "../../../values/extensions"
    import T from "../../helpers/T.svelte"
    import MaterialFilePicker from "../../inputs/MaterialFilePicker.svelte"
    import { applyHymnBackground, filterHymnDecks } from "../../drawer/hymns/hymns"

    // Tile art always follows special.hymnBackgroundImage (instant).
    // Already-converted decks in memory get the same image on their slides — no
    // loadShows of the whole library, so this stays in seconds even at 850 hymns.

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: readOnly = profile.global === "read"
    $: hymnBackground = $special.hymnBackgroundImage || ""
    $: hymnCategoryIds = $special.hymnCategoryIds || []
    $: hiddenCategoryIds = Object.entries(profile)
        .filter(([, level]) => level === "none")
        .map(([id]) => id)

    $: visibleDecks = filterHymnDecks($sortedShowsList, { category: "all", hymnCategoryIds, hiddenCategoryIds })
    $: unarchivedDecks = visibleDecks.filter((s) => !$categories[s.category || ""]?.isArchive)

    let applying = false
    function setBackground(e: any) {
        const path = (e.detail || "").trim()
        if (applying || path === hymnBackground) return

        special.update((a) => ({ ...a, hymnBackgroundImage: path }))

        const cache = get(showsCache)
        const ids = unarchivedDecks.map((s) => s.id).filter((id) => cache[id]?.slides)
        if (ids.length) {
            applying = true
            const now = Date.now()
            showsCache.update((a) => {
                ids.forEach((id) => {
                    if (!a[id]) return
                    const applied = applyHymnBackground(a[id], path)
                    a[id] = { ...a[id], slides: applied.slides, layouts: applied.layouts, timestamps: { ...a[id].timestamps, modified: now } }
                })
                return a
            })
            saved.set(false)
            applying = false
        }

        newToast(path ? "hymns.background_applied" : "hymns.background_cleared")
    }
</script>

<div class="hymn-background">
    <MaterialFilePicker label="hymns.background_label" value={hymnBackground} filter={{ name: "Images", extensions: imageExtensions }} on:change={setBackground} disabled={readOnly || applying} allowEmpty showThumbnail />
    <p class="hint"><T id="hymns.background_hint" /></p>
</div>

<style>
    .hymn-background {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .hint {
        margin: 0;
        font-size: 0.85em;
        opacity: 0.7;
    }
</style>
