// Beacon Worship — emoji icons for the main navigation only.
//
// Scope is deliberately narrow: the nine drawer tabs plus the top Show / Edit / Stage
// buttons. Everything else (close, chevrons, undo, drag handles, toolbar glyphs) stays on
// the upstream SVG set, because emoji have no monochrome variant, cannot be recoloured by
// the theme, and sit on inconsistent baselines at small sizes.
//
// Icon.svelte renders these through the `emoji` prop, so a plain <Icon id="shows" /> used
// inside content areas keeps its crisp SVG. Only the navigation passes `emoji`.

export const emojiIcons: { [key: string]: string } = {
    // drawer tabs
    shows: "📁", // folders / shows library
    media: "🖼️", // pictures & video
    book: "📖", // hymns (drawerTabs.hymns uses icon id "book")
    hymns: "📖",
    scripture: "✝️", // Bible
    audio: "🎵",
    overlays: "✨",
    templates: "📋",
    calendar: "📅",
    functions: "⚙️",

    // top navigation
    show: "🖥️", // present / show view
    edit: "✏️",
    stage: "🎭" // stage display
}

// Emoji are colour glyphs: `fill` and the theme gradient do not apply. This is the single
// place that decides whether a given icon id has an emoji rendering at all.
export function getEmojiIcon(id: string): string {
    return emojiIcons[id] || ""
}

export function hasEmojiIcon(id: string): boolean {
    return Boolean(emojiIcons[id])
}
