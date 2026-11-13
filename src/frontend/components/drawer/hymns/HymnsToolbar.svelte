<script lang="ts">
    import { Main } from "../../../../types/IPC/Main"
    import { sendMain } from "../../../IPC/main"
    import { hymnSearchValue } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import Icon from "../../helpers/Icon.svelte"

    // Beacon Worship — Hymns toolbar, sitting directly above the hymn list.
    // Previously the search box lived in the left navigation column, which put it beside
    // the results instead of above them. It now spans the list it filters.

    export let readOnly = false
    export let count = 0
    export let total = 0

    let searchElem: HTMLInputElement | null = null

    $: isSearching = Boolean(($hymnSearchValue || "").trim().length)

    function loadFolder() {
        // Scans the chosen folder (recursively) for .pptx/.ppt and imports every deck into a
        // hymn-book category named after the folder. Handled in the main process.
        sendMain(Main.IMPORT_FOLDER, { channel: "powerpoint", extensions: ["pptx", "ppt"], useFolderNameAsCategory: true, recursive: true })
    }

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

    <button class="load-folder" title={translateText("hymns.load_folder_hint")} disabled={readOnly} on:click={loadFolder}>
        <Icon id="folder" size={1.1} />
        <span>{translateText("hymns.load_folder")}</span>
    </button>

    <span class="count" title={translateText("hymns.count_hint")}>
        {#if isSearching}
            {count} / {total}
        {:else}
            {total}
        {/if}
    </span>
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

    .load-folder {
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        padding: 6px 12px;
        font-size: 0.9em;
        color: var(--text);
        background-color: var(--primary-lighter);
        border: 1px solid var(--primary-lighter);
        border-radius: 8px;
        cursor: pointer;
    }
    .load-folder:hover:enabled {
        background-color: var(--hover);
        border-color: var(--secondary);
    }
    .load-folder:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .count {
        font-size: 0.8em;
        opacity: 0.6;
        min-width: 3.5em;
        text-align: right;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }

    /* narrow drawer: drop the button label, keep the icon */
    @media screen and (max-width: 900px) {
        .load-folder span {
            display: none;
        }
    }
</style>
