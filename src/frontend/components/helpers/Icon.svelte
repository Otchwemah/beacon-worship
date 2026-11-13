<script lang="ts">
    import { uid } from "uid"
    import type { Selected } from "../../../types/Main"
    import { activePopup, localeDirection, selected, theme, themes } from "../../stores"
    import { triggerClickOnEnterSpace } from "../../utils/clickable"
    import { customIcons } from "../../values/customIcons"
    import { getEmojiIcon } from "../../values/emojiIcons"
    import icons from "../../values/icons"
    import { fadeColor, hexToHSL, hslToHex } from "./color"

    export let id: string
    export let color: string = ""
    export let title = ""
    export let size = 1
    export let white = false
    export let right = false
    export let fill = false
    export let custom = false
    export let select = false
    export let selectData: Selected | null = null
    export let box = 24
    export let gradient = false
    export let boxed = false

    // Beacon Worship: opt-in emoji rendering, used by the drawer tabs and the top
    // Show/Edit/Stage buttons. Falls back to the normal SVG when the id has no emoji,
    // so passing `emoji` on an unmapped icon is always safe.
    export let emoji = false
    $: emojiGlyph = emoji ? getEmojiIcon(id) : ""

    const gradientId = `icon-gradient-${uid(5)}`
    export let gradientColor: string | null = null
    let baseColor = gradientColor || (gradient ? "#e800f0" : "#f0008c")
    $: if ($themes[$theme]) updateBaseColor()
    function updateBaseColor() {
        if (gradientColor || gradient) return
        baseColor = $themes[$theme]?.colors?.secondary || "#f0008c"
    }

    // smaller change
    $: hsl = hexToHSL(baseColor)
    $: colorStart = gradient ? (gradientColor ? hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 100)) : hslToHex(340, hsl.s, Math.min(hsl.l + 15, 100))) : hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 6, 100)) // lighter
    $: colorMid = baseColor
    $: colorEnd = gradient ? (gradientColor ? hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 30, 0)) : hslToHex(270, hsl.s, Math.max(hsl.l - 30, 0))) : hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 6, 0)) // darker

    $: width = size * (boxed ? 1.2 : 1) + "rem"
    $: height = size * (boxed ? 1.2 : 1) + "rem"

    $: icon = custom || !icons[id] ? customIcons[id] : icons[id]

    const iconsToBeFlipped = ["back"] // Add more icons that need to be flipped horizontally if needed
    const flip = $localeDirection === "rtl" && iconsToBeFlipped.includes(id)

    const click = () => {
        if (!select) return

        if (selectData && !$selected.data.includes(selectData.data[0])) selected.set(selectData)
        activePopup.set("icon")
    }

    $: if (boxed && !color) color = "#ffffff"
</script>

{#if emojiGlyph}
    <!-- Emoji are colour glyphs: no fill, no theme gradient, and a font-size based box
         instead of a viewBox so they stay optically centred next to text labels. -->
    <span
        class="emoji-icon {$$props.class || ''}"
        class:right
        class:fill
        class:boxed
        class:select
        on:click={select ? click : undefined}
        on:keydown={select ? triggerClickOnEnterSpace : undefined}
        tabindex={select ? 0 : undefined}
        role={select ? "button" : "img"}
        aria-label={title || id}
        style="{$$props.style || ''};font-size: {size * (boxed ? 1.05 : 0.95)}rem;{boxed && color ? `background-color: ${fadeColor(color, 0.3)};` : ''}min-width: {width};{boxed ? `min-height: ${height};` : ''}"
        data-title={title}>{emojiGlyph}</span
    >
{:else if select}
    <svg class={$$props.class} class:flip class:white class:right class:fill class:select class:boxed on:click={click} on:keydown={triggerClickOnEnterSpace} tabindex={0} role="button" style="{$$props.style || ''};{color ? `color: ${color};` : ''}{boxed && color ? `background-color: ${fadeColor(color, 0.3)};` : ''}min-width: {width};{boxed ? `min-height: ${height};` : ''}" {width} {height} viewBox="0 0 {box} {box}" data-title={title}>
        {#if !white && colorMid && colorEnd && colorStart}
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <!-- <stop offset="0%" stop-color="#f0008c" />
                    <stop offset="50%" stop-color="#e800f0" />
                    <stop offset="100%" stop-color="#8000f0" /> -->
                    <stop offset="0%" stop-color={colorStart} />
                    <stop offset="50%" stop-color={colorMid} />
                    <stop offset="100%" stop-color={colorEnd} />
                </linearGradient>
            </defs>
            <g fill={`url(#${gradientId})`}>
                {@html icon ? icon : icons.noIcon}
            </g>
        {:else}
            {@html icon ? icon : icons.noIcon}
        {/if}
    </svg>
{:else}
    <svg class={$$props.class} class:flip class:white class:right class:fill class:boxed style="{$$props.style || ''};{color ? `color: ${color};` : ''}{boxed && color ? `background-color: ${fadeColor(color, 0.3)};` : ''}min-width: {width};{boxed ? `min-height: ${height};` : ''}" {width} {height} viewBox="0 0 {box} {box}" data-title={title}>
        {#if !white && colorMid && colorEnd && colorStart}
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color={colorStart} />
                    <stop offset="50%" stop-color={colorMid} />
                    <stop offset="100%" stop-color={colorEnd} />
                </linearGradient>
            </defs>
            <g fill={`url(#${gradientId})`}>
                {@html icon ? icon : icons.noIcon}
            </g>
        {:else}
            {@html icon ? icon : icons.noIcon}
        {/if}
    </svg>
{/if}

<style>
    svg {
        fill: var(--secondary);
    }

    svg.select {
        cursor: pointer;
    }

    svg.select:hover {
        background-color: var(--hover);
    }

    svg.white {
        /* fill: var(--secondary-text); */
        fill: currentColor;
    }

    svg.right {
        margin-inline-end: 0.5em;
    }

    svg.fill {
        width: 100%;
        height: 100%;
    }

    svg.flip {
        transform: scaleX(-1);
    }

    svg.boxed {
        padding: 0.2em;
        border-radius: 0.3em;
    }

    /* Beacon Worship emoji navigation icons. Sized in rem from the `size` prop so they
       match the SVG box they replace, and centred on the text baseline. */
    .emoji-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        /* keep colour emoji on every platform, and stop the theme font from overriding */
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif;
        font-variant-emoji: emoji;
        flex-shrink: 0;
        user-select: none;
    }

    .emoji-icon.right {
        margin-inline-end: 0.5em;
    }

    .emoji-icon.fill {
        width: 100%;
        height: 100%;
    }

    .emoji-icon.boxed {
        padding: 0.2em;
        border-radius: 0.3em;
    }

    .emoji-icon.select {
        cursor: pointer;
    }

    .emoji-icon.select:hover {
        background-color: var(--hover);
    }
</style>
