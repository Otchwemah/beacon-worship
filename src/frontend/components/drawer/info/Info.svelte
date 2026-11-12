<script lang="ts">
    import AiTranscription from "../../../ai/components/floating/AiTranscription.svelte"
    import { activeShow, ai, aiSttStatus, focusMode, forceClock, infoAreaMode, sttTempDisabled } from "../../../stores"
    import Icon from "../../helpers/Icon.svelte"
    import FloatingInputs from "../../input/FloatingInputs.svelte"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import Center from "../../system/Center.svelte"
    import Clock from "../../system/Clock.svelte"
    import Date from "../../system/Date.svelte"
    import AudioInfo from "./AudioInfo.svelte"
    import CalendarInfo from "./CalendarInfo.svelte"
    import FunctionsInfo from "./FunctionsInfo.svelte"
    import MediaInfo from "./MediaInfo.svelte"
    import ScriptureInfo from "./ScriptureInfo.svelte"
    import ShowInfo from "./ShowInfo.svelte"
    import TemplateInfo from "./TemplateInfo.svelte"

    export let id: string

    const hasOptions = ["shows", "media", "templates", "scripture", "calendar"]
    let optionsOpen = false
    $: if (id) optionsOpen = false

    // Beacon Worship: the bottom-right info area can switch between the usual
    // time/date/info display and live transcription. The regular display is never
    // removed — the toggle always switches back. This is non-modal and never
    // touches audience-facing outputs.
    $: transcriptionActive = $ai.enabled && $infoAreaMode === "transcription"

    function toggleTranscription() {
        infoAreaMode.update((mode) => (mode === "transcription" ? "default" : "transcription"))
    }

    // coarse listening state for the info-area transcript (the AI panel owns the session)
    $: infoState = $sttTempDisabled ? "inactive" : $aiSttStatus.state === "listening" ? "listening" : $aiSttStatus.state === "error" ? "error" : "inactive"
</script>

<div class="main {id !== 'shows' || $activeShow !== null ? 'context #drawer_info' : ''}">
    {#if transcriptionActive}
        <AiTranscription state={infoState} compact />
    {:else if !$forceClock && id === "shows"}
        <ShowInfo {optionsOpen} />
    {:else if !$forceClock && id === "media"}
        <MediaInfo {optionsOpen} />
    {:else if !$forceClock && id === "audio"}
        <AudioInfo />
        <!-- {:else if !$forceClock && id === "overlays"}
        <OverlayInfo /> -->
    {:else if !$forceClock && id === "templates"}
        <TemplateInfo {optionsOpen} />
    {:else if !$forceClock && id === "scripture"}
        <ScriptureInfo {optionsOpen} />
    {:else if !$forceClock && id === "calendar"}
        <CalendarInfo {optionsOpen} />
    {:else if !$forceClock && id === "functions"}
        <FunctionsInfo />
    {:else}
        <Center>
            <Clock />
            <Date />
        </Center>
    {/if}

    {#if $ai.enabled}
        <FloatingInputs side="left" bottom={6}>
            <MaterialButton icon={transcriptionActive ? "clock" : "microphone"} isActive={transcriptionActive} title={transcriptionActive ? "Switch back to time / date / info" : "Show live transcription here"} on:click={toggleTranscription}>
                <span style="font-size: 0.85em;">{transcriptionActive ? "Info" : "Transcript"}</span>
            </MaterialButton>
        </FloatingInputs>
    {/if}

    {#if !transcriptionActive && !$forceClock && hasOptions.includes(id) && !$focusMode}
        <FloatingInputs round>
            <MaterialButton isActive={optionsOpen} title="edit.options" on:click={() => (optionsOpen = !optionsOpen)}>
                <Icon size={1.1} id="options" white={!optionsOpen} />
            </MaterialButton>
        </FloatingInputs>
    {/if}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
    }

    div :global(h2) {
        color: var(--text);
    }
</style>
