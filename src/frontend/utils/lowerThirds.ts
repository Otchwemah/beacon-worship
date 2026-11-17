import type { Item, LowerThirdSettings, Overlay, Template, TransitionType } from "../../types/Show"
import { overlayCategories, templateCategories } from "../stores"

export const LOWER_THIRD_CATEGORY = "lower_thirds"
export const BEACON_GOLD = "#DBAC64"

export type LowerThirdLayout =
    | "stripe"
    | "fullbar"
    | "photoLeft"
    | "photoCard"
    | "logoRight"
    | "minimal"
    | "flag"
    | "capsule"
    | "split"
    | "glass"
    | "ribbon"
    | "corner"
    | "ticker"
    | "centered"
    | "live"

export interface LowerThirdVariant {
    id: string
    name: string
    color: string
    accent: string
    bar: string
    text: string
    muted: string
    layout: LowerThirdLayout
    animation: TransitionType
    duration: number
    easing: string
    speaker: string
    title: string
    organization: string
    showPhoto: boolean
    showLogo: boolean
}

const GOLD = BEACON_GOLD
const NAVY = "#0B1F3A"
const WHITE = "#FFFFFF"
const BLACK = "#111111"
const RED = "#C41E3A"
const TEAL = "#0D9488"
const PURPLE = "#6D28D9"
const GREEN = "#15803D"
const ORANGE = "#EA580C"
const PINK = "#DB2777"
const SKY = "#0369A1"
const CREAM = "#F5EDE0"

