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
    import { decksFromHymnFolders } from "./hymnFolders"
    import { enqueueMissingHymnThumbnails } from "./hymnThumbnails"
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

    $: isFolderSelection = !!(category && $hymnFolders[category])
    $: folderDecks = isFolderSelection
        ? decksFromHymnFolders($hymnFolders, category)
        : category === "all" || category === "unlabeled" || !category
          ? decksFromHymnFolders($hymnFolders)
          : decksFromHymnFolders($hymnFolders).filter((deck) => deck.category === category)
    $: importedDecks = filterHymnDecks($sortedShowsList, {
        category: isFolderSelection ? $hymnFolders[category]?.categoryId || "all" : category,
        hymnCategoryIds,
        archivedCategoryIds,
        hiddenCategoryIds
    })
    $: hymnDecks = sortHymnDecks(mergeHymnDecks([...folderDecks, ...importedDecks]))

    function mergeHymnDecks(list: ShowList[]): ShowList[] {
        const seen = new Set<string>()
        return list.filter((deck) => {
            if (!deck?.id || seen.has(deck.id)) return false
            seen.add(deck.id)
            return true
        })
    }

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

    // Don't mount all 850 hymn tiles at once — that freezes Windows after Load folder.
    let gridScroller: HTMLDivElement
    let scrollTop = 0
    let viewH = 400
    let wrapW = 0
    const GRID_GAP = 10
    const GRID_PAD = 10
    const NAME_BLOCK = 42

    function onGridScroll() {
        if (!gridScroller) return
        scrollTop = gridScroller.scrollTop
        viewH = gridScroller.clientHeight
        wrapW = gridScroller.clientWidth
    }

    $: if (!drawerIsClosed) enqueueMissingHymnThumbnails($hymnFolders)
    $: if (gridScroller && mode === "grid") onGridScroll()
    $: innerW = Math.max(0, wrapW - GRID_PAD * 2)
    $: tileW = columns > 0 && innerW > 0 ? (innerW - GRID_GAP * (columns - 1)) / columns : 160
    $: tileH = tileW * (9 / 16) + 5 + NAME_BLOCK
    $: rowH = tileH + GRID_GAP
    $: rowCount = Math.ceil(filtered.length / columns) || 0
    $: startRow = Math.max(0, Math.floor(scrollTop / Math.max(rowH, 1)) - 2)
    $: endRow = Math.min(rowCount, Math.ceil((scrollTop + viewH) / Math.max(rowH, 1)) + 3)
    $: rawVisible = filtered.slice(startRow * columns, endRow * columns)
    $: visibleDecks = rawVisible.length > 48 ? rawVisible.slice(0, 48) : rawVisible
    $: padTop = startRow * rowH
    $: padBottom = Math.max(0, (rowCount - endRow) * rowH)
</script>

<div class="hymns-panel">
    <HymnsToolbar count={filtered.length} total={hymnDecks.length} />

    {#if mode === "grid"}
        <div
            bind:this={gridScroller}
            bind:clientWidth={wrapW}
            bind:clientHeight={viewH}
            class="grid-wrap {readOnly ? '' : 'context #drawer_show'}"
            on:scroll={onGridScroll}
            on:mouseup={() => focusedArea.set("show_drawer")}
        >
            {#if filtered.length}
                <div class="hymn-grid-pad" style="height: {padTop}px;"></div>
                <div class="hymn-grid" style="grid-template-columns: repeat({columns}, minmax(0, 1fr));grid-auto-rows: {tileH}px;">
                    {#each visibleDecks as show (show.id)}
                        <HymnCard {show} selected={$activeShow?.id === show.id} />
                    {/each}
                </div>
                <div class="hymn-grid-pad" style="height: {padBottom}px;"></div>
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
        flex: 1 1 auto;
        min-height: 0;
        max-height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 10px;
        padding-bottom: 60px;
    }

    .hymn-grid-pad {
        width: 100%;
        pointer-events: none;
    }

    .hymn-grid {
        display: grid;
        gap: 10px;
        align-items: stretch;
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
