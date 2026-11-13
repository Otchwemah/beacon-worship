<script lang="ts">
    import { onMount } from "svelte"
    import type { ShowList } from "../../../../types/Show"
    import { activePage, activeShow, outputs, shows, showsCache } from "../../../stores"
    import { encodeFilePath } from "../../helpers/media"
    import { findMatchingOut } from "../../helpers/output"
    import { loadShows } from "../../helpers/setShow"
    import Icon from "../../helpers/Icon.svelte"
    import SlidePreviewBox from "../../inputs/SlidePreviewBox.svelte"
    import { getSlidePreview } from "../../inputs/showThumbnail"
    import { getHymnNumber } from "./hymns"
    import { presentDeck } from "./presentDeck"

    // Beacon Worship — a hymn tile for the grid view.
    //
    // Thumbnail order matches ShowButton exactly: stored deck preview → live first-slide
    // approximation → book icon. The live fallback needs the full show, so it is only
    // requested once the tile scrolls into view; loading 300+ decks up front would stall
    // the drawer. Going live calls the same presentDeck() the list rows use.

    export let show: ShowList
    export let selected = false

    $: id = show.id
    $: number = getHymnNumber(show)
    // Beacon Worship: the thumbnail is ALWAYS the first slide. PowerPoint's embedded
    // docProps/thumbnail.* is often a blank white frame, so it is only a last resort.
    $: storedThumbnail = show?.thumbnail || $shows[id]?.thumbnail || ""

    let elem: HTMLButtonElement
    let previewLoadRequested = false

    onMount(() => {
        if (typeof IntersectionObserver === "undefined") {
            requestPreview()
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting) return
                requestPreview()
                observer.disconnect()
            },
            { rootMargin: "300px" }
        )
        if (elem) observer.observe(elem)

        return () => observer.disconnect()
    })

    function requestPreview() {
        // no storedThumbnail short-circuit: the first slide always wins, so the deck must be
        // loaded even when the .pptx shipped an embedded preview.
        if (previewLoadRequested || $showsCache[id]) return
        previewLoadRequested = true
        loadShows([id])
    }

    $: livePreview = getSlidePreview($showsCache[id])
    $: thumbnailPath = livePreview ? "" : storedThumbnail
    $: isLive = findMatchingOut(id, $outputs) !== null
    $: isActive = $activeShow?.id === id

    function select() {
        activeShow.set({ id, name: show.name, type: "show" })
        if ($activePage !== "edit") activePage.set("show")
        // the live fallback needs the deck even if the tile was never scrolled into view
        requestPreview()
    }

    async function goLive(e: MouseEvent) {
        select()
        await loadShows([id])
        presentDeck(id, !e.altKey)
    }

    let clickTimer: NodeJS.Timeout | null = null
    function click() {
        // single click selects, double click goes live — same contract as the list rows
        if (clickTimer) return
        clickTimer = setTimeout(() => {
            clickTimer = null
            select()
        }, 200)
    }

    function dblclick(e: MouseEvent) {
        if (clickTimer) {
            clearTimeout(clickTimer)
            clickTimer = null
        }
        goLive(e)
    }

    function keydown(e: KeyboardEvent) {
        if (e.key === "Enter") goLive(e as unknown as MouseEvent)
        else if (e.key === " ") {
            e.preventDefault()
            select()
        }
    }
</script>

<button bind:this={elem} class="hymn-card" class:active={isActive} class:live={isLive} class:selected on:click={click} on:dblclick={dblclick} on:keydown={keydown} title={show.name} data-hymn-id={id}>
    <div class="thumb">
        {#if livePreview}
            <SlidePreviewBox preview={livePreview} />
        {:else if thumbnailPath}
            <img src={encodeFilePath(thumbnailPath)} alt="" loading="lazy" draggable="false" />
        {:else}
            <div class="placeholder">
                <Icon id="book" size={2} />
            </div>
        {/if}

        {#if number !== null}
            <span class="number">{number}</span>
        {/if}
        {#if isLive}
            <span class="live-dot" title="Live" />
        {/if}
    </div>

    <span class="name">{show.name}</span>
</button>

<style>
    .hymn-card {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: 0;
        gap: 5px;
        background: transparent;
        border: 2px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text);
        text-align: start;
        overflow: hidden;
    }

    .hymn-card:hover {
        background-color: var(--hover);
    }

    .hymn-card.selected,
    .hymn-card.active {
        border-color: var(--secondary);
    }

    .hymn-card.live .thumb {
        box-shadow: 0 0 0 2px var(--secondary);
    }

    .thumb {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 6px;
        overflow: hidden;
        background-color: var(--primary-darkest);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .thumb img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    }

    .thumb :global(.slide-preview) {
        width: 100%;
        height: 100%;
    }

    .placeholder {
        opacity: 0.35;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .number {
        position: absolute;
        bottom: 4px;
        inset-inline-start: 4px;
        padding: 1px 6px;
        font-size: 0.75em;
        font-weight: 700;
        border-radius: 4px;
        background-color: rgb(0 0 0 / 0.65);
        color: #fff;
        font-variant-numeric: tabular-nums;
    }

    .live-dot {
        position: absolute;
        top: 5px;
        inset-inline-end: 5px;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background-color: var(--secondary);
        box-shadow: 0 0 4px rgb(0 0 0 / 0.6);
    }

    .name {
        font-size: 0.8em;
        line-height: 1.3;
        padding: 0 3px 3px;
        width: 100%;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-word;
    }
</style>
