<script lang="ts">
    import { get } from "svelte/store"
    import { activeProfile, categories, showsCache, sortedShowsList, special } from "../../../stores"
    import { newToast } from "../../../utils/common"
    import { getAccess } from "../../../utils/profile"
    import { imageExtensions } from "../../../values/extensions"
    import T from "../../helpers/T.svelte"
    import { history } from "../../helpers/history"
    import { loadShows } from "../../helpers/setShow"
    import MaterialFilePicker from "../../inputs/MaterialFilePicker.svelte"
    import { applyHymnBackground, filterHymnDecks } from "../../drawer/hymns/hymns"

    // Beacon Worship — saved hymn background, configured in Settings (General).
    // Selecting an image replaces the background on every hymn slide and is persisted in
    // special.hymnBackgroundImage (also applied to future PowerPoint imports). This only
    // edits show data; it never calls setOutput itself.

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
    async function setBackground(e: any) {
        const path = (e.detail || "").trim()
        if (applying || path === hymnBackground) return

        special.update((a) => ({ ...a, hymnBackgroundImage: path }))

        const ids = unarchivedDecks.map((s) => s.id)
        if (!ids.length) {
            newToast(path ? "hymns.background_saved" : "hymns.background_cleared")
            return
        }

        applying = true
        try {
            await loadShows(ids)
            const now = Date.now()
            const data = ids
                .map((id) => {
                    const show = get(showsCache)[id]
                    if (!show) return null
                    const { slides, layouts } = applyHymnBackground(show, path)
                    return { id, show: { slides, layouts, timestamps: { ...show.timestamps, modified: now } } }
                })
                .filter(Boolean)

            if (data.length) history({ id: "SHOWS", newData: { data, replace: true }, location: { page: "drawer" } })
            newToast(path ? "hymns.background_applied" : "hymns.background_cleared")
        } finally {
            applying = false
        }
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
        font-size: 0.75em;
        opacity: 0.6;
        line-height: 1.4;
    }
</style>
