<script lang="ts">
    import { get } from "svelte/store"
    import { activeProfile, categories, drawerTabsData, showsCache, sortedShowsList, special } from "../../../stores"
    import { newToast } from "../../../utils/common"
    import { getAccess } from "../../../utils/profile"
    import { imageExtensions } from "../../../values/extensions"
    import { sortObject } from "../../helpers/array"
    import T from "../../helpers/T.svelte"
    import { history } from "../../helpers/history"
    import { loadShows } from "../../helpers/setShow"
    import MaterialFilePicker from "../../inputs/MaterialFilePicker.svelte"
    import { applyHymnBackground, filterHymnDecks, getHymnCategoryIds } from "../hymns/hymns"
    import NavigationSections from "./NavigationSections.svelte"

    // Beacon Worship — Hymns left navigation: "All hymns" plus one entry per hymn book
    // (category) that actually contains hymn decks, and a saved-background picker that
    // replaces the background on every hymn slide. Categories are managed in the Shows
    // tab; this panel only navigates and sets the shared hymn background.

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: readOnly = profile.global === "read"
    $: activeSubTab = $drawerTabsData.hymns?.activeSubTab || ""

    $: hymnCategoryIds = $special.hymnCategoryIds || []
    $: hymnBackground = $special.hymnBackgroundImage || ""
    $: hiddenCategoryIds = Object.entries(profile)
        .filter(([, level]) => level === "none")
        .map(([id]) => id)

    $: visibleDecks = filterHymnDecks($sortedShowsList, { category: "all", hymnCategoryIds, hiddenCategoryIds })
    $: unarchivedDecks = visibleDecks.filter((s) => !$categories[s.category || ""]?.isArchive)
    $: unlabeledCount = unarchivedDecks.filter((s) => !s.category || !$categories[s.category]).length

    $: bookIds = getHymnCategoryIds(unarchivedDecks, hymnCategoryIds)
    $: books = sortObject(
        bookIds.map((id) => ({ id, ...(($categories[id] || { name: id }) as any) })),
        "name"
    ).map((cat: any) => ({
        id: cat.id,
        label: cat.name || cat.id,
        icon: cat.icon,
        customIcon: true,
        boxedIcon: true,
        count: unarchivedDecks.filter((s) => s.category === cat.id).length
    }))

    let sections: any[] = []
    $: sections = [
        [
            { id: "all", label: "category.all", icon: "all", count: unarchivedDecks.length },
            { id: "unlabeled", label: "category.unlabeled", icon: "noIcon", count: unlabeledCount, hidden: !unlabeledCount && activeSubTab !== "unlabeled" }
        ],
        books.length ? [{ id: "TITLE", label: "hymns.books" }, ...books] : [],
        [{ id: "TITLE", label: "hymns.background" }]
    ]

    // Selecting a saved background image replaces the background on ALL hymn slides.
    // The choice is persisted in `special.hymnBackgroundImage` and also applied to future
    // PowerPoint imports. This only edits show data; it never calls setOutput itself.
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

<NavigationSections {sections} active={activeSubTab}>
    <div slot="section_2" class="background-picker">
        <MaterialFilePicker label="hymns.background_label" value={hymnBackground} filter={{ name: "Images", extensions: imageExtensions }} on:change={setBackground} disabled={readOnly || applying} allowEmpty showThumbnail />
        <p class="hint"><T id="hymns.background_hint" /></p>
    </div>
</NavigationSections>

<style>
    .background-picker {
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .hint {
        margin: 0;
        font-size: 0.7em;
        opacity: 0.6;
        line-height: 1.4;
    }
</style>
