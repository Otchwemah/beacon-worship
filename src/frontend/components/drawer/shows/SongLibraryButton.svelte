<script lang="ts">
    import { shows } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import Icon from "../../helpers/Icon.svelte"
    import T from "../../helpers/T.svelte"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import type { LibraryCollection } from "../../../values/songLibrary"
    import { CHRISTMAS_CAROLS } from "../../../values/carols"
    import { CLASSIC_HYMNS } from "../../../values/classicHymns"
    import { getMissingSongs } from "../../../values/songLibrary"
    import { installSongLibrary } from "./installSongLibrary"

    export let disabled = false

    let open = false
    let pickCarols = true
    let pickHymns = true
    let installing = false

    // reactive on $shows so the counts drop to zero right after an install
    $: existing = Object.values($shows || {})
    $: carolsMissing = getMissingSongs("carols", CHRISTMAS_CAROLS, existing as any).length
    $: hymnsMissing = getMissingSongs("hymns", CLASSIC_HYMNS, existing as any).length
    $: totalMissing = carolsMissing + hymnsMissing
    $: selectedCount = (pickCarols ? carolsMissing : 0) + (pickHymns ? hymnsMissing : 0)

    function install() {
        if (installing || !selectedCount) return
        installing = true

        const collections: LibraryCollection[] = []
        if (pickCarols) collections.push("carols")
        if (pickHymns) collections.push("hymns")

        // let the button repaint before the (synchronous) store write
        setTimeout(() => {
            try {
                installSongLibrary(collections)
                open = false
            } catch (err) {
                console.error("Could not add the song library:", err)
            } finally {
                installing = false
            }
        }, 30)
    }
</script>

<div class="song-library">
    <MaterialButton style="width: 100%;" title="songs.add_library_hint" variant="outlined" {disabled} on:click={() => (open = !open)} small>
        <Icon id="add" size={0.9} white />
        <T id="songs.add_library" />
    </MaterialButton>

    {#if open}
        <div class="panel">
            <p class="hint"><T id="songs.library_hint" /></p>

            <label class="row" class:none={!carolsMissing}>
                <input type="checkbox" bind:checked={pickCarols} disabled={!carolsMissing} />
                <span class="name"><T id="songs.library_carols" /></span>
                <span class="count">
                    {#if carolsMissing}{carolsMissing}{:else}<T id="songs.library_none" />{/if}
                </span>
            </label>

            <label class="row" class:none={!hymnsMissing}>
                <input type="checkbox" bind:checked={pickHymns} disabled={!hymnsMissing} />
                <span class="name"><T id="songs.library_hymns" /></span>
                <span class="count">
                    {#if hymnsMissing}{hymnsMissing}{:else}<T id="songs.library_none" />{/if}
                </span>
            </label>

            <MaterialButton style="width: 100%;" class="install-song-library" variant="filled" disabled={installing || !selectedCount || !totalMissing} on:click={install} small>
                {#if totalMissing}
                    <T id="songs.library_install" />
                    {#if selectedCount}<span class="badge">{selectedCount}</span>{/if}
                {:else}
                    <T id="songs.library_none" />
                {/if}
            </MaterialButton>
        </div>
    {/if}
</div>

<style>
    .song-library {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .panel {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        border-radius: 6px;
        background-color: var(--primary-darker);
    }

    .hint {
        font-size: 0.75em;
        opacity: 0.7;
        line-height: 1.35;
        margin-bottom: 2px;
    }

    .row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85em;
        cursor: pointer;
    }
    .row.none {
        opacity: 0.5;
        cursor: default;
    }

    .name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .count {
        font-size: 0.85em;
        opacity: 0.7;
        font-variant-numeric: tabular-nums;
    }

    .badge {
        margin-left: 6px;
        padding: 0 6px;
        border-radius: 8px;
        background-color: var(--primary-lighter);
        font-size: 0.85em;
        font-variant-numeric: tabular-nums;
    }
</style>
