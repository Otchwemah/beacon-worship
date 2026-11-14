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
import { translateText } from "../../utils/language"
import { handleHymnCommand } from "../hymns/hymnCommandHandler"
import { detectHymnCommand } from "../hymns/hymnCommands"
import { getLLMManager } from "../llm/llmManager"
import { BibleCacheManager } from "../scripture/BibleCacheManager"
import { detectBibleVersion } from "../scripture/BibleVersionDetector"
import { isReferenceWithin } from "../scripture/references"
import { detectVerseNavigationCommand, detectVersionChangeCommand, resolveVerseNavigation, SCRIPTURE_COMMAND_DEDUPE_MS, type VerseNavigationCommand, type VersionChangeCommand } from "../scripture/scriptureCommands"
import { evaluateAutoPresent } from "./autoPresentPolicy"

export class AiManager {
    private static lastMatch: number = 0
    private static MAX_LLM_REQUEST_AFTER_MATCH = 5000
    private static latestSearchId: number = 0

    // dedupe for explicit Scripture commands (repeated transcript chunks)
    private static lastNavCommand: { direction: string; unit: string; time: number } | null = null
    private static lastVersionCommand: { query: string; time: number } | null = null

    static async processSTTChunk(chunk: { chunkWithOverlap: string; newWordsCount: number; confidence?: number }) {
        this.triggerBackgroundPreload()

        const searchId = ++this.latestSearchId
        const isCancelled = () => searchId !== this.latestSearchId

        // Beacon Worship: explicit local hymn-number commands are resolved against the
        // local library BEFORE Scripture detection or any LLM fallback, so they never
        // reach a cloud provider and never depend on the auto-present Scripture policy.
        const hymnCommand = detectHymnCommand(chunk.chunkWithOverlap)
        if (hymnCommand) {
            await handleHymnCommand(hymnCommand)
            return
        }

        // Explicit Scripture navigation / version commands. Navigation is resolved against
        // the local Bible and then passed through the normal auto-present policy as a
        // reference-type match; version changes stay local-only and suggestion-based.
        const navCommand = detectVerseNavigationCommand(chunk.chunkWithOverlap)
        if (navCommand) {
            await this.handleVerseNavigation(navCommand)
            return
        }
        const versionCommand = detectVersionChangeCommand(chunk.chunkWithOverlap)
        if (versionCommand) {
            await this.handleVersionChange(versionCommand)
            return
        }

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
    // Explicit Scripture commands (next/previous verse, version change).

    private static async handleVerseNavigation(command: VerseNavigationCommand) {
        const now = Date.now()
        if (this.lastNavCommand && this.lastNavCommand.direction === command.direction && this.lastNavCommand.unit === command.unit && now - this.lastNavCommand.time < SCRIPTURE_COMMAND_DEDUPE_MS) return
        this.lastNavCommand = { direction: command.direction, unit: command.unit, time: now }

        const activeBibleId = get(drawerTabsData)?.scripture?.activeSubTab
        const scriptureData = activeBibleId ? get(scriptures)[activeBibleId] : null
        if (!activeBibleId || !scriptureData || scriptureData.api) {
            this.reportScriptureCommandUnavailable(command.rationale, "ai.nav_no_local_bible")
            return
        }

        const detector = await BibleCacheManager.getCache(activeBibleId)
        if (!detector) {
            this.reportScriptureCommandUnavailable(command.rationale, "ai.nav_no_local_bible")
            return
        }

        const resolution = resolveVerseNavigation(command.direction, this.liveContent, detector.referenceIndex, command.unit)
        if (resolution.status === "navigate") {
            // hand through the normal policy: reference-type, operator confidence decides live vs preview
            this.newMatch({
                type: "scripture",
                content: resolution.content,
                confidence: command.confidence,
                scriptureMatchType: "reference",
                rationale: command.rationale
            })
            return
        }

        const key =
            resolution.reason === "no_current" ? "ai.nav_no_current" : resolution.reason === "end_of_book" ? "ai.nav_end_of_book" : resolution.reason === "start_of_book" ? "ai.nav_start_of_book" : "ai.nav_unknown_chapter"
        this.reportScriptureCommandUnavailable(command.rationale, key)
    }

    private static async handleVersionChange(command: VersionChangeCommand) {
        const now = Date.now()
        const query = command.query.toLowerCase()
        if (this.lastVersionCommand && this.lastVersionCommand.query === query && now - this.lastVersionCommand.time < SCRIPTURE_COMMAND_DEDUPE_MS) return
        this.lastVersionCommand = { query, time: now }

        // detectBibleVersion only returns LOCAL, non-active versions; anything else is unavailable
        const match = await detectBibleVersion(command.query)
        if (match) {
            this.newMatch(match)
            return
        }

        this.reportScriptureCommandUnavailable(command.rationale, "ai.version_unavailable", [command.query])
    }

    private static reportScriptureCommandUnavailable(rationale: string, messageKey: string, replaceValues: string[] = []) {
        const message = translateText(messageKey, null, replaceValues)
        newToast(message)
        this.addSuggestion({
            id: uid(5),
            kind: "scripture_command",
            action: "unavailable",
            content: message,
            timestamp: Date.now(),
            confidence: 95,
            rationale
        })
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
