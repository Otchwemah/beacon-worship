<script lang="ts">
    import type { ShowList } from "../../../../types/Show"
    import { activePopup, activeProfile, activeShow, categories, drawer, focusedArea, hymnSearchValue, sortedShowsList, special } from "../../../stores"
    import { getAccess } from "../../../utils/profile"
    import T from "../../helpers/T.svelte"
    import Icon from "../../helpers/Icon.svelte"
    import { dateToString } from "../../helpers/time"
    import FloatingInputs from "../../input/FloatingInputs.svelte"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import ShowButton from "../../inputs/ShowButton.svelte"
    import Autoscroll from "../../system/Autoscroll.svelte"
    import Center from "../../system/Center.svelte"
    import SelectElem from "../../system/SelectElem.svelte"
    import VirtualList from "../VirtualList.svelte"
    import { filterHymnDecks, getHymnNumber, searchHymnDecks, sortHymnDecks } from "./hymns"

    // Beacon Worship — standalone Hymns library.
    // Single-click selects the deck in the Show panel only; double-click selects AND
    // sends it live. Both behaviours come from ShowButton, which the Shows drawer also
    // uses, so hymns behave exactly like the rest of the app (no separate live path).

    export let active: string | null = null

    // dedicated Hymns search bar (in the Hymns navigation), mirrored by the top drawer search
    // while this tab is active. Number matching applies only
    // when the query is numeric; otherwise it matches deck names. See searchHymnDecks().
    $: query = ($hymnSearchValue || "").trim()
    $: isSearching = query.length > 0
    $: category = active || "all"

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: readOnly = profile.global === "read"

    // categories the operator has designated as hymn books (in addition to PPT imports)
    $: hymnCategoryIds = $special.hymnCategoryIds || []
    $: archivedCategoryIds = Object.entries($categories)
        .filter(([, c]) => c?.isArchive)
        .map(([id]) => id)
    $: hiddenCategoryIds = Object.entries(profile)
        .filter(([, level]) => level === "none")
        .map(([id]) => id)

    $: hymnDecks = sortHymnDecks(
        filterHymnDecks($sortedShowsList, {
            category,
            hymnCategoryIds,
            archivedCategoryIds,
            hiddenCategoryIds
        })
    )

    // don't recompute the whole list while the drawer is closed (same guard as Shows)
    $: drawerIsClosed = $drawer.height <= 40
    let filtered: ShowList[] = []
    let shouldUpdate = false
    $: if (hymnDecks || query) scheduleUpdate()
    $: if (shouldUpdate && !drawerIsClosed) update()
    function scheduleUpdate() {
        if (drawerIsClosed) {
            shouldUpdate = true
            return
        }
        update()
    }
    function update() {
        shouldUpdate = false
        filtered = searchHymnDecks(hymnDecks, query)
    }

    function label(show: ShowList): string {
        const n = getHymnNumber(show)
        if (n !== null) return `#${n}`
        return dateToString(show.timestamps?.modified || show.timestamps?.created || "", true)
    }

    function openImport() {
        activePopup.set("import")
    }
</script>

<Autoscroll style="overflow-y: auto;flex: 1;">
    <div class="column {readOnly ? '' : 'context #drawer_show'}" on:mouseup={() => focusedArea.set("show_drawer")}>
        {#if filtered.length}
            <div class="hint">
                <Icon id="info" size={0.85} />
                <span><T id="hymns.click_hint" /></span>
            </div>

            {#key category}
                <VirtualList items={filtered} let:item={show} activeIndex={filtered.findIndex((a) => a.id === $activeShow?.id)}>
                    <SelectElem id="show_drawer" data={{ id: show.id }} shiftRange={filtered} draggable>
                        <ShowButton id={show.id} {show} data={label(show)} class="#drawer_show_button" match={null} searchValue={query} icon />
                    </SelectElem>
                </VirtualList>
            {/key}
        {:else if isSearching}
            <Center size={1.2} faded><T id="empty.search" /></Center>
        {:else}
            <Center size={1.1} faded>
                <Icon id="book" size={2} />
                <p style="margin-top: 10px;"><T id="hymns.empty" /></p>
                <p class="sub"><T id="hymns.empty_hint" /></p>
            </Center>
        {/if}
    </div>
</Autoscroll>

{#if !filtered.length && !isSearching}
    <FloatingInputs onlyOne gradient>
        <MaterialButton icon="import" title="actions.import [Ctrl+I]" disabled={readOnly} on:click={openImport} white>
            <T id="hymns.import" />
        </MaterialButton>
    </FloatingInputs>
{/if}

<style>
    .column {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        background-color: var(--primary-darker);
        height: 100%;

        --number-width: 100px;
        --modified-width: 160px;
    }

    .column :global(svelte-virtual-list-viewport) {
        padding-bottom: 60px;
    }

    .hint {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        font-size: 0.75em;
        opacity: 0.6;
        border-bottom: 1px solid var(--primary-lighter);
        flex-shrink: 0;
    }

    .sub {
        font-size: 0.85em;
        opacity: 0.8;
        max-width: 420px;
        white-space: normal;
        line-height: 1.5;
        padding: 0 20px;
    }
</style>
