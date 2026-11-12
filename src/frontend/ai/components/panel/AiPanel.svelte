<script lang="ts">
    import { onDestroy } from "svelte"
    import type { EngineStatus } from "../../../../types/ai/Ai"
    import { Main } from "../../../../types/IPC/Main"
    import Icon from "../../../components/helpers/Icon.svelte"
    import MaterialButton from "../../../components/inputs/MaterialButton.svelte"
    import MaterialToggleSwitch from "../../../components/inputs/MaterialToggleSwitch.svelte"
    import { requestMain } from "../../../IPC/main"
    import { activePage, activeTriggerFunction, ai, aiSttStatus, focusMode, language, mediaDownloads, settingsTab, sttTempDisabled } from "../../../stores"
    import { describeLlmNetworkPosture, describeModelStatus, isOfflinePosture } from "../../manager/localAiStatus"
    import { audioLevelStore, resolveSttEngine, SpeechToText } from "../../stt/stt"
    import AiTranscription from "../floating/AiTranscription.svelte"

    // Beacon Worship: AI lives in this always-active, persistent, NON-MODAL panel.
    // There is no dialog, no backdrop and no transient Smart Action popup. Opening or
    // showing this panel never sends anything live — only the explicit suggestion
    // buttons (or the strict auto-present policy) can change the audience output.

    let state: "loading" | "inactive" | "error" | "listening" | "processing" = "loading"

    // try to enable every time a download finishes
    let downloadingCount = 0
    $: currentlyDownloading = $mediaDownloads
    $: if (state !== "listening" && currentlyDownloading) {
        if (currentlyDownloading.size < downloadingCount) enableListening()
        downloadingCount = currentlyDownloading.size
    }

    // STATE & SYNCHRONIZATION
    $: isEnabled = $ai.enabled
    $: micDeviceId = $ai.stt?.micDeviceId

    let lastMic = ""
    let lastEngine = ""

    $: engineId = resolveEngineId($ai.stt?.engine, $language)
    function resolveEngineId(explicit: string | undefined, _locale: string): string {
        return explicit || resolveSttEngine()
    }

    let sessionToken = 0
    $: syncSession(isEnabled, micDeviceId, engineId)
    async function syncSession(enabled: boolean | undefined, mic: string | undefined, engine: string) {
        const currentLock = ++sessionToken
        const shouldBeActive = Boolean(enabled && mic)

        const micChanged = (mic || "") !== lastMic
        const engineChanged = engine !== lastEngine

        if (shouldBeActive) {
            const isCurrentlyActive = state === "listening" || state === "processing" || state === "loading"
            if (isCurrentlyActive && !micChanged && !engineChanged) return

            const wasInactive = state === "inactive"
            state = "loading"

            lastMic = mic || ""
            lastEngine = engine

            if (wasInactive) {
                const result = await SpeechToText.enable()
                if (currentLock !== sessionToken || result.aborted) return
                state = result.ok ? "listening" : "error"
            } else {
                const capture = micChanged ? await SpeechToText.restartCapture() : { ok: true }
                if (currentLock !== sessionToken || capture.aborted) return

                const engineResult = engineChanged ? await SpeechToText.restartEngine() : { ok: true }
                if (currentLock !== sessionToken || engineResult.aborted) return

                if (!capture.ok || !engineResult.ok) state = "error"
                else state = "listening"
            }
            return
        }

        lastMic = mic || ""
        lastEngine = engine

        if (state !== "inactive") {
            SpeechToText.disable()
            if (currentLock === sessionToken) {
                state = "inactive"
            }
        }
    }

    $: if (state === "listening" && $aiSttStatus.state === "error") {
        state = "error"
        SpeechToText.stopCapture()
    }

    $: audioLevel = $audioLevelStore

    onDestroy(() => {
        if (state !== "inactive") SpeechToText.disable()
    })

    // LISTEN TOGGLE
    $: if ($activeTriggerFunction.startsWith("toggle_stt_listening:")) {
        const action = $activeTriggerFunction.split(":")[1]
        if (action === "on") toggleListening(true)
        else if (action === "off") toggleListening(false)
        else toggleListening()
    }

    function toggleListening(enable?: boolean) {
        const turnOn = enable === undefined ? !isListening : enable
        if (turnOn) {
            if (isListening) return
            sttTempDisabled.set(false)
            enableListening()
        } else {
            if (!isListening && state === "inactive") return
            sttTempDisabled.set(true)
            SpeechToText.stopCapture()
            state = "inactive"
        }
    }

    $: isListening = state === "listening"
    $: isStarting = state === "processing"

    async function enableListening() {
        if (isStarting || !isEnabled || !micDeviceId) return
        if (isListening) return

        const result = await SpeechToText.enable()
        if (result.aborted) return
        if (isEnabled && micDeviceId) state = result.ok ? "listening" : "error"
    }

    function openSettings() {
        settingsTab.set("ai")
        activePage.set("settings")
    }

    // ----- LOCAL AI DIAGNOSTICS -----
    let modelStatus: EngineStatus | null = null
    let diagnosticsOpen = false
    let checkingModel = false

    async function refreshModelStatus() {
        if (checkingModel) return
        checkingModel = true
        try {
            const result = await requestMain(Main.AI_GET_STATUS, { engineId: engineId })
            modelStatus = result?.[engineId] || null
        } catch (err) {
            modelStatus = { ready: false, error: "Could not query the local model status" }
        } finally {
            checkingModel = false
        }
    }

    // check the local model when the panel appears and whenever the engine changes
    $: if (engineId) refreshModelStatus()

    $: llmPosture = describeLlmNetworkPosture($ai.llm?.provider)
    $: offline = isOfflinePosture(engineId, $ai.llm?.provider)
    $: modelStatusText = describeModelStatus(modelStatus)

    $: stateLabel = state === "listening" ? "Listening" : state === "loading" ? "Starting…" : state === "processing" ? "Processing…" : state === "error" ? "Error" : "Stopped"
    $: stateColor = state === "listening" ? "#2ecc71" : state === "error" ? "#ff5050" : state === "loading" || state === "processing" ? "#f1c40f" : "#8a8f98"
