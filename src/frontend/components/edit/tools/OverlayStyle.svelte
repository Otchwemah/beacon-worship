<script lang="ts">
    import type { Item } from "../../../../types/Show"
    import { activeEdit, overlays } from "../../../stores"
    import { LOWER_THIRD_CATEGORY } from "../../../utils/lowerThirds"
    import ItemsList from "./ItemsList.svelte"
    import LowerThirdStudio from "./LowerThirdStudio.svelte"

    export let allSlideItems: Item[]

    $: overlay = $overlays[$activeEdit.id || ""]
    $: isLowerThird = overlay?.category === LOWER_THIRD_CATEGORY || !!overlay?.lowerThird
</script>

<div class="tools">
    {#if isLowerThird}
        <LowerThirdStudio />
    {/if}
    <ItemsList bind:allSlideItems />
</div>

<style>
    .tools {
        padding: 8px 5px;

        display: flex;
        flex-direction: column;
        gap: 5px;
    }
</style>