export const LOWER_THIRD_VARIANTS: LowerThirdVariant[] = [
    { id: "lt_broadcast_gold", name: "Broadcast Gold", color: GOLD, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "stripe", animation: "slide", duration: 520, easing: "cubic", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_news_desk", name: "News Desk", color: RED, accent: RED, bar: "#1A1A1A", text: WHITE, muted: "#FECACA", layout: "fullbar", animation: "slide", duration: 480, easing: "cubic", speaker: "Breaking News", title: "Sunday Service Live", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_church_navy", name: "Church Navy", color: NAVY, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "photoLeft", animation: "fly", duration: 560, easing: "back", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: true, showLogo: false },
    { id: "lt_glass_dark", name: "Midnight Glass", color: "#334155", accent: GOLD, bar: "rgba(15,23,42,0.78)", text: WHITE, muted: "#CBD5E1", layout: "glass", animation: "fade", duration: 500, easing: "sine", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_pastor_card", name: "Pastor Card", color: GOLD, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "photoCard", animation: "scale", duration: 480, easing: "back", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: true, showLogo: false },
    { id: "lt_sermon_banner", name: "Sermon Banner", color: SKY, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "fullbar", animation: "slide", duration: 540, easing: "cubic", speaker: "The Good Shepherd", title: "John 10:11", organization: "Sunday Message", showPhoto: false, showLogo: false },
    { id: "lt_welcome", name: "Welcome Guest", color: GOLD, accent: GOLD, bar: NAVY, text: WHITE, muted: CREAM, layout: "capsule", animation: "scale", duration: 500, easing: "back", speaker: "Welcome", title: "We're glad you're here", organization: "Beacon Worship", showPhoto: true, showLogo: false },
    { id: "lt_worship", name: "Worship Leader", color: GOLD, accent: GOLD, bar: "transparent", text: WHITE, muted: GOLD, layout: "minimal", animation: "fade", duration: 520, easing: "sine", speaker: "Worship", title: "Praise Team", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_scripture_tag", name: "Scripture Tag", color: PURPLE, accent: "#C4B5FD", bar: "#2E1065", text: WHITE, muted: "#DDD6FE", layout: "corner", animation: "fly", duration: 480, easing: "cubic", speaker: "John 3:16", title: "For God so loved the world", organization: "Holy Bible", showPhoto: false, showLogo: false },
    { id: "lt_social", name: "Social Handle", color: TEAL, accent: "#5EEAD4", bar: "#042F2E", text: WHITE, muted: "#99F6E4", layout: "logoRight", animation: "slide", duration: 500, easing: "cubic", speaker: "@beaconworship", title: "Follow us this week", organization: "Beacon Worship", showPhoto: false, showLogo: true },
    { id: "lt_live_badge", name: "Live Badge", color: RED, accent: RED, bar: BLACK, text: WHITE, muted: "#FECACA", layout: "live", animation: "fade", duration: 420, easing: "sine", speaker: "Sunday Service", title: "Streaming now", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_flag_gold", name: "Gold Flag", color: GOLD, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "flag", animation: "slide", duration: 540, easing: "cubic", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_dual_tone", name: "Dual Tone", color: NAVY, accent: GOLD, bar: NAVY, text: WHITE, muted: NAVY, layout: "split", animation: "slide", duration: 500, easing: "cubic", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_ribbon", name: "Ribbon", color: RED, accent: "#FECACA", bar: RED, text: WHITE, muted: CREAM, layout: "ribbon", animation: "fly", duration: 560, easing: "back", speaker: "Special Guest", title: "Visiting Minister", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_minimal_line", name: "Minimal Line", color: WHITE, accent: WHITE, bar: "transparent", text: WHITE, muted: "#E2E8F0", layout: "minimal", animation: "fade", duration: 480, easing: "sine", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_navy_full", name: "Navy Full Width", color: NAVY, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "fullbar", animation: "slide", duration: 500, easing: "cubic", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: false, showLogo: true },
    { id: "lt_photo_round", name: "Round Portrait", color: GOLD, accent: GOLD, bar: "rgba(11,31,58,0.92)", text: WHITE, muted: GOLD, layout: "photoLeft", animation: "scale", duration: 520, easing: "back", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: true, showLogo: false },
    { id: "lt_logo_lockup", name: "Logo Lockup", color: GOLD, accent: GOLD, bar: WHITE, text: NAVY, muted: "#475569", layout: "logoRight", animation: "fade", duration: 480, easing: "sine", speaker: "Beacon Worship", title: "A house of prayer", organization: "Accra, Ghana", showPhoto: false, showLogo: true },
    { id: "lt_accent_stripe", name: "Accent Stripe", color: ORANGE, accent: ORANGE, bar: "#1C1917", text: WHITE, muted: "#FDBA74", layout: "stripe", animation: "slide", duration: 500, easing: "cubic", speaker: "Pastor Name", title: "Guest Speaker", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_sunset", name: "Sunset Gradient", color: ORANGE, accent: GOLD, bar: "linear-gradient(90deg, #7C2D12 0%, #C2410C 55%, #F59E0B 100%)", text: WHITE, muted: CREAM, layout: "fullbar", animation: "fade", duration: 560, easing: "sine", speaker: "Evening Service", title: "Come as you are", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_teal_modern", name: "Teal Modern", color: TEAL, accent: "#5EEAD4", bar: "#134E4A", text: WHITE, muted: "#99F6E4", layout: "capsule", animation: "fly", duration: 500, easing: "cubic", speaker: "Host Name", title: "Service Host", organization: "Beacon Worship", showPhoto: true, showLogo: false },
    { id: "lt_white_clean", name: "White Clean", color: "#E2E8F0", accent: NAVY, bar: WHITE, text: NAVY, muted: "#475569", layout: "photoCard", animation: "fade", duration: 460, easing: "sine", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: true, showLogo: false },
    { id: "lt_blackout", name: "Blackout Gold", color: BLACK, accent: GOLD, bar: BLACK, text: GOLD, muted: WHITE, layout: "fullbar", animation: "slide", duration: 520, easing: "cubic", speaker: "Pastor Name", title: "Senior Pastor", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_ticker", name: "Thin Ticker", color: GOLD, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "ticker", animation: "slide", duration: 420, easing: "linear", speaker: "Beacon Worship  ·  Sunday 9AM  ·  Accra", title: "", organization: "", showPhoto: false, showLogo: false },
    { id: "lt_venue", name: "Venue", color: SKY, accent: "#7DD3FC", bar: "#0C4A6E", text: WHITE, muted: "#BAE6FD", layout: "logoRight", animation: "fade", duration: 480, easing: "sine", speaker: "Main Auditorium", title: "Accra, Ghana", organization: "Beacon Worship", showPhoto: false, showLogo: true },
    { id: "lt_coming_up", name: "Coming Up", color: GOLD, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "split", animation: "fly", duration: 540, easing: "back", speaker: "Coming Up", title: "Next in worship", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_prayer", name: "Prayer", color: PURPLE, accent: "#E9D5FF", bar: "rgba(46,16,101,0.86)", text: WHITE, muted: "#E9D5FF", layout: "glass", animation: "fade", duration: 560, easing: "sine", speaker: "Let us pray", title: "A moment of prayer", organization: "Beacon Worship", showPhoto: false, showLogo: false },
    { id: "lt_giving", name: "Giving", color: GREEN, accent: "#86EFAC", bar: "#052E16", text: WHITE, muted: "#BBF7D0", layout: "stripe", animation: "slide", duration: 500, easing: "cubic", speaker: "Giving", title: "Every gift makes a difference", organization: "Beacon Worship", showPhoto: false, showLogo: true },
    { id: "lt_youth", name: "Youth Night", color: PINK, accent: "#F9A8D4", bar: "#500724", text: WHITE, muted: "#FBCFE8", layout: "capsule", animation: "scale", duration: 480, easing: "back", speaker: "Youth Night", title: "Friday 7PM", organization: "Beacon Youth", showPhoto: true, showLogo: false },
    { id: "lt_kids", name: "Kids Church", color: ORANGE, accent: "#FDBA74", bar: "#7C2D12", text: WHITE, muted: CREAM, layout: "centered", animation: "scale", duration: 500, easing: "elastic", speaker: "Kids Church", title: "Now in session", organization: "Beacon Kids", showPhoto: false, showLogo: false },
    { id: "lt_conference", name: "Conference", color: NAVY, accent: GOLD, bar: NAVY, text: WHITE, muted: GOLD, layout: "photoCard", animation: "slide", duration: 540, easing: "cubic", speaker: "Speaker Name", title: "Session 1  ·  Main Hall", organization: "Beacon Conference", showPhoto: true, showLogo: true },
    { id: "lt_testimony", name: "Testimony", color: GOLD, accent: GOLD, bar: "rgba(11,31,58,0.82)", text: WHITE, muted: CREAM, layout: "photoLeft", animation: "fade", duration: 560, easing: "sine", speaker: "Testimony", title: "What God has done", organization: "Beacon Worship", showPhoto: true, showLogo: false }
]

export const LOWER_THIRD_IDS = LOWER_THIRD_VARIANTS.map((v) => v.id)

export function defaultLowerThirdSettings(variant: LowerThirdVariant): LowerThirdSettings {
    return {
        variant: variant.id,
        speaker: variant.speaker,
        title: variant.title,
        organization: variant.organization,
        accent: variant.accent,
        animation: variant.animation,
        showLogo: variant.showLogo,
        showPhoto: variant.showPhoto
    }
}

function initials(value: string, fallback: string) {
    const parts = (value || "").trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return fallback
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function anim(variant: LowerThirdVariant, config: LowerThirdSettings, delay = 0, extra?: { direction?: string }) {
    const type = config.animation || variant.animation
    const transition: any = { type, duration: variant.duration, easing: variant.easing }
    if (extra?.direction) transition.custom = { direction: extra.direction }
    return { showTimer: delay, transition }
}

function textItem(id: string, style: string, value: string, textStyle: string, align: string, actions: any): Item {
    return {
        id,
        type: "text",
        style,
        align,
        textFit: "shrinkToFit",
        actions,
        lines: [{ align: align.includes("flex-end") ? "text-align: right;" : align.includes("center") ? "text-align: center;" : "text-align: left;", text: [{ value, style: textStyle }] }]
    }
}

function shapeItem(id: string, style: string, actions: any): Item {
    return { id, style, actions }
}

function mediaOrPlaceholder(id: string, style: string, src: string | undefined, placeholder: string, placeholderColor: string, textColor: string, actions: any): Item {
    if (src) {
        return { id, type: "media", src, fit: "cover", style, actions }
    }
    return textItem(id, `${style}background-color: ${placeholderColor};`, placeholder, `font-size: 42px;font-weight: bold;color: ${textColor};font-family: Arial;text-shadow: 0 0 #000000;`, "align-items: center;justify-content: center;", actions)
}

function bg(style: string, color: string) {
    if (!color || color === "transparent") return style
    if (color.includes("gradient")) return `${style}background: ${color};`
    return `${style}background-color: ${color};`
}

export function buildLowerThirdItems(variant: LowerThirdVariant, config: LowerThirdSettings): Item[] {
    const accent = config.accent || variant.accent
    const bar = variant.bar
    const text = variant.text
    const muted = variant.muted
    const speaker = config.speaker || variant.speaker
    const title = config.title || ""
    const org = config.organization || ""
    const photo = config.showPhoto
    const logo = config.showLogo
    const dir = { direction: "left_right" as const }
    const up = { direction: "bottom_top" as const }

    const photoSrc = config.photo
    const logoSrc = config.logo
    const photoLabel = initials(speaker, "PH")
    const logoLabel = initials(org || speaker, "BW")

    const nameStyle = `font-family: Arial;font-size: 52px;font-weight: bold;color: ${text};text-shadow: 0 2px 8px rgb(0 0 0 / 0.45);`
    const titleStyle = `font-family: Arial;font-size: 32px;font-weight: 600;color: ${muted};text-shadow: 0 1px 6px rgb(0 0 0 / 0.35);`
    const smallStyle = `font-family: Arial;font-size: 22px;font-weight: 600;color: ${muted};letter-spacing: 2px;text-transform: uppercase;text-shadow: 0 0 #000000;`

    const items: Item[] = []
    const a0 = anim(variant, config, 0, variant.layout === "fullbar" || variant.layout === "ticker" ? up : dir)
    const a1 = anim(variant, config, 0.12, dir)
    const a2 = anim(variant, config, 0.22, dir)
    const a3 = anim(variant, config, 0.18)

    const addPhoto = (style: string) => {
        if (!photo) return
        items.push(mediaOrPlaceholder("lt_photo", style, photoSrc, photoLabel, accent, text === WHITE ? NAVY : WHITE, a3))
    }
    const addLogo = (style: string) => {
        if (!logo) return
        items.push(mediaOrPlaceholder("lt_logo", style, logoSrc, logoLabel, accent, text === WHITE ? NAVY : WHITE, a3))
    }

    switch (variant.layout) {
        case "stripe": {
            const left = photo ? 310 : 80
            items.push(shapeItem("lt_bar", bg(`top: 820px;left: ${left}px;height: 170px;width: ${logo ? 1320 : 1500}px;`, bar) + "box-shadow: 0 12px 40px rgb(0 0 0 / 0.35);", a0))
            items.push(shapeItem("lt_accent", `top: 820px;left: ${left}px;height: 170px;width: 14px;background-color: ${accent};`, a0))
            items.push(textItem("lt_speaker", `top: 828px;left: ${left + 36}px;height: 92px;width: 1180px;padding: 0 8px;`, speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", `top: 918px;left: ${left + 36}px;height: 60px;width: 1180px;padding: 0 8px;`, title || org, titleStyle, "", a2))
            addPhoto("top: 790px;left: 70px;height: 230px;width: 230px;border-radius: 18px;box-shadow: 0 12px 30px rgb(0 0 0 / 0.4);")
            addLogo("top: 845px;left: 1680px;height: 120px;width: 160px;")
            break
        }
        case "fullbar": {
            items.push(shapeItem("lt_bar", bg("top: 860px;left: 0px;height: 220px;width: 1920px;", bar), a0))
            items.push(shapeItem("lt_accent", `top: 860px;left: 0px;height: 8px;width: 1920px;background-color: ${accent};`, a0))
            const textLeft = photo ? 280 : 80
            items.push(textItem("lt_speaker", `top: 880px;left: ${textLeft}px;height: 100px;width: ${logo ? 1300 : 1600}px;padding: 0 10px;`, speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", `top: 980px;left: ${textLeft}px;height: 70px;width: ${logo ? 1300 : 1600}px;padding: 0 10px;`, title || org, titleStyle, "", a2))
            addPhoto("top: 885px;left: 50px;height: 170px;width: 170px;border-radius: 12px;")
            addLogo("top: 900px;left: 1680px;height: 140px;width: 180px;")
            break
        }
        case "photoLeft": {
            items.push(shapeItem("lt_bar", bg("top: 800px;left: 280px;height: 200px;width: 1280px;", bar) + "border-radius: 8px;box-shadow: 0 16px 40px rgb(0 0 0 / 0.35);", a0))
            items.push(textItem("lt_speaker", "top: 820px;left: 330px;height: 100px;width: 1100px;padding: 0 8px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 920px;left: 330px;height: 60px;width: 900px;padding: 0 8px;", title, titleStyle, "", a2))
            if (org) items.push(textItem("lt_org", `top: 920px;left: 1240px;height: 60px;width: 280px;padding: 0 8px;`, org, smallStyle, "align-items: center;justify-content: flex-end;", a2))
            addPhoto(`top: 760px;left: 70px;height: 250px;width: 250px;border-radius: 500px;border-width: 6px;border-style: solid;border-color: ${accent};box-shadow: 0 12px 28px rgb(0 0 0 / 0.4);`)
            addLogo("top: 845px;left: 1600px;height: 110px;width: 150px;")
            break
        }
        case "photoCard": {
            items.push(shapeItem("lt_bar", bg("top: 760px;left: 120px;height: 240px;width: 1500px;", bar) + "border-radius: 28px;box-shadow: 0 18px 50px rgb(0 0 0 / 0.4);", a0))
            items.push(shapeItem("lt_accent", `top: 760px;left: 120px;height: 240px;width: 18px;background-color: ${accent};border-radius: 28px 0 0 28px;`, a0))
            items.push(textItem("lt_speaker", "top: 790px;left: 420px;height: 100px;width: 900px;padding: 0 8px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 890px;left: 420px;height: 50px;width: 900px;padding: 0 8px;", title, titleStyle, "", a2))
            if (org) items.push(textItem("lt_org", "top: 940px;left: 420px;height: 40px;width: 900px;padding: 0 8px;", org, smallStyle, "", a2))
            addPhoto("top: 790px;left: 170px;height: 180px;width: 180px;border-radius: 24px;")
            addLogo("top: 810px;left: 1400px;height: 140px;width: 180px;")
            break
        }
        case "logoRight": {
            items.push(shapeItem("lt_bar", bg("top: 830px;left: 80px;height: 170px;width: 1760px;", bar) + "border-radius: 16px;box-shadow: 0 12px 36px rgb(0 0 0 / 0.3);", a0))
            items.push(textItem("lt_speaker", "top: 845px;left: 120px;height: 90px;width: 1300px;padding: 0 8px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 935px;left: 120px;height: 50px;width: 1300px;padding: 0 8px;", title || org, titleStyle, "", a2))
            addPhoto("top: 850px;left: 80px;height: 130px;width: 130px;border-radius: 16px;")
            addLogo("top: 850px;left: 1620px;height: 130px;width: 180px;")
            break
        }
        case "minimal": {
            items.push(shapeItem("lt_accent", `top: 930px;left: 80px;height: 6px;width: 420px;background-color: ${accent};`, a0))
            items.push(textItem("lt_speaker", "top: 820px;left: 80px;height: 100px;width: 1400px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 948px;left: 80px;height: 60px;width: 1400px;", title || org, titleStyle, "", a2))
            addPhoto("top: 800px;left: 1600px;height: 200px;width: 200px;border-radius: 500px;")
            addLogo("top: 850px;left: 1620px;height: 120px;width: 160px;")
            break
        }
        case "flag": {
            items.push(shapeItem("lt_accent", `top: 800px;left: 60px;height: 210px;width: 70px;background-color: ${accent};`, a0))
            items.push(shapeItem("lt_bar", bg("top: 800px;left: 130px;height: 210px;width: 1100px;", bar) + "box-shadow: 0 14px 36px rgb(0 0 0 / 0.35);", a0))
            items.push(textItem("lt_speaker", "top: 820px;left: 170px;height: 100px;width: 1000px;padding: 0 8px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 920px;left: 170px;height: 70px;width: 1000px;padding: 0 8px;", title || org, titleStyle, "", a2))
            addPhoto("top: 800px;left: 1260px;height: 210px;width: 210px;")
            addLogo("top: 845px;left: 1500px;height: 120px;width: 160px;")
            break
        }
        case "capsule": {
            const left = photo ? 280 : 80
            items.push(shapeItem("lt_bar", bg(`top: 830px;left: ${left}px;height: 170px;width: 1400px;`, bar) + "border-radius: 500px;box-shadow: 0 14px 40px rgb(0 0 0 / 0.35);", a0))
            items.push(textItem("lt_speaker", `top: 845px;left: ${left + 50}px;height: 85px;width: 1100px;padding: 0 8px;`, speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", `top: 930px;left: ${left + 50}px;height: 50px;width: 1100px;padding: 0 8px;`, title || org, titleStyle, "", a2))
            addPhoto(`top: 800px;left: 70px;height: 230px;width: 230px;border-radius: 500px;border-width: 6px;border-style: solid;border-color: ${accent};`)
            addLogo("top: 855px;left: 1550px;height: 120px;width: 150px;border-radius: 20px;")
            break
        }
        case "split": {
            items.push(shapeItem("lt_accent", bg("top: 800px;left: 80px;height: 70px;width: 520px;", accent) + "border-radius: 8px 8px 0 0;", a0))
            items.push(textItem("lt_org", "top: 800px;left: 100px;height: 70px;width: 480px;padding: 0 8px;", org || "BEACON WORSHIP", `font-family: Arial;font-size: 28px;font-weight: bold;color: ${bar === WHITE ? NAVY : NAVY};letter-spacing: 2px;text-transform: uppercase;text-shadow: 0 0 #000000;`, "align-items: center;", a1))
            items.push(shapeItem("lt_bar", bg("top: 870px;left: 80px;height: 140px;width: 1500px;", bar) + "border-radius: 0 12px 12px 12px;box-shadow: 0 12px 32px rgb(0 0 0 / 0.3);", a0))
            items.push(textItem("lt_speaker", "top: 880px;left: 110px;height: 80px;width: 1200px;padding: 0 8px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 955px;left: 110px;height: 45px;width: 1200px;padding: 0 8px;", title, titleStyle, "", a2))
            addPhoto("top: 800px;left: 1620px;height: 210px;width: 210px;border-radius: 16px;")
            addLogo("top: 890px;left: 1480px;height: 100px;width: 140px;")
            break
        }
        case "glass": {
            items.push(shapeItem("lt_bar", bg("top: 820px;left: 80px;height: 180px;width: 1500px;", bar) + "border-radius: 22px;backdrop-filter: blur(16px);box-shadow: 0 16px 40px rgb(0 0 0 / 0.28);", a0))
            items.push(shapeItem("lt_accent", `top: 850px;left: 110px;height: 120px;width: 8px;background-color: ${accent};border-radius: 8px;`, a0))
            items.push(textItem("lt_speaker", "top: 840px;left: 140px;height: 90px;width: 1200px;padding: 0 8px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 930px;left: 140px;height: 50px;width: 1200px;padding: 0 8px;", title || org, titleStyle, "", a2))
            addPhoto("top: 830px;left: 1620px;height: 160px;width: 160px;border-radius: 500px;")
            addLogo("top: 845px;left: 1620px;height: 130px;width: 160px;")
            break
        }
        case "ribbon": {
            items.push(shapeItem("lt_bar", bg("top: 850px;left: 0px;height: 150px;width: 1500px;", bar) + "transform: skewX(-12deg);box-shadow: 0 14px 32px rgb(0 0 0 / 0.35);", a0))
            items.push(textItem("lt_speaker", "top: 860px;left: 90px;height: 80px;width: 1200px;padding: 0 8px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 940px;left: 90px;height: 45px;width: 1200px;padding: 0 8px;", title || org, titleStyle, "", a2))
            addPhoto("top: 820px;left: 1540px;height: 200px;width: 200px;border-radius: 20px;")
            addLogo("top: 865px;left: 1540px;height: 120px;width: 160px;")
            break
        }
        case "corner": {
            items.push(shapeItem("lt_bar", bg("top: 860px;left: 50px;height: 160px;width: 860px;", bar) + "border-radius: 4px 28px 4px 4px;box-shadow: 0 12px 28px rgb(0 0 0 / 0.35);", a0))
            items.push(shapeItem("lt_accent", `top: 860px;left: 50px;height: 8px;width: 860px;background-color: ${accent};`, a0))
            items.push(textItem("lt_speaker", "top: 875px;left: 70px;height: 80px;width: 800px;padding: 0 8px;", speaker, nameStyle.replace("52px", "44px"), "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 955px;left: 70px;height: 50px;width: 800px;padding: 0 8px;", title || org, titleStyle.replace("32px", "26px"), "", a2))
            addPhoto("top: 860px;left: 930px;height: 160px;width: 160px;border-radius: 12px;")
            addLogo("top: 880px;left: 930px;height: 120px;width: 140px;")
            break
        }
        case "ticker": {
            items.push(shapeItem("lt_bar", bg("top: 1000px;left: 0px;height: 80px;width: 1920px;", bar), a0))
            items.push(shapeItem("lt_accent", `top: 1000px;left: 0px;height: 80px;width: 12px;background-color: ${accent};`, a0))
            items.push(textItem("lt_speaker", "top: 1000px;left: 40px;height: 80px;width: 1700px;padding: 0 12px;", speaker || title || org, `font-family: Arial;font-size: 32px;font-weight: 600;color: ${text};letter-spacing: 1px;text-shadow: 0 0 #000000;`, "align-items: center;", a1))
            addLogo("top: 1008px;left: 1760px;height: 64px;width: 120px;")
            addPhoto("top: 1006px;left: 1760px;height: 68px;width: 68px;border-radius: 500px;")
            break
        }
        case "centered": {
            items.push(shapeItem("lt_bar", bg("top: 820px;left: 360px;height: 180px;width: 1200px;", bar) + "border-radius: 32px;box-shadow: 0 16px 44px rgb(0 0 0 / 0.35);", a0))
            items.push(textItem("lt_speaker", "top: 840px;left: 400px;height: 90px;width: 1120px;padding: 0 8px;", speaker, nameStyle, "align-items: center;justify-content: center;", a1))
            items.push(textItem("lt_title", "top: 930px;left: 400px;height: 50px;width: 1120px;padding: 0 8px;", title || org, titleStyle, "align-items: center;justify-content: center;", a2))
            addPhoto("top: 790px;left: 200px;height: 240px;width: 240px;border-radius: 500px;")
            addLogo("top: 850px;left: 1480px;height: 120px;width: 160px;")
            break
        }
        case "live": {
            items.push(shapeItem("lt_bar", bg("top: 860px;left: 80px;height: 150px;width: 1400px;", bar) + "border-radius: 8px;box-shadow: 0 12px 32px rgb(0 0 0 / 0.4);", a0))
            items.push(shapeItem("lt_accent", `top: 885px;left: 110px;height: 100px;width: 160px;background-color: ${accent};border-radius: 8px;`, a0))
            items.push(textItem("lt_org", "top: 885px;left: 110px;height: 100px;width: 160px;", "LIVE", `font-family: Arial;font-size: 36px;font-weight: bold;color: ${WHITE};letter-spacing: 3px;text-shadow: 0 0 #000000;`, "align-items: center;justify-content: center;", a1))
            items.push(textItem("lt_speaker", "top: 870px;left: 300px;height: 80px;width: 1100px;padding: 0 8px;", speaker, nameStyle, "align-items: flex-end;", a1))
            items.push(textItem("lt_title", "top: 950px;left: 300px;height: 45px;width: 1100px;padding: 0 8px;", title, titleStyle, "", a2))
            addPhoto("top: 850px;left: 1540px;height: 170px;width: 170px;border-radius: 12px;")
            addLogo("top: 875px;left: 1540px;height: 120px;width: 160px;")
            break
        }
    }

    return items
}

export function getVariant(id: string) {
    return LOWER_THIRD_VARIANTS.find((v) => v.id === id) || LOWER_THIRD_VARIANTS[0]
}

export function rebuildLowerThird(variantId: string, config: LowerThirdSettings): { items: Item[]; settings: LowerThirdSettings } {
    const variant = getVariant(variantId)
    const settings: LowerThirdSettings = {
        ...defaultLowerThirdSettings(variant),
        ...config,
        variant: variant.id
    }
    return { items: buildLowerThirdItems(variant, settings), settings }
}

const CATEGORY = { name: "category.lower_thirds", icon: "people", default: true }

export function ensureLowerThirdCategory() {
    overlayCategories.update((a) => {
        if (!a[LOWER_THIRD_CATEGORY]) a[LOWER_THIRD_CATEGORY] = { ...CATEGORY }
        return a
    })
    templateCategories.update((a) => {
        if (!a[LOWER_THIRD_CATEGORY]) a[LOWER_THIRD_CATEGORY] = { ...CATEGORY }
        return a
    })
}

export function getDefaultLowerThirdOverlays(): Record<string, Overlay> {
    const overlays: Record<string, Overlay> = {}
    LOWER_THIRD_VARIANTS.forEach((variant) => {
        const settings = defaultLowerThirdSettings(variant)
        overlays[variant.id] = {
            isDefault: true,
            name: variant.name,
            color: variant.color,
            category: LOWER_THIRD_CATEGORY,
            items: buildLowerThirdItems(variant, settings),
            lowerThird: settings
        }
    })
    return overlays
}

export function getDefaultLowerThirdTemplates(): Record<string, Template> {
    const templates: Record<string, Template> = {}
    LOWER_THIRD_VARIANTS.forEach((variant) => {
        const settings = defaultLowerThirdSettings(variant)
        templates[variant.id] = {
            isDefault: true,
            name: variant.name,
            color: variant.color,
            category: LOWER_THIRD_CATEGORY,
            settings: { lowerThird: settings },
            items: buildLowerThirdItems(variant, settings)
        }
    })
    return templates
}
