import { get, type Unsubscriber } from "svelte/store"
import { uid } from "uid"
import type { AiSuggestion, MatchResult } from "../../../types/ai/Ai"
import type { ConfidenceLevels } from "../../../types/ai/AiSettings"
import { startScripture } from "../../components/actions/apiHelper"
import { keysToID } from "../../components/helpers/array"
import { getFirstActiveOutput } from "../../components/helpers/output"
import { setActiveScripture } from "../../converters/bible"
import { ai, aiSuggestions, drawerTabsData, outputs, scriptures } from "../../stores"
import { newToast } from "../../utils/common"
import { getLLMManager } from "../llm/llmManager"
import { BibleCacheManager } from "../scripture/BibleCacheManager"
import { detectBibleVersion } from "../scripture/BibleVersionDetector"
import { isReferenceWithin } from "../scripture/references"
import { evaluateAutoPresent } from "./autoPresentPolicy"

export class AiManager {
    private static lastMatch: number = 0
    private static MAX_LLM_REQUEST_AFTER_MATCH = 5000
    private static latestSearchId: number = 0

    static async processSTTChunk(chunk: { chunkWithOverlap: string; newWordsCount: number; confidence?: number }) {
        this.triggerBackgroundPreload()

        const searchId = ++this.latestSearchId
        const isCancelled = () => searchId !== this.latestSearchId

        const stringMatch = await this.stringDetection(chunk.chunkWithOverlap, isCancelled)
        if (isCancelled()) return

        if (stringMatch) {
            this.newMatch(stringMatch)
            this.lastMatch = Date.now()
            return
        }

        if (this.lastMatch && Date.now() - this.lastMatch < this.MAX_LLM_REQUEST_AFTER_MATCH) return

        const llmManager = getLLMManager()
        if (!llmManager) return

        // Beacon Worship: unmatched transcripts are only sent to a LOCAL LLM (Ollama).
        // Cloud-capable providers (Anthropic/OpenAI/Google) never receive booth audio transcripts.
        if (llmManager.providerId !== "ollama") return

        // only report to LLM if nothing is auto detected
        const llmMatch = await llmManager.detectMatch(chunk)
        if (llmMatch) {
            this.newMatch(llmMatch)
            this.lastMatch = Date.now()
        }
    }

    private static async stringDetection(textChunk: string, isCancelled?: () => boolean) {
        const scriptureMatch = await this.globalBibleDetection(textChunk, isCancelled)
        if (scriptureMatch) return scriptureMatch

        const scriptureVersionMatch = await detectBibleVersion(textChunk, isCancelled)
        if (scriptureVersionMatch) return scriptureVersionMatch

        return null
    }

    private static isPreloadStarted: boolean = false
    private static triggerBackgroundPreload() {
        if (this.isPreloadStarted) return
        this.isPreloadStarted = true

        // load scriptures
        const localScriptureIds = this.getLocalScriptureIds()
        BibleCacheManager.preloadAllInBackground(localScriptureIds)
    }

    private static getLocalScriptureIds() {
        return keysToID(get(scriptures))
            .filter((a) => !a.api && !a.collection)
            .map((a) => a.id)
    }

    private static scriptureAlerted: boolean = false
    private static async globalBibleDetection(textChunk: string, isCancelled?: () => boolean) {
        const activeBibleId = get(drawerTabsData)?.scripture?.activeSubTab
        if (!activeBibleId) return null

        const scriptureData = get(scriptures)[activeBibleId]
        if (scriptureData?.api) {
            if (!this.scriptureAlerted) newToast("Please use a local Bible instead of an API Bible for the auto detection!")
            this.scriptureAlerted = true
            return null
        }

        const match = await this.bibleDetection(activeBibleId, textChunk, isCancelled)
        if (!match) return null

        // reference type matches stays on the active scripture
        if (match.scriptureMatchType !== "content") return match

        let highestConfidence = match.confidence || 0

        // Non-blocking concurrent scan
        Promise.all(
            this.getLocalScriptureIds().map(async (id) => {
                // already checked
                if (id === activeBibleId) return

                const otherMatch = await this.bibleDetection(id, textChunk, isCancelled)
                if (otherMatch?.confidence && otherMatch.confidence > highestConfidence) {
                    highestConfidence = otherMatch.confidence
                    this.newMatch({ ...otherMatch, scriptureIsNewTranslation: true })
                }
            })
        )

        return match
    }

    private static async bibleDetection(id: string, textChunk: string, isCancelled?: () => boolean) {
        const bibleCache = await BibleCacheManager.getCache(id)
        if (!bibleCache || isCancelled?.()) return null

        const match = await bibleCache.search(textChunk, AiManager.liveContent, isCancelled)
        if (!match) return null

        match.scriptureTranslation = id
        return match
    }

