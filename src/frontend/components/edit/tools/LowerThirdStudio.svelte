<script lang="ts">
    import { get } from "svelte/store"
    import { OUTPUT } from "../../../../types/Channels"
    import type { LowerThirdSettings } from "../../../../types/Show"
    import { activeEdit, overlays, templates } from "../../../stores"
    import { defaultLowerThirdSettings, getVariant, rebuildLowerThird } from "../../../utils/lowerThirds"
    import { send } from "../../../utils/request"
    import { imageExtensions } from "../../../values/extensions"
    import { clone } from "../../helpers/array"
    import Icon from "../../helpers/Icon.svelte"
    import InputRow from "../../input/InputRow.svelte"
    import MaterialColorInput from "../../inputs/MaterialColorInput.svelte"
    import MaterialDropdown from "../../inputs/MaterialDropdown.svelte"
    import MaterialFilePicker from "../../inputs/MaterialFilePicker.svelte"
    import MaterialTextInput from "../../inputs/MaterialTextInput.svelte"
    import MaterialToggleSwitch from "../../inputs/MaterialToggleSwitch.svelte"

    $: id = $activeEdit.id || ""
    $: isOverlay = $activeEdit.type === "overlay"
    $: overlay = $overlays[id]
    $: template = $templates[id]
    $: source = isOverlay ? overlay : template

    $: stored = (isOverlay ? overlay?.lowerThird : template?.settings?.lowerThird) as LowerThirdSettings | undefined

    let config: LowerThirdSettings = {
        variant: id,
        speaker: "",
        title: "",
        organization: "",
        accent: "#DBAC64",
        animation: "slide",
        showLogo: false,
        showPhoto: false
    }

    $: if (id && source) syncFromStore()

    function syncFromStore() {
        const next = stored || defaultLowerThirdSettings(getVariant(id))
        config = {
            ...next,
            speaker: next.speaker ?? "",
            title: next.title ?? "",
            organization: next.organization ?? "",
            accent: next.accent || "#DBAC64",
            animation: next.animation || "slide",
            showLogo: !!next.showLogo,
            showPhoto: !!next.showPhoto,
            logo: next.logo || "",
            photo: next.photo || ""
        }
    }

    const animations = [
        { value: "slide", label: "Slide" },
        { value: "fade", label: "Fade" },
        { value: "fly", label: "Fly" },
        { value: "scale", label: "Scale" },
        { value: "spin", label: "Spin" },
        { value: "blur", label: "Blur" }
    ]

    function apply(partial: Partial<LowerThirdSettings>) {
        if (!id || !source) return

        const next: LowerThirdSettings = {
            ...config,
            ...partial,
            variant: stored?.variant || id
        }
        config = next

        const rebuilt = rebuildLowerThird(next.variant || id, next)

        if (isOverlay) {
            overlays.update((a) => {
                if (!a[id]) return a
                a[id] = { ...a[id], items: rebuilt.items, lowerThird: rebuilt.settings, modified: Date.now() }
                return a
            })
            send(OUTPUT, ["OVERLAY"], get(overlays))
            return
        }

        templates.update((a) => {
            if (!a[id]) return a
            a[id] = {
                ...a[id],
                items: rebuilt.items,
                settings: { ...(a[id].settings || {}), lowerThird: rebuilt.settings },
                modified: Date.now()
            }
            return a
        })
    }

    function setText(key: "speaker" | "title" | "organization", e: CustomEvent) {
        apply({ [key]: e.detail ?? "" })
    }

    function setFile(key: "logo" | "photo", path: string) {
        if (key === "logo") apply({ logo: path || "", showLogo: !!path || config.showLogo })
        else apply({ photo: path || "", showPhoto: !!path || config.showPhoto })
    }
</script>

<div class="studio">
    <div class="title">
        <Icon id="people" white />
        <p>Lower Third</p>
    </div>

    <MaterialTextInput label="Speaker" value={config.speaker} on:change={(e) => setText("speaker", e)} />
    <MaterialTextInput label="Title" value={config.title} on:change={(e) => setText("title", e)} />
    <MaterialTextInput label="Organization" value={config.organization} on:change={(e) => setText("organization", e)} />

    <MaterialColorInput
        label="Accent color"
        value={config.accent}
        on:input={(e) => apply({ accent: e.detail })}
        noLabel
    />

    <MaterialDropdown label="Animation" options={animations} value={config.animation} defaultValue="slide" on:change={(e) => apply({ animation: e.detail })} />

    <MaterialToggleSwitch label="Show speaker photo" checked={config.showPhoto} on:change={(e) => apply({ showPhoto: e.detail })} />
    {#if config.showPhoto}
        <MaterialFilePicker
            label="Speaker photo"
            value={config.photo}
            icon="image"
            filter={{ name: "Images", extensions: clone(imageExtensions) }}
            showThumbnail
            allowEmpty
            on:change={(e) => setFile("photo", e.detail || "")}
        />
    {/if}

    <MaterialToggleSwitch label="Show logo" checked={config.showLogo} on:change={(e) => apply({ showLogo: e.detail })} />
    {#if config.showLogo}
        <MaterialFilePicker
            label="Logo"
            value={config.logo}
            icon="image"
            filter={{ name: "Images", extensions: clone(imageExtensions) }}
            showThumbnail
            allowEmpty
            on:change={(e) => setFile("logo", e.detail || "")}
        />
    {/if}

    <InputRow>
        <p class="hint">
            {#if isOverlay}
                Add a photo or logo, then click the card in Overlays to put it on the live output.
            {:else}
                Add a photo or logo here. Click the card in Templates to apply it, or use the matching overlay to go live.
            {/if}
        </p>
    </InputRow>
</div>

<style>
    .studio {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--primary-lighter);
        margin-bottom: 8px;
    }

    .title {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px 12px 4px;
        font-weight: 600;
        opacity: 0.9;
    }

    .hint {
        font-size: 0.78em;
        opacity: 0.7;
        padding: 4px 8px 8px;
        line-height: 1.35;
    }
</style>
