<script lang="ts">
    import { onDestroy, onMount, tick } from "svelte"
    import { uid } from "uid"
    import { SpeechToText, audioLevelStore } from "../../../ai/stt/stt"
    import { Transcript } from "../../../ai/stt/transcript"
    import { ai, aiSuggestions, aiSttStatus, outLocked, scriptures, sttTempDisabled, sttTranscript } from "../../../stores"
    import { newToast } from "../../../utils/common"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import { presentSermonVerse } from "./presentSermonVerse"
    import { enqueueVerse, removeQueuedVerse, sermonGoLive, sermonLive, sermonMode, sermonPreview, sermonQueue, verseFromSuggestion, type SermonVerse } from "./sermonStore"
    import { lookupVerseText } from "./verseLookup"

    $: detections = $aiSuggestions.filter((item) => item.kind !== "hymn" && item.kind !== "scripture_command" && item.content)
    $: listening = $ai.enabled && !$sttTempDisabled && $aiSttStatus.state === "listening"
    $: level = $audioLevelStore
    $: bibleName = activeBibleName($scriptures)

    function activeBibleName(all: typeof $scriptures) {
        const id = Object.keys(all).find((key) => !all[key]?.api && !all[key]?.collection)
        const first = id ? all[id] : Object.values(all)[0]
        return first?.customName || first?.name || "Local Bible"
    }

    async function withText(verse: SermonVerse): Promise<SermonVerse> {
        if (verse.text) return verse
        const text = await lookupVerseText(verse.reference)
        return { ...verse, text }
    }

    async function stage(verse: SermonVerse) {
        const filled = await withText(verse)
        sermonPreview.set(filled)
        if ($sermonGoLive) await presentSermonVerse(filled)
    }

    async function play(verse: SermonVerse) {
        const filled = await withText(verse)
        sermonPreview.set(filled)
        await presentSermonVerse(filled)
    }

    async function queue(verse: SermonVerse) {
        const filled = await withText(verse)
        sermonQueue.update((list) => enqueueVerse(list, filled))
    }

    async function playQueued(verse: SermonVerse) {
        await play(verse)
        sermonQueue.update((list) => removeQueuedVerse(list, verse.id))
    }

    function toggleListen() {
        if (listening) {
            sttTempDisabled.set(true)
            SpeechToText.stopCapture()
            return
        }
        if (!$ai.stt?.micDeviceId) {
            newToast("Select a microphone in Settings → AI first")
            return
        }
        sttTempDisabled.set(false)
        ai.update((current) => ({ ...current, enabled: true }))
        SpeechToText.enable()
    }

    function toggleGoLive() {
        const next = !$sermonGoLive
        sermonGoLive.set(next)
        if (next && $sermonPreview) presentSermonVerse($sermonPreview)
    }

    let searchValue = ""
    async function searchReference() {
        const query = searchValue.trim()
        if (!query) return
        const text = await lookupVerseText(query)
        const verse: SermonVerse = { id: uid(5), reference: query, text, confidence: 100, matchType: "reference", timestamp: Date.now() }
        await stage(verse)
    }

    function onSearchKey(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault()
            searchReference()
        }
    }

    function onKey(e: KeyboardEvent) {
        const target = e.target as HTMLElement
        if (target?.closest("input, textarea, [contenteditable]")) return
        if (e.key === "l" || e.key === "L") {
            e.preventDefault()
            toggleGoLive()
        }
        if (e.key === " " && $sermonPreview) {
            e.preventDefault()
            play($sermonPreview)
        }
    }

    let transcriptElem: HTMLElement | undefined
    let transcriptPinned = true
    $: transcript = ($sttTranscript.finalized || "") + ($sttTranscript.unprocessed ? " " + $sttTranscript.unprocessed : "")
    $: if (transcriptPinned && transcript && transcriptElem) scrollTranscript()
    async function scrollTranscript() {
        await tick()
        if (!transcriptElem || !transcriptPinned) return
        transcriptElem.scrollTop = transcriptElem.scrollHeight
    }
    function onTranscriptScroll() {
        if (!transcriptElem) return
        transcriptPinned = transcriptElem.scrollHeight - transcriptElem.scrollTop - transcriptElem.clientHeight < 48
    }

    onMount(() => window.addEventListener("keydown", onKey))
    onDestroy(() => window.removeEventListener("keydown", onKey))
</script>

