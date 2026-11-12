<script lang="ts">
    import { activeProfile, categories, drawerTabsData, sortedShowsList, special } from "../../../stores"
    import { getAccess } from "../../../utils/profile"
    import { sortObject } from "../../helpers/array"
    import { filterHymnDecks, getHymnCategoryIds } from "../hymns/hymns"
    import NavigationSections from "./NavigationSections.svelte"

    // Beacon Worship — Hymns left navigation: "All hymns" plus one entry per hymn book
    // (category) that actually contains hymn decks. Categories are managed in the Shows
    // tab; this panel only navigates, so there is no create/rename here.

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: activeSubTab = $drawerTabsData.hymns?.activeSubTab || ""

    $: hymnCategoryIds = $special.hymnCategoryIds || []
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
        books.length ? [{ id: "TITLE", label: "hymns.books" }, ...books] : []
    ]
</script>

<NavigationSections {sections} active={activeSubTab} />
