<script lang="ts">
    import { onDestroy, tick } from "svelte"
    import { Transcript } from "../../../ai/stt/transcript"
    import { sttTranscript } from "../../../stores"
    import MaterialButton from "../../inputs/MaterialButton.svelte"

    export let listening = false

    const TRANSCRIPT_VIEW = 1200
    let transcriptElem: HTMLElement | undefined
    let transcriptPinned = true
    let shown = ""
    let pending = ""
    let timer: ReturnType<typeof setTimeout> | null = null

    $: raw = ($sttTranscript.finalized || "") + ($sttTranscript.unprocessed ? " " + $sttTranscript.unprocessed : "")
    $: scheduleShown(raw)

    function scheduleShown(value: string) {
        pending = value.length > TRANSCRIPT_VIEW ? value.slice(-TRANSCRIPT_VIEW) : value
        if (timer) return
        timer = setTimeout(() => {
            timer = null
            shown = pending
            if (transcriptPinned) scrollTranscript()
        }, 160)
    }

    onDestroy(() => {
        if (timer) clearTimeout(timer)
    })

    async function scrollTranscript() {
        await tick()
        if (!transcriptElem || !transcriptPinned) return
        transcriptElem.scrollTop = transcriptElem.scrollHeight
    }

    function onTranscriptScroll() {
        if (!transcriptElem) return
        transcriptPinned = transcriptElem.scrollHeight - transcriptElem.scrollTop - transcriptElem.clientHeight < 48
    }
</script>

<section class="panel transcript">
    <h3>Live transcript {#if listening}<i class="pulse"></i>{/if}</h3>
    <div class="scroll" bind:this={transcriptElem} on:scroll={onTranscriptScroll}>
        {#if shown.trim()}
            <p class="body-text">{shown}</p>
        {:else}
            <p class="empty">Press Start transcribing, then preach. Explicit references and hymn numbers land in AI Detections.</p>
        {/if}
    </div>
    {#if shown.trim()}
        <div class="row">
            <MaterialButton icon="copy" title="actions.copy" on:click={() => Transcript.copy()} />
        </div>
    {/if}
</section>

<style>
    .panel {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        min-height: 0;
        padding: 8px;
        background: var(--primary-darker);
        border: 1px solid rgb(255 255 255 / 0.1);
        overflow: hidden;
        flex: 1;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
    }
    h3 {
        margin: 0;
        font-size: 0.72em;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.75;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }
    .scroll {
        overflow: auto;
        flex: 1;
        min-height: 0;
    }
    .body-text {
        margin: 0;
        font-size: 0.92em;
        line-height: 1.45;
        white-space: pre-wrap;
        overflow-wrap: break-word;
    }
    .empty {
        margin: 0;
        opacity: 0.45;
        font-size: 0.88em;
        line-height: 1.4;
    }
    .row {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
    }
    .pulse {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #2ecc71;
        display: inline-block;
        animation: pulse 1.4s ease-out infinite;
    }
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgb(46 204 113 / 0.55);
        }
        100% {
            box-shadow: 0 0 0 8px rgb(46 204 113 / 0);
        }
    }
</style>
