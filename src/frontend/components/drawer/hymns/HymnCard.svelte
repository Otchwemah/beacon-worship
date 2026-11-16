<script lang="ts">
    import { onMount } from "svelte"
    import type { ShowList } from "../../../../types/Show"
    import { activePage, activeShow, outputs, shows, showsCache } from "../../../stores"
    import { encodeFilePath } from "../../helpers/media"
    import { findMatchingOut } from "../../helpers/output"
    import { isHymnFileStub } from "./hymnFolders"
    import { loadShows } from "../../helpers/setShow"
    import { ensureHymnConverted } from "../../../converters/powerpoint/hymnConvert"
    import Icon from "../../helpers/Icon.svelte"
    import SlidePreviewBox from "../../inputs/SlidePreviewBox.svelte"
    import { getSlidePreview } from "../../inputs/showThumbnail"
    import { getHymnNumber } from "./hymns"
    import { presentDeck } from "./presentDeck"

    // Beacon Worship — a hymn tile for the grid view.
    //
    // Thumbnail is the first slide: a picture extracted from the .pptx (no convert), or
    // the live miniature once that one deck is in cache. Do not convert on scroll.

    export let show: ShowList
    export let selected = false

    $: id = show.id
    $: number = getHymnNumber(show)
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
        // Folder-loaded hymns are still the original .pptx. Do not convert them just to
        // draw a thumbnail — that is what froze the whole app when the grid scrolled.
        if (previewLoadRequested || $showsCache[id] || isHymnFileStub($shows[id] || show)) return
        previewLoadRequested = true
        loadShows([id])
    }

    // The opened hymn in the Show panel is the source of truth. Prefer that miniature
    // over the stored folder preview so a clicked tile matches the first slide.
    $: livePreview = getSlidePreview($showsCache[id]) || show.preview
    $: thumbnailPath = livePreview || isHymnFileStub($shows[id] || show) ? "" : storedThumbnail
    $: isLive = findMatchingOut(id, $outputs) !== null
    $: isActive = $activeShow?.id === id

    function select() {
        activeShow.set({ id, name: show.name, type: "show" })
        if ($activePage !== "edit") activePage.set("show")
        // Convert this one hymn so the centre panel does not say "Could not find show".
        void ensureHymnConverted(id)
        requestPreview()
    }

    async function goLive(e: MouseEvent) {
        select()
        await presentDeck(id, !e.altKey)
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
                {#if number !== null}
                    <span class="hero-num">{number}</span>
                {:else}
                    <Icon id="book" size={2} />
                {/if}
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
        content-visibility: auto;
        contain-intrinsic-size: auto 140px;
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
        background-size: cover;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .hero-num {
        font-size: 1.8em;
        font-weight: 800;
        color: var(--secondary);
        font-variant-numeric: tabular-nums;
        line-height: 1;
        z-index: 1;
    }

    .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
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
        z-index: 2;
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
