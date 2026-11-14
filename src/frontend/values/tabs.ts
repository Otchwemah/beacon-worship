import type { SettingsTabs } from "../../types/Tabs"

export const settingsTabs: SettingsTabs[] = ["general", "display_settings", "styles", "audio", "connection", "files", "profiles", "theme", "ai", "other"]

// Beacon Worship: drawer tab order is the operator's workflow order, and it also defines
// the Ctrl/Cmd+1..9 shortcuts (shortcuts.ts indexes Object.keys(drawerTabs)).
//   1 Shows · 2 Media · 3 Hymns · 4 Scripture · 5 Sermon · 6 Audio · 7 Overlays · 8 Templates · 9 Calendar
//   Functions is tenth (click only — Ctrl/Cmd+1..9 covers the first nine).
export const drawerTabs = {
    shows: { name: "tabs.shows", icon: "shows", title: "tabs.shows_info" },
    media: { name: "tabs.media", icon: "media", title: "" },
    hymns: { name: "tabs.hymns", icon: "book", title: "tabs.hymns_info" },
    scripture: { name: "tabs.scripture", icon: "scripture", title: "" },
    sermon: { name: "tabs.sermon", icon: "sermon", title: "tabs.sermon_info" },

    audio: { name: "tabs.audio", icon: "audio", title: "" },
    overlays: { name: "tabs.overlays", icon: "overlays", title: "" },
    templates: { name: "tabs.templates", icon: "templates", title: "" },

    calendar: { name: "tabs.calendar", icon: "calendar", title: "" },

    functions: { name: "tabs.functions", icon: "functions", title: "" }
}

// export const drawerTabs = {
//     shows: { name: "tabs.shows", icon: "shows", style: "background-color: #4b0b0b !important;color: #ff3a3a;" },
//     media: { name: "tabs.media", icon: "media", style: "background-color: #0b3a4b !important;color: #3affff;" },
//     audio: { name: "tabs.audio", icon: "audio", style: "background-color: #3a4b0b !important;color: #afff3a;" },
//     overlays: { name: "tabs.overlays", icon: "overlays", style: "background-color: #4b0b3a !important;color: #ff3aff;" },
//     templates: { name: "tabs.templates", icon: "templates", style: "background-color: #3a0b4b !important;color: #af3aff;" },

//     scripture: { name: "tabs.scripture", icon: "scripture", style: "background-color: #4b4b0b !important;color: #ffff3a;" },
//     calendar: { name: "tabs.calendar", icon: "calendar", style: "background-color: #0b4b3a !important;color: #3affaf;" },

//     functions: { name: "tabs.functions", icon: "functions", style: "background-color: #2b2b2b !important;color: #aaaaaa;" }
// }
