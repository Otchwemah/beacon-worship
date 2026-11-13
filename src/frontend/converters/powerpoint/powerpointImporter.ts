import { get } from "svelte/store"
import { uid } from "uid"
import type { Show, Slide, SlideData } from "../../../types/Show"
import { ShowObj } from "../../classes/Show"
import { applyHymnBackground, toggleHymnCategory } from "../../components/drawer/hymns/hymns"
import { createFolderEntry, findFolderByPath } from "../../components/drawer/hymns/hymnFolders"
import { checkName } from "../../components/helpers/show"
import { categories, drawerTabsData, hymnFolders, special } from "../../stores"
import { translateText } from "../../utils/language"
import { createCategory, setTempShows } from "../importHelpers"
import { PowerPointPackage } from "./PowerPointHelper"
import { hymnBookCategoryId } from "./hymnBookCategory"

// Create (or reuse) the hymn-book category a folder import lands in, and register it as a
// hymn book so its decks show up in the Hymns tab even if they were not PPT-originated.
function createHymnBookCategory(name: string): string {
    const id = hymnBookCategoryId(name)
    if (!id) return ""

    if (!get(categories)[id]) createCategory(name, "book")

    special.update((a) => {
        a.hymnCategoryIds = toggleHymnCategory(a.hymnCategoryIds, id, true)
        return a
    })

    return id
}

// Beacon Worship: register the picked system folder in the Hymns LEFT panel, the same way
// the Media tab keeps its folders. It persists until the operator removes it, and remembers
// which category its decks were imported into so selecting it can filter the grid.
function registerHymnFolder(folderPath: string, name: string, categoryId: string) {
    if (!folderPath || !categoryId) return

    const existingId = findFolderByPath(get(hymnFolders), folderPath)
    if (existingId) {
        // re-loading the same folder refreshes the link instead of duplicating the row
        hymnFolders.update((a) => {
            if (a[existingId]) a[existingId].categoryId = categoryId
            return a
        })
        return
    }

    const id = uid()
    hymnFolders.update((a) => {
        a[id] = createFolderEntry(id, name, folderPath, categoryId)
        return a
    })
    // select the folder that was just loaded
    drawerTabsData.update((a) => {
        if (a.hymns) a.hymns.activeSubTab = id
        return a
    })
}

// missing shapes/tables/graphs
// item/line background, some text color incorrect
// extract embedded videos/audio

export function convertPowerpoint(files: any[], options: { categoryName?: string; folderPath?: string } = {}) {
    // Beacon Worship: hymn/PPT imports must not raise the blocking "Importing..." alert.
    // The import dialog already closes itself; setTempShows() still emits the normal
    // finished toast when conversion completes.

    // "Load folder" names the destination hymn book after the folder. Otherwise fall back
    // to the selected Shows category (or Presentation if none is selected).
    let categoryId = ""
    if (options.categoryName) {
        categoryId = createHymnBookCategory(options.categoryName)
        if (options.folderPath) registerHymnFolder(options.folderPath, options.categoryName, categoryId)
    } else {
        categoryId = get(drawerTabsData).shows?.activeSubTab || ""
        if (categoryId === "all" || categoryId === "unlabeled") categoryId = createCategory("presentation", "presentation", { isDefault: true })
    }

    const tempShows: any[] = []

    setTimeout(() => {
        files.forEach(({ name, content }: any) => {
            // console.log("PPT", content)

            let pkg: PowerPointPackage
            try {
                pkg = new PowerPointPackage(content)
            } catch {
                return
            }
            const presentationPart = pkg.getPresentation()
            if (!presentationPart) return

            // load font faces
            const contentPaths = content.contentPaths || {}
            // loadAllFonts(contentPaths)
            const fonts = getAllFontNames(contentPaths)

            const convertedSlides = pkg.getSlides()
            let slides: { [key: string]: Slide } = {}
            let layouts: SlideData[] = []
            let firstSlideId = ""
            convertedSlides.forEach((slide) => {
                if (!slide) return

                const id = uid()

                slides[id] = {
                    group: !firstSlideId ? "." : null,
                    color: null,
                    settings: { color: slide.bgColor || "" },
                    notes: slide.notes,
                    items: slide.items
                }

                // Beacon Worship: do NOT stamp a transition here. output.ts getOutputTransitions()
                // treats any truthy transition.type as an override, so the old
                // { type: "none", duration: 0 } permanently disabled transitions on every hymn
                // slide and made the global/style transition setting look broken.
                // Leaving it unset lets the deck inherit the operator's transition.
                const layoutData = {}

                if (!firstSlideId) {
                    firstSlideId = id
                    slides[id].children = []
                    layouts.push({ id, ...layoutData, children: {} })
                } else {
                    slides[firstSlideId].children!.push(id)
                    layouts[0].children![id] = layoutData
                }
            })

            // create show
            const layoutID = uid()
            const show: Show = new ShowObj(false, categoryId, layoutID, 0, false)
            show.name = checkName(name)
            show.origin = "powerpoint"
            show.settings.customFonts = fonts

            const meta: any = content["docProps/core.xml"]?.["cp:coreProperties"]
            if (meta) {
                show.meta = {
                    title: meta["dc:title"]?.[0] || show.name,
                    artist: meta["dc:creator"]?.[0] || ""
                }
                show.timestamps = {
                    created: new Date(meta["dcterms:created"]?.[0]?._ || 0).getTime(),
                    modified: new Date(meta["dcterms:modified"]?.[0]?._ || 0).getTime(),
                    used: null
                }
            }

            show.slides = slides
            show.layouts = { [layoutID]: { name: translateText("example.default"), notes: "", slides: layouts } }

            // Beacon Worship: use the deck's own embedded preview as the drawer-row thumbnail.
            // pptToShow() extracts docProps/thumbnail.* to disk and reports the path here.
            // Decks without a usable preview fall back to a live first-slide render.
            if (typeof content.deckThumbnailPath === "string" && content.deckThumbnailPath) {
                show.thumbnail = content.deckThumbnailPath
            }

            // Beacon Worship: if the operator has saved a hymn background, apply it to the
            // newly imported deck so every hymn slide uses it from the start.
            const hymnBackground = get(special).hymnBackgroundImage
            if (hymnBackground) {
                const applied = applyHymnBackground(show, hymnBackground)
                show.slides = applied.slides
                show.layouts = applied.layouts
            }

            tempShows.push({ id: uid(), show })
        })

        setTempShows(tempShows)
    }, 10)
}

function getAllFontNames(contentPaths: Record<string, string>) {
    const fontNames: { name: string; path: string }[] = []
    Object.keys(contentPaths).forEach((key) => {
        if (key.startsWith("ppt/fonts/") && key.endsWith(".fntdata")) {
            const fileName = key.slice(key.lastIndexOf("/") + 1)
            const match = fileName.match(/^(.+?)-?(regular|bold|italic|boldItalic)?\.fntdata$/i)
            if (match) {
                const name = spaceOnUppercase(match[1])
                fontNames.push({ name, path: contentPaths[key] })
            }
        }
    })
    return fontNames
}

function spaceOnUppercase(str: string) {
    // should not have space if there are multiple uppercase in a row (e.g., "PT Sans" not "P T Sans")
    return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
}
