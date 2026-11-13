<script lang="ts">
    import { activeProfile, categories, sortedShowsList, special } from "../../../stores"
    import { getAccess } from "../../../utils/profile"
    import T from "../../helpers/T.svelte"
    import { keysToID, sortObject } from "../../helpers/array"
    import MaterialCheckbox from "../../inputs/MaterialCheckbox.svelte"
    import { toggleHymnCategory } from "../../drawer/hymns/hymns"

    // Beacon Worship — designate existing show categories as hymn books (Settings → General).
    // PowerPoint-imported decks are always hymns; marking a category additionally treats every
    // show in that category as a hymn deck. Persisted in special.hymnCategoryIds and consumed by
    // the Hymns tab / voice hymn commands. This does not edit show data or live output.

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: readOnly = profile.global === "read"
    $: hymnCategoryIds = $special.hymnCategoryIds || []

    // Only active (non-archived) show categories can be designated. Archived categories are
    // already excluded from the Hymns library, so offering them here would be misleading.
    $: candidateCategories = sortObject(
        keysToID($categories).filter((category) => !category.isArchive),
        "name"
    )

    $: showCounts = countShowsByCategory($sortedShowsList)
    function countShowsByCategory(shows: any[]): Record<string, number> {
        const counts: Record<string, number> = {}
        for (const show of shows || []) {
            if (!show?.category) continue
            counts[show.category] = (counts[show.category] || 0) + 1
        }
        return counts
    }

    function setCategory(categoryId: string, enabled: boolean) {
        if (readOnly) return
        special.update((a) => {
            const ids = toggleHymnCategory(a.hymnCategoryIds, categoryId, enabled)
            if (ids.length) return { ...a, hymnCategoryIds: ids }
            const next = { ...a }
            delete next.hymnCategoryIds
            return next
        })
    }
</script>

<div class="hymn-books">
    <p class="hint"><T id="hymns.books_hint" /></p>

    {#if candidateCategories.length}
        <div class="category-list">
            {#each candidateCategories as category (category.id)}
                <MaterialCheckbox
                    small
                    label={category.name}
                    icon={category.icon || "book"}
                    data={showCounts[category.id] || 0}
                    checked={hymnCategoryIds.includes(category.id)}
                    disabled={readOnly}
                    on:change={(e) => setCategory(category.id, e.detail)}
                />
            {/each}
        </div>
    {:else}
        <p class="empty"><T id="hymns.books_empty" /></p>
    {/if}
</div>

<style>
    .hymn-books {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .hint,
    .empty {
        margin: 0;
        font-size: 0.75em;
        opacity: 0.6;
        line-height: 1.4;
    }

    .category-list {
        display: flex;
        flex-direction: column;
        max-height: 260px;
        overflow-y: auto;
        border: 1px solid var(--primary-lighter);
        border-radius: 6px;
        padding: 4px;
        gap: 2px;
    }
</style>