<div class="sermon-dash" data-sermon-dash>
    <header class="toolbar">
        <MaterialButton variant="contained" icon={listening ? "close" : "microphone"} on:click={toggleListen}>
            {listening ? "Stop listening" : "Start transcribing"}
        </MaterialButton>
        <span class="level" class:on={listening} title="Microphone level"><span style="width: {Math.round(level * 100)}%;"></span></span>
        <span class="state" class:live={listening}>{listening ? "Listening" : $aiSttStatus.state === "error" ? "Mic error" : "Stopped"}</span>
        <span class="bible" title={bibleName}>{bibleName}</span>
        <div class="fill"></div>
        <div class="modes">
            <button class="mode" class:on={$sermonMode === "manual"} on:click={() => sermonMode.set("manual")}>Manual</button>
            <button class="mode" class:on={$sermonMode === "auto"} on:click={() => sermonMode.set("auto")}>Auto</button>
        </div>
        <button class="golive" class:on={$sermonGoLive} on:click={toggleGoLive} title="L — send preview to the live output">
            {$sermonGoLive ? "LIVE SYNC ON" : "GO LIVE"}
        </button>
    </header>

    <section class="panel transcript">
        <h3>Live transcript {#if listening}<i class="pulse"></i>{/if}</h3>
        <div class="scroll" bind:this={transcriptElem} on:scroll={onTranscriptScroll}>
            {#if transcript.trim()}
                <p class="body-text">{transcript}</p>
            {:else}
                <p class="empty">Press Start transcribing, then preach. Explicit references land in AI Detections. Paraphrases stay preview-only.</p>
            {/if}
        </div>
        {#if transcript.trim()}
            <div class="row">
                <MaterialButton icon="copy" title="actions.copy" on:click={() => Transcript.copy()} />
            </div>
        {/if}
    </section>

    <section class="panel preview">
        <h3>Preview</h3>
        {#if $sermonPreview}
            <p class="ref">{$sermonPreview.reference}</p>
            <div class="scroll">
                <p class="body-text">{$sermonPreview.text || "Looking up this verse in the local Bible…"}</p>
            </div>
            <div class="row">
                <MaterialButton variant="contained" icon="play" disabled={$outLocked} on:click={() => play($sermonPreview)}>Play</MaterialButton>
                <MaterialButton icon="add" title="Add to queue" on:click={() => queue($sermonPreview)} />
            </div>
        {:else}
            <p class="empty">Stage a detection, a search result, or a queued verse to preview it here.</p>
        {/if}
    </section>

    <section class="panel live">
        <h3>Live output</h3>
        {#if $sermonLive}
            <p class="ref live-ref">{$sermonLive.reference}</p>
            <div class="scroll">
                <p class="body-text">{$sermonLive.text || ""}</p>
            </div>
        {:else}
            <p class="empty">Nothing is on the projector yet.</p>
        {/if}
    </section>

    <section class="panel search">
        <h3>Scripture search</h3>
        <div class="search-row">
            <input class="search-input" placeholder="John 3:16" bind:value={searchValue} on:keydown={onSearchKey} />
            <MaterialButton variant="contained" on:click={searchReference}>Look up</MaterialButton>
        </div>
        <p class="hint">Local Bible only. Topic hits appear as detections — they never go live on their own.</p>
    </section>

    <section class="panel detections">
        <h3>AI detections <span>{detections.length}</span></h3>
        {#if detections.length}
            <div class="list">
                {#each detections as item (item.id)}
                    <div class="card detection" class:reference={item.scriptureMatchType === "reference"} class:content={item.scriptureMatchType === "content"}>
                        <button class="body" on:click={() => stage(verseFromSuggestion(item))}>
                            <strong>{item.content}</strong>
                            <span class="meta">
                                {item.scriptureMatchType === "reference" ? "Citation" : item.scriptureMatchType === "content" ? "Paraphrase · preview only" : "Unclassified · preview only"}
                                · {Math.round(item.confidence)}%
                            </span>
                            {#if item.rationale}<span class="why">{item.rationale}</span>{/if}
                        </button>
                        <MaterialButton icon="play" title="Send live" disabled={$outLocked} on:click={() => play(verseFromSuggestion(item))} />
                        <MaterialButton icon="add" title="Add to queue" on:click={() => queue(verseFromSuggestion(item))} />
                    </div>
                {/each}
            </div>
        {:else}
            <p class="empty">{listening ? "Listening for spoken references…" : "Start transcribing. Explicit Bible references appear here."}</p>
        {/if}
    </section>

    <section class="panel queue">
        <h3>Queue <span>{$sermonQueue.length}</span></h3>
        {#if $sermonQueue.length}
            <div class="list">
                {#each $sermonQueue as item (item.id)}
                    <div class="card">
                        <button class="body" on:click={() => stage(item)}>
                            <strong>{item.reference}</strong>
                        </button>
                        <MaterialButton icon="play" title="Play" on:click={() => playQueued(item)} />
                        <MaterialButton icon="close" title="Remove" on:click={() => sermonQueue.update((list) => removeQueuedVerse(list, item.id))} />
                    </div>
                {/each}
            </div>
            <MaterialButton on:click={() => sermonQueue.set([])}>Clear all</MaterialButton>
        {:else}
            <p class="empty">Queued verses wait here until you play them.</p>
        {/if}
    </section>
</div>

<style>
    .sermon-dash {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1.25fr) minmax(0, 1fr);
        gap: 8px;
        padding: 8px;
        height: 100%;
        min-height: 0;
        box-sizing: border-box;
        color: var(--text);
    }
    .toolbar {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 8px;
        background: var(--primary);
        border: 1px solid rgb(255 255 255 / 0.12);
        min-width: 0;
    }
    .fill {
        flex: 1;
    }
    .state,
    .bible {
        font-size: 0.85em;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 28ch;
    }
    .state.live {
        color: #2ecc71;
        opacity: 1;
    }
    .level {
        width: 72px;
        height: 6px;
        flex-shrink: 0;
        background: rgb(255 255 255 / 0.12);
        overflow: hidden;
    }
    .level span {
        display: block;
        height: 100%;
        background: #2ecc71;
    }
    .modes {
        display: flex;
        border: 1px solid rgb(255 255 255 / 0.16);
        flex-shrink: 0;
    }
    .mode {
        background: transparent;
        color: var(--text);
        border: 0;
        padding: 6px 10px;
        cursor: pointer;
        opacity: 0.7;
    }
    .mode.on {
        background: var(--secondary);
        color: #111;
        opacity: 1;
    }
    .golive {
        background: rgb(255 255 255 / 0.08);
        color: var(--text);
        border: 1px solid rgb(255 255 255 / 0.2);
        padding: 7px 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        flex-shrink: 0;
    }
    .golive.on {
        background: #c0392b;
        border-color: #c0392b;
        color: #fff;
    }
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
    }
    .panel h3 {
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
    .panel h3 span {
        margin-left: auto;
        opacity: 0.7;
        font-variant-numeric: tabular-nums;
    }
    .transcript {
        grid-column: 1;
        grid-row: 2;
    }
    .preview {
        grid-column: 2;
        grid-row: 2;
    }
    .live {
        grid-column: 3;
        grid-row: 2;
    }
    .search {
        grid-column: 1;
        grid-row: 3;
    }
    .detections {
        grid-column: 2;
        grid-row: 3;
    }
    .queue {
        grid-column: 3;
        grid-row: 3;
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
        overflow-wrap: anywhere;
    }
    .empty {
        margin: 0;
        opacity: 0.45;
        font-size: 0.88em;
        line-height: 1.4;
    }
    .ref {
        margin: 0;
        font-weight: 700;
        color: var(--secondary);
        font-size: 1.05em;
        line-height: 1.25;
        overflow-wrap: anywhere;
        flex-shrink: 0;
    }
    .live-ref {
        color: #e74c3c;
    }
    .row {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-shrink: 0;
    }
    .list {
        overflow: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 0;
    }
    .card {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgb(255 255 255 / 0.04);
        border: 1px solid rgb(255 255 255 / 0.08);
        flex-shrink: 0;
    }
    .card.reference {
        border-left: 3px solid var(--secondary);
    }
    .card.content {
        border-left: 3px solid rgb(255 255 255 / 0.25);
    }
    .body {
        flex: 1;
        min-width: 0;
        text-align: left;
        background: transparent;
        border: 0;
        color: inherit;
        padding: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .body strong {
        overflow-wrap: anywhere;
    }
    .meta,
    .why,
    .hint {
        font-size: 0.75em;
        opacity: 0.6;
        line-height: 1.35;
    }
    .hint {
        margin: 0;
    }
    .search-row {
        display: flex;
        gap: 6px;
        align-items: stretch;
        flex-shrink: 0;
    }
    .search-input {
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
        padding: 8px;
        background: var(--primary);
        color: var(--text);
        border: 1px solid rgb(255 255 255 / 0.16);
    }
    .pulse {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #2ecc71;
        display: inline-block;
        box-shadow: 0 0 0 0 rgb(46 204 113 / 0.7);
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
