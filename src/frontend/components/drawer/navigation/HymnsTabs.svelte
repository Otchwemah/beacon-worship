<script lang="ts">
    import { activeProfile, categories, drawerTabsData, hymnSearchValue, sortedShowsList, special } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import { getAccess } from "../../../utils/profile"
    import Icon from "../../helpers/Icon.svelte"
    import { sortObject } from "../../helpers/array"
    import { filterHymnDecks, getHymnCategoryIds } from "../hymns/hymns"
    import NavigationSections from "./NavigationSections.svelte"

    // Beacon Worship — Hymns left navigation: "All hymns" plus one entry per hymn book
    // (category) that actually contains hymn decks, and a dedicated hymn search bar.
    // While the Hymns tab is active, this bar and the top drawer search mirror the same query.
    // The saved hymn background now lives in Settings → General. Categories are managed
    // in the Shows tab; this panel only navigates and searches.

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
        books.length ? [{ id: "TITLE", label: "hymns.books" }, ...books] : [],
        [{ id: "TITLE", label: "hymns.search" }]
    ]
</script>

<NavigationSections {sections} active={activeSubTab}>
    <div slot="section_2" class="hymn-search">
        <div class="search-box">
            <Icon id="search" size={0.9} />
            <input class="edit" type="text" placeholder={translateText("hymns.search_placeholder")} bind:value={$hymnSearchValue} />
            {#if $hymnSearchValue}
                <button class="clear" title={translateText("clear.search")} on:click={() => hymnSearchValue.set("")}>
                    <Icon id="close" size={0.8} />
                </button>
            {/if}
        </div>
        <p class="hint">{translateText("hymns.search_hint")}</p>
    </div>
</NavigationSections>

<style>
    .hymn-search {
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .search-box {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background-color: var(--primary-darkest);
        border: 1px solid var(--primary-lighter);
        border-radius: 6px;
    }

    .search-box input {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text);
        font-size: 0.85em;
        padding: 4px 0;
    }

    .clear {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text);
        opacity: 0.6;
        padding: 2px;
    }
    .clear:hover {
        opacity: 1;
    }

    .hint {
        margin: 0;
        font-size: 0.7em;
        opacity: 0.6;
        line-height: 1.4;
    }
</style>
