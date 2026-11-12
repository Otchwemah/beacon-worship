import type { EngineStatus } from "../../../types/ai/Ai"

/**
 * Beacon Worship — Local AI status helpers.
 *
 * Pure functions describing the local/offline posture of the AI subsystem so the
 * operator can inspect exactly what is ready and whether any network service is
 * in use. Unit-tested in localAiStatus.test.ts.
 */

export type NetworkUsage = "none" | "local" | "cloud" | "unknown"

export interface LlmNetworkPosture {
    usage: NetworkUsage
    label: string
    /** whether booth transcripts may be sent to this provider (local only) */
    transcriptsAllowed: boolean
}

const CLOUD_PROVIDERS = ["anthropic", "openai", "google"]

/** Describe the network posture of the configured LLM provider. */
export function describeLlmNetworkPosture(provider?: string): LlmNetworkPosture {
    if (!provider || provider === "none") {
        return { usage: "none", label: "No LLM configured — Scripture detection runs locally", transcriptsAllowed: false }
    }
    if (provider === "ollama") {
        return { usage: "local", label: "Local LLM (Ollama) — no cloud service", transcriptsAllowed: true }
    }
    if (CLOUD_PROVIDERS.includes(provider)) {
        return { usage: "cloud", label: `Cloud LLM configured (${provider}) — booth transcripts are NOT sent to it`, transcriptsAllowed: false }
    }
    return { usage: "unknown", label: `Unknown LLM provider (${provider}) — treated as cloud-capable`, transcriptsAllowed: false }
}

/** One-line, operator-readable description of a local model's readiness/integrity. */
export function describeModelStatus(status: EngineStatus | null | undefined): string {
    if (!status) return "Checking local model…"
    if (status.ready) return "Local model ready"
    if (status.error) return `Local model not ready: ${status.error}`
    return "Local model not downloaded"
}

/** Whether the whole AI pipeline is currently network-free (local STT + no cloud LLM receiving transcripts). */
export function isOfflinePosture(sttEngine: string, llmProvider?: string): boolean {
    const sttIsLocal = sttEngine === "nemotron"
    const llm = describeLlmNetworkPosture(llmProvider)
    return sttIsLocal && llm.usage !== "cloud" && llm.usage !== "unknown"
}
