<script lang="ts">
    import type { SlidePreview } from "./showThumbnail"
    import { encodeFilePath } from "../helpers/media"

    // Beacon Worship: a real miniature of the deck's FIRST SLIDE.
    //
    // Slide items carry the same absolute-pixel CSS the live output uses, against a
    // 1920x1080 canvas. Rendering them inside a canvas of that size and scaling the whole
    // thing reproduces the slide faithfully - colours, positions, font sizes and line
    // breaks - without pulling in Slide.svelte, which drags the editor, media loader and
    // autosize machinery into every drawer row.
    //
    // Fidelity notes (each of these was a real defect in hymn thumbnails):
    //  - PowerPoint shapes arrive as item.customSvg (type:"icon", no text lines). They MUST
    //    be drawn, or the GA/TWI/ENGLISH colour panels vanish and the lyrics float on the
    //    background. Rendered exactly like slide/views/IconItem.svelte.
    //  - slide colour can be a CSS gradient string, so it goes in `background`, never
    //    `background-color` (which silently drops gradients).
    //  - text uses the same centred flex layout as slide/TextboxLines.svelte so the
    //    arrangement matches the live slide instead of being top-aligned.

    export let preview: SlidePreview

    let container: HTMLDivElement | null = null
    let scale = 0

    $: width = preview?.width || 1920
    $: height = preview?.height || 1080
    $: imagePath = preview?.backgroundImage || preview?.mediaSrc || ""
    $: items = preview?.items || []

    // measure the available width and scale the fixed-size canvas into it
    $: if (container && width) measure()
    function measure() {
        if (!container) return
        const available = container.clientWidth
        if (available > 0) scale = available / width
    }
</script>

<svelte:window on:resize={measure} />

{#if preview}
    <div class="slide-preview" bind:this={container} style="aspect-ratio: {width} / {height};background: {preview.backgroundColor || '#101820'};">
        {#if scale > 0}
            <div class="canvas" style="width: {width}px;height: {height}px;transform: scale({scale});">
                {#if imagePath}
                    <img class="bg" src={encodeFilePath(imagePath)} alt="" loading="lazy" draggable="false" />
                {/if}

                {#each items as item (item.id)}
                    <div class="item" style="{item.style};{item.align}">
                        {#if item.customSvg}
                            <div class="custom-svg" class:custom-color={item.useCurrentColor}>
                                {@html item.customSvg}
                            </div>
                        {/if}
                        {#if item.src}
                            <img class="media" src={encodeFilePath(item.src)} alt="" loading="lazy" draggable="false" style="object-fit: {item.fit};" />
                        {/if}
                        {#if item.lines.length}
                            <div class="align">
                                <div class="lines">
                                    {#each item.lines as line, li}
                                        <div class="line" style={line.align}>
                                            {#each line.runs as run, ri}{#if run.value === "\n"}<br />{:else}<span style={run.style}>{run.value}</span>{/if}{/each}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {:else if preview.text}
            <!-- before measurement: avoid a blank flash -->
            <span class="fallback-text">{preview.text}</span>
        {/if}
    </div>
{/if}

<style>
    .slide-preview {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 3px;
        background: #101820;
    }

    .canvas {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: top left;
        overflow: hidden;
    }

    .bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .item {
        position: absolute;
        overflow: hidden;
    }

    /* matches IconItem.svelte: the shape fills its box */
    .custom-svg,
    .custom-svg :global(svg) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    .custom-svg.custom-color :global(svg path) {
        fill: currentColor;
    }

    .media {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    /* matches TextboxLines.svelte .align / .lines */
    .align {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .lines {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    /* each line keeps its own text-align from the importer (PPT default is left) */
    .line {
        width: 100%;
        overflow-wrap: break-word;
        line-height: 1.2;
    }

    .fallback-text {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4%;
        font-size: 0.6em;
        text-align: center;
        color: #fff;
        overflow: hidden;
    }
</style>
