import { get } from "svelte/store"
import { outLocked, special } from "../../stores"
import { customActionActivation } from "../actions/actions"
import { getAllActiveOutputIds, setOutput } from "../helpers/output"
import { clearBackground, clearScene, clearTimers } from "./clear"
import { isLiveOverrideEnabled } from "./liveOverridePolicy"

export { isLiveOverrideEnabled, shouldOverrideForType } from "./liveOverridePolicy"

// Beacon Worship — "going live overrides whatever was live".
//
// Upstream Beacon Worship layers content: starting a hymn left the previous scripture slide's
// background in place, a media background stacked under the old lyrics, and a stale scene
// could keep tinting the output. For a worship service the operator wants one thing on
// screen at a time, so sending content live now clears the previous content first.
//
// What is cleared: slide, background, scene, and next-slide timers.
// What is deliberately KEPT:
//   - overlays and effects — they are designed to sit on top of any feed (lower thirds,
//     logos, live notices) and must survive a content change
//   - audio and the metronome — background music/pad must not stop when a hymn starts
//   - locked outputs (outLocked) are never touched
//
// This is the single place that decides the policy, so it can be tuned or disabled
// (Settings → General → "New live content clears the previous output") in one place.

/**
 * Clear the previous live content so the incoming content is the only thing on screen.
 * Call this immediately BEFORE setting the new slide/background.
 *
 * @param outputIds target outputs; defaults to every active output
 * @returns true if anything was cleared
 */
export function prepareLiveOverride(outputIds: string[] = []): boolean {
    if (get(outLocked)) return false
    if (!isLiveOverrideEnabled(get(special))) return false

    const ids = (outputIds.length ? outputIds : getAllActiveOutputIds()).filter(Boolean)
    if (!ids.length) return false

    ids.forEach((outputId) => {
        // background + scene are per-output helpers that also fire their own action hooks
        clearBackground(outputId)
        clearScene(outputId)

        // next-slide timers only (clearOverlayTimers = false keeps overlay scheduling alive)
        clearTimers(outputId, false)

        // clearSlide() has no per-output variant, and it would also cache the old slide for
        // "restore output". An override is a deliberate replacement, so clear it outright.
        setOutput("slide", null, false, outputId)
    })

    customActionActivation("slide_cleared")

    return true
}
