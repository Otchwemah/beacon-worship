<script lang="ts">
    import { aiSuggestions, hymnOptions, hymnSearchValue, outLocked } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import Icon from "../../helpers/Icon.svelte"
    import { startShow } from "../../helpers/showActions"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import MaterialZoom from "../../inputs/MaterialZoom.svelte"

    // Beacon Worship — Hymns toolbar, directly above the grid it filters.
    // "Load folder" lives in the LEFT panel (like the Media tab); this bar only searches,
    // switches grid/list, and adjusts the tile size.

    export let count = 0
    export let total = 0

    let searchElem: HTMLInputElement | null = null

    $: isSearching = Boolean(($hymnSearchValue || "").trim().length)
    $: mode = $hymnOptions.mode || "grid"
    $: columns = $hymnOptions.columns || 4
    $: hymnHit = $aiSuggestions.find((item) => item.kind === "hymn" && item.hymnShowId)

    function clearSearch() {
        hymnSearchValue.set("")
        searchElem?.focus()
    }

    function keydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            e.stopPropagation()
            clearSearch()
        }
    }

    function setMode(next: "grid" | "list") {
        hymnOptions.update((a) => ({ ...a, mode: next }))
    }

    function setColumns(e: any) {
        const value = Math.max(1, Math.min(12, Math.round(e.detail)))
        hymnOptions.update((a) => ({ ...a, columns: value }))
    }
</script>

<div class="hymns-toolbar">
    <div class="search-box" class:searching={isSearching}>
        <Icon id="search" size={1} />
        <input bind:this={searchElem} class="edit hymn-search-input" type="text" placeholder={translateText("hymns.search_placeholder")} bind:value={$hymnSearchValue} on:keydown={keydown} />
        {#if isSearching}
            <button class="clear" title={translateText("clear.search")} on:click={clearSearch}>
                <Icon id="close" size={0.9} />
            </button>
        {/if}
    </div>

    {#if hymnHit}
        <MaterialButton variant="contained" icon="play" disabled={$outLocked} title="Send this hymn live" on:click={() => hymnHit?.hymnShowId && startShow(hymnHit.hymnShowId)}>
            Go live
        </MaterialButton>
    {/if}

    <span class="count" title={translateText("hymns.count_hint")}>
        {#if isSearching}{count} / {total}{:else}{total}{/if}
    </span>

    <div class="view-toggle">
        <button class="view-btn" class:on={mode === "grid"} title={translateText("hymns.view_grid")} on:click={() => setMode("grid")}>
            <Icon id="grid" size={1.1} white={mode === "grid"} />
        </button>
        <button class="view-btn" class:on={mode === "list"} title={translateText("hymns.view_list")} on:click={() => setMode("list")}>
            <Icon id="list" size={1.1} white={mode === "list"} />
        </button>
    </div>

    {#if mode === "grid"}
        <div class="zoom" style="--size: 34px;">
            <MaterialZoom {columns} defaultValue={4} min={1} max={12} on:change={setColumns} />
        </div>
    {/if}
</div>

<style>
    .hymns-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background-color: var(--primary-darker);
        border-bottom: 1px solid var(--primary-lighter);
        flex-shrink: 0;
    }

    .search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
        padding: 5px 10px;
        background-color: var(--primary-darkest);
        border: 1px solid var(--primary-lighter);
        border-radius: 8px;
        transition: border-color 0.15s ease;
    }

    .search-box:focus-within,
    .search-box.searching {
        border-color: var(--secondary);
    }

    .search-box input {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text);
        font-size: 0.95em;
        padding: 2px 0;
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

    .count {
        font-size: 0.8em;
        opacity: 0.6;
        min-width: 3.5em;
        text-align: right;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }

    .view-toggle {
        display: flex;
        border: 1px solid var(--primary-lighter);
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
    }

    .view-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px 8px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text);
        opacity: 0.6;
    }
    .view-btn:hover {
        background-color: var(--hover);
        opacity: 1;
    }
    .view-btn.on {
        background-color: var(--primary-lighter);
        opacity: 1;
    }

    .zoom {
        display: flex;
        align-items: center;
        height: 30px;
        flex-shrink: 0;
    }
</style>