</script>

<section class="ai-panel" class:compact={$focusMode} aria-label="Local AI panel">
    <div class="header">
        <span class="status-dot" style="background-color: {stateColor};" title={stateLabel}></span>
        <span class="title">Local AI</span>
        <span class="state" style="color: {stateColor};">{stateLabel}</span>

        {#if state === "listening"}
            <span class="level" title="Microphone input level"><span class="level-fill" style="width: {Math.round(audioLevel * 100)}%;"></span></span>
        {/if}

        <div class="fill"></div>

        <MaterialToggleSwitch label="" checked={isListening} disabled={state !== "inactive" && state !== "listening"} style="margin-right: 4px;" on:change={() => toggleListening()} small />
        <MaterialButton icon="info" title="Local AI status" style="padding: 6px;" isActive={diagnosticsOpen} on:click={() => (diagnosticsOpen = !diagnosticsOpen)} />
        <MaterialButton icon="settings" title="menu.settings" style="padding: 6px;" on:click={openSettings} />
    </div>

    {#if diagnosticsOpen}
        <div class="diagnostics">
            <div class="diag-row">
                <Icon id="ai" size={0.9} />
                <span>{modelStatusText}</span>
                <MaterialButton icon="refresh" title="Re-check local model" style="padding: 4px;" disabled={checkingModel} on:click={refreshModelStatus} />
            </div>
            <div class="diag-row">
                <Icon id="microphone" size={0.9} />
                <span>{micDeviceId ? "Microphone selected" : "No microphone selected"} — {stateLabel.toLowerCase()}</span>
            </div>
            <div class="diag-row">
                <Icon id={offline ? "cloud_done" : "cloud"} size={0.9} />
                <span>{llmPosture.label}</span>
            </div>
            <div class="diag-note">
                {#if offline}
                    Offline-capable: transcription and Scripture detection run locally. To verify, disconnect the network and confirm transcription still works.
                {:else}
                    A network-capable service is configured. Booth transcripts are never sent to cloud LLMs; other configured features may still use the network.
                {/if}
            </div>
        </div>
    {/if}

    {#if !$focusMode}
        <div class="body">
            <AiTranscription {state} />
        </div>
    {/if}
</section>

<style>
    .ai-panel {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        height: 250px;
        min-height: 120px;

        background-color: var(--primary-darker);
        border-top: 2px solid var(--primary-lighter);
        overflow: hidden;
    }

    .ai-panel.compact {
        height: auto;
        min-height: 0;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-bottom: 1px solid var(--primary-lighter);
        flex-shrink: 0;
    }

    .status-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .title {
        font-weight: 600;
        font-size: 0.9em;
        white-space: nowrap;
    }

    .state {
        font-size: 0.8em;
        white-space: nowrap;
    }

    .level {
        width: 36px;
        height: 5px;
        border-radius: 3px;
        background-color: rgb(255 255 255 / 0.12);
        overflow: hidden;
        flex-shrink: 0;
    }
    .level-fill {
        display: block;
        height: 100%;
        background-color: #2ecc71;
        transition: width 0.1s linear;
    }

    .fill {
        flex: 1;
    }

    .diagnostics {
        padding: 6px 10px;
        font-size: 0.8em;
        border-bottom: 1px solid var(--primary-lighter);
        background-color: rgb(0 0 0 / 0.15);
        flex-shrink: 0;
        max-height: 45%;
        overflow-y: auto;
    }
    .diag-row {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 2px 0;
    }
    .diag-row span {
        flex: 1;
    }
    .diag-note {
        opacity: 0.7;
        padding-top: 4px;
        line-height: 1.4;
    }

    .body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
</style>
