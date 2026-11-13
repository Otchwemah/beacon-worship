<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import { translateText } from "../../../utils/language"
    import Icon from "../../helpers/Icon.svelte"

    // Beacon Worship — two scripture searches, side by side, always visible.
    //
    // Left: reference (book / chapter / verse), e.g. "John 3:16" or "Ps 23". This is the same
    // query the top drawer search uses, so the two stay in sync and the existing reference
    // parser + autocomplete keep working untouched.
    // Right: phrase search across the whole translation. Previously this was hidden behind a
    // toolbar button (Ctrl+B) and replaced the toolbar when open, so it was easy to miss.

    export let reference = ""
    export let phrase = ""
    export let phraseDisabled = false
    export let phraseDisabledReason = ""
    export let resultCount: number | null = null

    let referenceElem: HTMLInputElement | null = null
    let phraseElem: HTMLInputElement | null = null

    const dispatch = createEventDispatcher()

    function clearReference() {
        reference = ""
        dispatch("referenceChange", "")
        referenceElem?.focus()
    }

    function clearPhrase() {
        phrase = ""
        dispatch("phraseChange", "")
        phraseElem?.focus()
    }

    function referenceKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            e.stopPropagation()
            if (reference) clearReference()
            return
        }
        if (e.key === "Enter") dispatch("referenceSubmit", reference)
    }

    function phraseKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            e.stopPropagation()
            if (phrase) clearPhrase()
            return
        }
        if (e.key === "Enter") dispatch("phraseSubmit", phrase)
    }

    export function focusReference() {
        referenceElem?.focus()
        referenceElem?.select()
    }

    export function focusPhrase() {
        phraseElem?.focus()
        phraseElem?.select()
    }
</script>

<div class="scripture-search-bars">
    <div class="bar" class:filled={!!reference}>
        <Icon id="book" size={0.95} />
        <input bind:this={referenceElem} bind:value={reference} class="edit scripture-reference-search" type="text" placeholder={translateText("scripture.reference_placeholder")} on:input={() => dispatch("referenceChange", reference)} on:keydown={referenceKeydown} />
        {#if reference}
            <button class="clear" title={translateText("clear.search")} on:click={clearReference}>
                <Icon id="close" size={0.85} />
            </button>
        {/if}
    </div>

    <div class="bar" class:filled={!!phrase} class:disabled={phraseDisabled} title={phraseDisabled ? phraseDisabledReason : translateText("scripture.phrase_hint")}>
        <Icon id="search" size={0.95} />
        <input bind:this={phraseElem} bind:value={phrase} class="edit scripture-phrase-search" type="text" placeholder={translateText("scripture.phrase_placeholder")} disabled={phraseDisabled} on:input={() => dispatch("phraseChange", phrase)} on:keydown={phraseKeydown} />
        {#if resultCount !== null && !phraseDisabled}
            <span class="results">{resultCount}</span>
        {/if}
        {#if phrase}
            <button class="clear" title={translateText("clear.search")} on:click={clearPhrase}>
                <Icon id="close" size={0.85} />
            </button>
        {/if}
    </div>
</div>

<style>
    .scripture-search-bars {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background-color: var(--primary-darker);
        border-bottom: 1px solid var(--primary-lighter);
        flex-shrink: 0;
    }

    .bar {
        display: flex;
        align-items: center;
        gap: 7px;
        flex: 1 1 0;
        min-width: 0;
        padding: 5px 10px;
        background-color: var(--primary-darkest);
        border: 1px solid var(--primary-lighter);
        border-radius: 8px;
        transition: border-color 0.15s ease;
    }

    .bar:focus-within,
    .bar.filled {
        border-color: var(--secondary);
    }

    .bar.disabled {
        opacity: 0.45;
    }

    .bar input {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text);
        font-size: 0.9em;
        padding: 2px 0;
    }

    .bar input:disabled {
        cursor: not-allowed;
    }

    .results {
        font-size: 0.75em;
        opacity: 0.65;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }

    .clear {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text);
        opacity: 0.6;
        padding: 2px;
        flex-shrink: 0;
    }
    .clear:hover {
        opacity: 1;
    }

    /* very narrow drawer: stack rather than squeeze both fields unreadably */
    @media screen and (max-width: 620px) {
        .scripture-search-bars {
            flex-direction: column;
            align-items: stretch;
        }
    }
</style>
