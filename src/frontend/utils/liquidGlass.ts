/**
 * Beacon Worship — Liquid Glass control-interface styling gate.
 *
 * The glass layer is DEFAULT-ON but must apply ONLY to the main/control window.
 * Audience/output windows (`currentWindow === "output"`) and the PDF export window
 * (`"pdf"`) never receive it, and the native titlebar / Windows MenuBar sit outside
 * the scoped <main> element so they are untouched. Operators can disable it via
 * `special.liquidGlass === false`.
 */
export function shouldApplyLiquidGlass(currentWindow: string | null, special: { liquidGlass?: boolean } | null | undefined): boolean {
    if (currentWindow !== null) return false
    return special?.liquidGlass !== false
}
