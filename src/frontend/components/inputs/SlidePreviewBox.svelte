<script lang="ts">
    import type { SlidePreview } from "./showThumbnail"
    import { encodeFilePath } from "../helpers/media"

    // Beacon Worship: presentational only. Draws a tiny approximation of a deck's first
    // slide for drawer rows that have no stored preview image. Deliberately does not use
    // Slide.svelte, which pulls in the editor, media loader and autosize machinery.
    export let preview: SlidePreview

    $: imagePath = preview?.backgroundImage || preview?.mediaSrc || ""
</script>

{#if preview}
    <div class="slide-preview" style="background-color: {preview.backgroundColor || '#101820'};">
        {#if imagePath}
            <img class="preview-image" src={encodeFilePath(imagePath)} alt="" loading="lazy" draggable="false" />
        {/if}
        {#if preview.text}
            <span class="preview-text">{preview.text}</span>
        {/if}
    </div>
{/if}

<style>
    .slide-preview {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 4px;

        display: flex;
        align-items: center;
        justify-content: center;

        pointer-events: none;
    }

    .preview-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .preview-text {
        position: relative;
        padding: 1px 2px;

        font-size: 4px;
        line-height: 1.15;
        text-align: center;
        color: #fff;
        text-shadow: 0 0 1px rgb(0 0 0 / 0.9);

        /* the row is only ~35px: clip rather than let long hymn text overflow */
        display: -webkit-box;
        -webkit-line-clamp: 5;
        -webkit-box-orient: vertical;
        overflow: hidden;
        overflow-wrap: anywhere;
    }
</style>
