<script lang="ts">
    import { Main } from "../../../../types/IPC/Main"
    import { sendMain } from "../../../IPC/main"
    import { activeProfile, categories, drawerTabsData, hymnFolders, labelsDisabled, sortedShowsList, special } from "../../../stores"
    import { getAccess } from "../../../utils/profile"
    import Icon from "../../helpers/Icon.svelte"
    import T from "../../helpers/T.svelte"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import { filterHymnDecks, getHymnCategoryIds } from "../hymns/hymns"
    import { getFolderRows } from "../hymns/hymnFolders"
    import { sortObject } from "../../helpers/array"
    import NavigationSections from "./NavigationSections.svelte"

    // Beacon Worship — Hymns left navigation.
    //
    // Folders work like the Media tab: "Load folder" lives here in the left panel, a loaded
    // folder is persisted and stays until the operator removes it (right-click → Remove),
    // and selecting one filters the grid. The search bar sits above the grid (HymnsToolbar)
    // and searches within the current selection, or across every folder when All is active.

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: readOnly = profile.global === "read"
    $: activeSubTab = $drawerTabsData.hymns?.activeSubTab || ""

    $: hymnCategoryIds = $special.hymnCategoryIds || []
    $: hiddenCategoryIds = Object.entries(profile)
        .filter(([, level]) => level === "none")
        .map(([id]) => id)

    $: visibleDecks = filterHymnDecks($sortedShowsList, { category: "all", hymnCategoryIds, hiddenCategoryIds })
    $: unarchivedDecks = visibleDecks.filter((s) => !$categories[s.category || ""]?.isArchive)
    $: unlabeledCount = unarchivedDecks.filter((s) => !s.category || !$categories[s.category]).length

    // hymn-book categories (PowerPoint imports + operator-marked categories)
    $: bookIds = getHymnCategoryIds(unarchivedDecks, hymnCategoryIds)
    $: books = sortObject(
        bookIds.map((id) => ({ id, ...(($categories[id] || { name: id }) as any) })),
        "name"
    ).map((cat: any) => ({
        id: cat.id,
        label: cat.name || cat.id,
        icon: cat.icon,
        customIcon: true,
        boxedIcon: true,
        count: unarchivedDecks.filter((s) => s.category === cat.id).length
    }))

    // loaded system folders
    $: folderRows = getFolderRows($hymnFolders, unarchivedDecks)

    let sections: any[] = []
    $: sections = [
        [
            { id: "all", label: "category.all", icon: "all", count: unarchivedDecks.length },
            { id: "unlabeled", label: "category.unlabeled", icon: "noIcon", count: unlabeledCount, hidden: !unlabeledCount && activeSubTab !== "unlabeled" }
        ],
        [{ id: "TITLE", label: "hymns.folders" }, ...folderRows.map((f) => ({ id: f.id, label: f.label, icon: f.icon, count: f.count, boxedIcon: true }))],
        books.length ? [{ id: "TITLE", label: "hymns.books" }, ...books] : []
    ]

    // ---- load folder (native picker + recursive scan run in the main process) ----
    function addFolder() {
        sendMain(Main.IMPORT_FOLDER, { channel: "powerpoint", extensions: ["pptx", "ppt"], useFolderNameAsCategory: true, recursive: true })
    }

    function updateName(e: any) {
        const { id, value } = e.detail
        hymnFolders.update((a) => {
            if (a[id]) a[id].name = value
            return a
        })
    }
</script>

<NavigationSections {sections} active={activeSubTab} on:rename={updateName}>
    <div slot="section_1" style="padding: 8px;">
        <MaterialButton style="width: 100%;" title="hymns.load_folder_hint" variant="outlined" disabled={readOnly} on:click={addFolder} small>
            <Icon id="add" size={$labelsDisabled ? 0.9 : 1} white={$labelsDisabled} />
            {#if !$labelsDisabled}<T id="hymns.load_folder" />{/if}
        </MaterialButton>
    </div>
</NavigationSections>
