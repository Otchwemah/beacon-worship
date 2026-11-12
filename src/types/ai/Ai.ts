export type AIProviderId = "ollama" | "anthropic" | "openai" | "google"
export type AiFeatureState = "starting" | "listening" | "stopped" | "error" | "llm_paused"

export interface AiFeatureStatus {
    state: AiFeatureState
    message?: string
    keyless?: boolean
}

export interface MatchResult {
    type: "scripture" | "scripture_version" | "lyrics" | "quote" | "announcement" | "empty"
    content: string // "scripture" = reference (e.g., "Genesis 1:1")
    confidence: number // 1-100

    // "reference" = an explicitly spoken reference or verse-navigation cue (may auto-present per settings)
    // "content"   = an inferred/paraphrased verse-content match (suggestion only, never auto-present)
    // missing     = unclassified (e.g. from an LLM) — treated as unsafe to auto-present
    scriptureMatchType?: "reference" | "content"
    scriptureTranslation?: string
    scriptureIsNewTranslation?: boolean
    rationale?: string
}

export interface AiSuggestion {
    id: string
    action: string
    content: string
    timestamp: number
    confidence: number
    trigger?: () => void

    // "hymn" = an explicit local hymn-number command; "scripture_command" = an explicit
    // Scripture navigation/version command (not an inferred verse-content match)
    kind?: "hymn" | "scripture_command"
    scriptureTranslation?: string
    scriptureMatchType?: "reference" | "content"
    rationale?: string
}

// models

export interface EngineStatus {
    ready: boolean
    error?: string

    localPath?: string | null
    downloadedModels?: string[]
}

export interface AiSetupOptions {
    action: "download" | "cancel" | "delete" | "verify"
    engineId: string
    modelId?: string
    customPath?: string
}

export interface LLMCompletionOptions {
    systemPrompt?: string
    prompt: string
    jsonSchema?: any
    temperature?: number
    maxTokens?: number
    signal?: AbortSignal
}
