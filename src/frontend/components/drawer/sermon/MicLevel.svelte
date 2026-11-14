<script lang="ts">
    import { audioLevelStore } from "../../../ai/stt/stt"

    export let on = false
</script>

<span class="level" class:on title="Microphone level"><span style="width: {Math.round($audioLevelStore * 100)}%;"></span></span>

<style>
    .level {
        width: 72px;
        height: 6px;
        flex-shrink: 0;
        background: rgb(255 255 255 / 0.12);
        overflow: hidden;
    }
    .level span {
        display: block;
        height: 100%;
        background: #2ecc71;
    }
</style>