    /////

    static newMatch(match: MatchResult) {
        if (match.type === "empty" || !match.content) return
        if (match.type === "scripture" && AiManager.liveContent === match.content) return

        if (match.type !== "scripture" && match.type !== "scripture_version") return // WIP only scripture is implemented

        let suggestionDraft: any = {
            id: uid(5),
            timestamp: Date.now(),
            content: match.content,
            confidence: match.confidence,
            scriptureMatchType: match.scriptureMatchType,
            rationale: match.rationale
        }
        if (match.scriptureIsNewTranslation) suggestionDraft.scriptureTranslation = match.scriptureTranslation

        const trigger = () => this.triggerMatchAction(match)

        if (this.shouldAutoPlay(match)) {
            const suggestion = { ...suggestionDraft, action: "presented" }
            this.addSuggestion(suggestion)

            console.info(`Auto-playing ${match.type}:`, match.content)
            trigger()
            return
        }

        if (match.type === "scripture_version") {
            const suggestion = { ...suggestionDraft, action: "open_scripture", trigger }
            this.addSuggestion(suggestion)
            return
        }

        const suggestion = { ...suggestionDraft, action: "present", trigger }
        this.addSuggestion(suggestion)
    }

    private static alreadySuggested(match: MatchResult): boolean {
        // get suggested, but remove any suggestions that have lower confidence than the current match
        const suggested = get(aiSuggestions)
            .filter((a) => a.content !== match.content || a.confidence >= match.confidence)
            .filter((a) => !isReferenceWithin(match.content, a.content))
            .map((item) => item.content)

        return suggested.includes(match.content)
    }

    private static MAX_AUTO_PLAY_INTERVAL = 30000
    private static shouldAutoPlay(match: MatchResult): boolean {
        if (match.confidence <= 95 && this.alreadySuggested(match)) return false

        const now = Date.now()
        // skip if the output was manually updated recently
        if (this.lastOutputUpdate && now - this.lastOutputUpdate < this.MAX_AUTO_PLAY_INTERVAL) return false

        const confidence = get(ai)[match.type as "scripture"]?.confidence || "ask"
        if (confidence === "ask") return false

        // Beacon Worship live policy: only confident, explicitly spoken references may
        // auto-present. Content/inferred matches, alternative translations, unclassified
        // and non-Scripture results are always operator-previewed (see autoPresentPolicy.ts).
        const decision = evaluateAutoPresent(match, this.getConfidenceScore(confidence))
        if (!decision.allowed) return false

        this.listenToOutput()
        return true
    }

    private static getConfidenceScore(confidence: ConfidenceLevels): number {
        if (confidence === "highest") return 95
        if (confidence === "high") return 75
        if (confidence === "medium") return 50
        return 100
    }

    static liveContent: string = ""
    private static triggerMatchAction(match: MatchResult) {
        if (match.type === "scripture_version") {
            if (match.scriptureTranslation) setActiveScripture(match.scriptureTranslation)
        } else if (match.type === "scripture") {
            startScripture({ reference: match.content })
            this.outputUpdate(match.content)
        }
    }

    private static outputUpdate(content: string) {
        this.liveContent = content

        setTimeout(() => {
            // reset output updates when not "manually" played
            this.lastOutputUpdate = 0
        }, 500)
    }

    /////

    private static SUGGESTION_MAX_AGE = 5 * 60 * 1000 // 5 minutes
    private static SUGGESTION_LIMIT = 15
    private static addSuggestion(content: AiSuggestion) {
        // Beacon Worship: suggestions live only in the persistent, non-modal AI panel.
        // No transient Smart Action popup is shown.
        aiSuggestions.update((list) => {
            const now = Date.now()

            // remove timed out suggestions
            let active = list.filter((a) => now - a.timestamp < this.SUGGESTION_MAX_AGE)

            // remove duplicate suggestions
            active = active.filter((a) => a.id !== content.id && a.content !== content.content)

            return [content, ...active].slice(0, this.SUGGESTION_LIMIT)
        })
    }

    /////

    private static lastOutputUpdate = 0
    private static outputListener: Unsubscriber | null = null
    private static listenToOutput() {
        if (this.outputListener) return

        let initialized = false
        setTimeout(() => (initialized = true), 1000)

        let previousOutput = ""
        this.outputListener = outputs.subscribe(() => {
            const firstOutput = getFirstActiveOutput()
            const slide = firstOutput?.out?.slide || null

            const slideKey = JSON.stringify(slide)
            if (slideKey === JSON.stringify(previousOutput)) return
            previousOutput = slideKey

            if (initialized) this.lastOutputUpdate = Date.now()
        })
    }
}
