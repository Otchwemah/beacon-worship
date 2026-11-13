<script lang="ts">
    import { Main } from "../../../../types/IPC/Main"
    import type { ShowList } from "../../../../types/Show"
    import { sendMain } from "../../../IPC/main"
    import { activePopup, activeProfile, activeShow, categories, drawer, focusedArea, hymnFolders, hymnOptions, hymnSearchValue, sortedShowsList, special } from "../../../stores"
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
    import { filterDecksByFolder } from "./hymnFolders"
    import HymnCard from "./HymnCard.svelte"
    import HymnsToolbar from "./HymnsToolbar.svelte"

    // Beacon Worship — standalone Hymns library.
    // Single-click selects the deck in the Show panel only; double-click selects AND sends it
    // live. Grid tiles and list rows share presentDeck() so the two views cannot drift.
    // The left panel holds persistent system folders; the selection here filters the grid.

    export let active: string | null = null

    $: query = ($hymnSearchValue || "").trim()
    $: isSearching = query.length > 0
    $: category = active || "all"

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: readOnly = profile.global === "read"

    $: hymnCategoryIds = $special.hymnCategoryIds || []
    $: archivedCategoryIds = Object.entries($categories)
        .filter(([, c]) => c?.isArchive)
        .map(([id]) => id)
    $: hiddenCategoryIds = Object.entries(profile)
        .filter(([, level]) => level === "none")
        .map(([id]) => id)

    $: allHymnDecks = sortHymnDecks(
        filterHymnDecks($sortedShowsList, {
            category: "all",
            hymnCategoryIds,
            archivedCategoryIds,
            hiddenCategoryIds
        })
    )

    // left-panel selection: a loaded system folder, a hymn-book category, or everything
    $: isFolderSelection = !!(category && $hymnFolders[category])
    $: hymnDecks = isFolderSelection
        ? filterDecksByFolder(allHymnDecks, category, $hymnFolders)
        : sortHymnDecks(
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
        // search runs within the current folder selection, or across all folders on "All"
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

    function loadFolder() {
        sendMain(Main.IMPORT_FOLDER, { channel: "powerpoint", extensions: ["pptx", "ppt"], useFolderNameAsCategory: true, recursive: true })
    }

    $: mode = $hymnOptions.mode || "grid"
    $: columns = Math.max(1, Math.min(12, $hymnOptions.columns || 4))
</script>

<div class="hymns-panel">
    <HymnsToolbar count={filtered.length} total={hymnDecks.length} />

    {#if mode === "grid"}
        <Autoscroll style="overflow-y: auto;flex: 1;">
            <div class="grid-wrap {readOnly ? '' : 'context #drawer_show'}" on:mouseup={() => focusedArea.set("show_drawer")}>
                {#if filtered.length}
                    <div class="hymn-grid" style="grid-template-columns: repeat({columns}, minmax(0, 1fr));">
                        {#each filtered as show (show.id)}
                            <HymnCard {show} selected={$activeShow?.id === show.id} />
                        {/each}
                    </div>
                {:else if isSearching}
                    <Center size={1.2} faded><T id="empty.search" /></Center>
                {:else}
                    <Center size={1.1} faded>
                        <Icon id="book" size={2} />
                        <p style="margin-top: 10px;"><T id="hymns.empty" /></p>
                        <p class="sub"><T id="hymns.empty_hint" /></p>
                        <MaterialButton icon="folder" title="hymns.load_folder_hint" disabled={readOnly} on:click={loadFolder} style="margin-top: 16px;" white>
                            <T id="hymns.load_folder" />
                        </MaterialButton>
                    </Center>
                {/if}
            </div>
        </Autoscroll>
    {:else}
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
                        <MaterialButton icon="folder" title="hymns.load_folder_hint" disabled={readOnly} on:click={loadFolder} style="margin-top: 16px;" white>
                            <T id="hymns.load_folder" />
                        </MaterialButton>
                    </Center>
                {/if}
            </div>
        </Autoscroll>
    {/if}

    {#if !filtered.length && !isSearching}
        <FloatingInputs onlyOne gradient>
            <MaterialButton icon="import" title="actions.import [Ctrl+I]" disabled={readOnly} on:click={openImport} white>
                <T id="hymns.import" />
            </MaterialButton>
        </FloatingInputs>
    {/if}
</div>

<style>
    .hymns-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        position: relative;
    }

    .grid-wrap {
        background-color: var(--primary-darker);
        min-height: 100%;
        padding: 10px;
        padding-bottom: 60px;
    }

    .hymn-grid {
        display: grid;
        gap: 10px;
        align-items: start;
    }

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
