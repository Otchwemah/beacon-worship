import { describe, expect, it } from "vitest"
import { isImporterDisabledTransition, repairHymnTransitions, shouldRepairHymnTransitions } from "./hymnTransitions"

const IMPORTED = { type: "none", duration: 0, easing: "linear" }

describe("isImporterDisabledTransition", () => {
    it("recognises the exact shape the old importer wrote", () => {
        expect(isImporterDisabledTransition(IMPORTED)).toBe(true)
        expect(isImporterDisabledTransition({ type: "none", duration: 0 })).toBe(true)
    })

    it("treats a missing duration as 0", () => {
        expect(isImporterDisabledTransition({ type: "none" })).toBe(true)
    })

    it("leaves real transitions alone", () => {
        expect(isImporterDisabledTransition({ type: "fade", duration: 500 })).toBe(false)
        expect(isImporterDisabledTransition({ type: "slide", duration: 0 })).toBe(false)
    })

    it("leaves a deliberate 'none' with a duration alone", () => {
        // an operator could set none with a non-zero duration; not the importer's fingerprint
        expect(isImporterDisabledTransition({ type: "none", duration: 300 })).toBe(false)
    })

    it("handles null / undefined / junk", () => {
        expect(isImporterDisabledTransition(null)).toBe(false)
        expect(isImporterDisabledTransition(undefined)).toBe(false)
        expect(isImporterDisabledTransition("none" as any)).toBe(false)
    })
})

describe("repairHymnTransitions", () => {
    it("strips the importer transition so the slide inherits again", () => {
        const show = { layouts: { l1: { slides: [{ id: "s1", transition: { ...IMPORTED } }] } } }
        const result = repairHymnTransitions(show)

        expect(result.changed).toBe(1)
        expect(result.layouts.l1.slides![0].transition).toBeUndefined()
    })

    it("also repairs per-child layout overrides", () => {
        const show = {
            layouts: {
                l1: {
                    slides: [{ id: "parent", transition: { ...IMPORTED }, children: { c1: { transition: { ...IMPORTED } }, c2: { transition: { type: "fade", duration: 400 } } } }]
                }
            }
        }
        const result = repairHymnTransitions(show)
        const parent = result.layouts.l1.slides![0]

        expect(parent.transition).toBeUndefined()
        expect(parent.children.c1.transition).toBeUndefined()
        expect(parent.children.c2.transition).toEqual({ type: "fade", duration: 400 })
    })

    it("keeps a transition the operator chose", () => {
        const show = { layouts: { l1: { slides: [{ id: "s1", transition: { type: "fade", duration: 800, easing: "ease-in" } }] } } }
        const result = repairHymnTransitions(show)

        expect(result.changed).toBe(0)
        expect(result.layouts.l1.slides![0].transition).toEqual({ type: "fade", duration: 800, easing: "ease-in" })
    })

    it("never mutates the input", () => {
        const show = { layouts: { l1: { slides: [{ id: "s1", transition: { ...IMPORTED } }] } } }
        repairHymnTransitions(show)

        expect(show.layouts.l1.slides[0].transition).toEqual(IMPORTED)
    })

    it("preserves other layout slide properties", () => {
        const show = { layouts: { l1: { name: "Default", notes: "keep", slides: [{ id: "s1", background: "/img.png", disabled: true, transition: { ...IMPORTED } }] } } }
        const result = repairHymnTransitions(show)

        expect(result.layouts.l1.name).toBe("Default")
        expect(result.layouts.l1.notes).toBe("keep")
        expect(result.layouts.l1.slides![0].background).toBe("/img.png")
        expect(result.layouts.l1.slides![0].disabled).toBe(true)
    })

    it("counts every repaired slide", () => {
        const show = { layouts: { l1: { slides: [{ transition: { ...IMPORTED } }, { transition: { ...IMPORTED } }, { transition: { type: "fade", duration: 1 } }] } } }
        expect(repairHymnTransitions(show).changed).toBe(2)
    })

    it("is idempotent", () => {
        const show = { layouts: { l1: { slides: [{ transition: { ...IMPORTED } }] } } }
        const first = repairHymnTransitions(show)
        const second = repairHymnTransitions({ layouts: first.layouts })

        expect(first.changed).toBe(1)
        expect(second.changed).toBe(0)
    })

    it("handles empty and malformed shows", () => {
        expect(repairHymnTransitions({}).changed).toBe(0)
        expect(repairHymnTransitions({ layouts: {} }).changed).toBe(0)
        expect(repairHymnTransitions({ layouts: { l1: {} } }).layouts.l1).toEqual({})
        expect(repairHymnTransitions({ layouts: { l1: { slides: [null, undefined, "x"] } } }).changed).toBe(0)
    })
})

describe("shouldRepairHymnTransitions", () => {
    it("repairs PowerPoint-origin decks", () => {
        expect(shouldRepairHymnTransitions({ origin: "powerpoint" }, [], "show1")).toBe(true)
        expect(shouldRepairHymnTransitions({ origin: "powerpoint" }, null, "show1")).toBe(true)
    })

    it("never touches hand-built shows", () => {
        expect(shouldRepairHymnTransitions({ origin: "freeshow" }, [], "show1")).toBe(false)
        expect(shouldRepairHymnTransitions({}, [], "show1")).toBe(false)
    })

    it("runs only once per show", () => {
        expect(shouldRepairHymnTransitions({ origin: "powerpoint" }, ["show1"], "show1")).toBe(false)
        expect(shouldRepairHymnTransitions({ origin: "powerpoint" }, ["show1"], "show2")).toBe(true)
    })

    it("requires a show id", () => {
        expect(shouldRepairHymnTransitions({ origin: "powerpoint" }, [], "")).toBe(false)
    })
})
