import { describe, expect, it } from "vitest"
import { describeLlmNetworkPosture, describeModelStatus, isOfflinePosture } from "./localAiStatus"

describe("describeLlmNetworkPosture", () => {
    it("reports no network service when no LLM is configured", () => {
        const posture = describeLlmNetworkPosture(undefined)
        expect(posture.usage).toBe("none")
        expect(posture.transcriptsAllowed).toBe(false)
    })

    it("treats Ollama as local and allows transcripts", () => {
        const posture = describeLlmNetworkPosture("ollama")
        expect(posture.usage).toBe("local")
        expect(posture.transcriptsAllowed).toBe(true)
    })

    it("treats cloud providers as cloud and never allows transcripts", () => {
        for (const provider of ["anthropic", "openai", "google"]) {
            const posture = describeLlmNetworkPosture(provider)
            expect(posture.usage).toBe("cloud")
            expect(posture.transcriptsAllowed).toBe(false)
        }
    })

    it("treats unknown providers as cloud-capable (safe default)", () => {
        const posture = describeLlmNetworkPosture("some-future-provider")
        expect(posture.usage).toBe("unknown")
        expect(posture.transcriptsAllowed).toBe(false)
    })
})

describe("describeModelStatus", () => {
    it("describes ready, missing and errored models", () => {
        expect(describeModelStatus({ ready: true })).toBe("Local model ready")
        expect(describeModelStatus({ ready: false })).toBe("Local model not downloaded")
        expect(describeModelStatus({ ready: false, error: "The local model is incomplete" })).toContain("incomplete")
        expect(describeModelStatus(null)).toBe("Checking local model…")
    })
})

describe("isOfflinePosture", () => {
    it("is offline with local STT and no LLM", () => {
        expect(isOfflinePosture("nemotron", undefined)).toBe(true)
        expect(isOfflinePosture("nemotron", "none")).toBe(true)
    })

    it("is offline with local STT and a local LLM", () => {
        expect(isOfflinePosture("nemotron", "ollama")).toBe(true)
    })

    it("is not offline when a cloud LLM is configured, even though transcripts are blocked", () => {
        expect(isOfflinePosture("nemotron", "openai")).toBe(false)
    })

    it("is not offline for a non-local STT engine", () => {
        expect(isOfflinePosture("cloud-engine", "none")).toBe(false)
    })
})
