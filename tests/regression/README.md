# Beacon Worship regression checks

Repeatable release regression checks for the customized branch. These drive the **real built
Electron app**, so they cover things unit tests cannot: rendered dropdowns, keyboard shortcuts,
the audience-output toggle, Bible navigation and hymn selection.

This is separate from the Release workflow. Nothing here publishes, signs or uploads a release.

## Running locally

```bash
npm ci
npm run build            # required: package.json "main" is build/electron/index.js
npm run test:regression
```

List the specs without launching Electron (no display or browsers needed):

```bash
npm run test:regression:list
```

On a headless Linux box, wrap the run in a virtual display:

```bash
xvfb-run --auto-servernum --server-args="-screen 0 1280x960x24" -- npm run test:regression
```

## Coverage

| Area | Spec |
| --- | --- |
| Branding / startup | main window opens titled 'Beacon Worship' |
| Hymn selection | standalone Hymns tab activates; hymn-specific search placeholder; numeric query retained |
| Keyboard controls | `Ctrl+F` focuses drawer search; `Ctrl+<n>` switches drawer tabs |
| Bible navigation | Scripture tab opens and exposes a version/book dropdown |
| Dropdowns | opens, lists `[role="option"]`, closes after a choice |
| Live / audience outputs | toggle present and exposes on/off; toggling keeps the control window alive |

## Why these selectors

The specs deliberately use ids and classes the app **already** renders, instead of adding
test-only attributes throughout the UI:

- drawer tabs render `id={tab.id}` via `MaterialButton` → `<button id="hymns">`, `#scripture`, …
- drawer search input is `input.drawer_search`
- dropdowns: `.dropdownElem` (Dropdown.svelte) **and** `.textfield:has(.dropdown-trigger)`
  (MaterialDropdown.svelte); both list `[role="option"]` entries
- Scripture navigation is `.main.scripture` with a `.books` list
- the audience output toggle is `#output_window_button` and carries an `on`/`off` class

## Traps found by the first real CI runs

These cost a full CI cycle each; keep them in mind when editing the specs:

1. **Two startup windows.** `public/loading.html` opens in its own `BrowserWindow` titled
   *"Beacon Worship - Loading"*. Matching the window by title alone selects the loading window,
   which then closes → `Target page, context or browser has been closed`. Skip `loading.html`
   and require the drawer tab strip instead.
2. **`span.tabs` is not unique.** The top bar has a similarly-classed strip, so a bare
   `span.tabs` locator throws a Playwright strict-mode violation. Scope it as
   `span.tabs:has(#hymns)`.
3. **The update popup blocks everything — and it races.** `utils/updateSettings.ts` calls
   `checkForUpdates()` on a **50 ms timer**, which sets `activePopup` to `new_update`; its
   `div.popup` overlay intercepts all clicks (`... intercepts pointer events`). Dismissing it
   per-test is not enough: it can open *between* the dismissal and the click. The durable fix is
   a context-level route installed right after launch that returns `[]` for
   `api.github.com/repos/ChurchApps/freeshow/releases`, so `hasUpdate` is false and the popup
   never opens. `dismissPopups()` and `clickStable()` remain as belt-and-braces.
4. **Drawer shortcut indices are positional.** Order is shows, media, audio, overlays,
   templates, scripture, calendar, functions, hymns → Scripture is `Ctrl+6`. The spec derives
   indices from the rendered tab bar rather than hardcoding them.

## Runner notes

- **Do not** point Playwright at `src/**/*.test.ts`. Those are vitest unit suites. This config
  uses `tests/regression/**/*.regression.ts` so the two runners never collide. (The original
  config used `testDir: "."` + `**/*.test.ts`, which did collide.)
- One Electron instance at a time (`workers: 1`) to avoid port/store conflicts.
- CI runs Windows first, then macOS, per the project's Windows-first requirement.
- The audience-output test skips itself when the runner has no physical output available, and
  restores the previous toggle state so runs stay repeatable.

## Reading a failure without downloading anything

The CI job runs `scripts/testing/regressionDigest.js`, which prints failing spec names and their
first error lines as plain text into the job log **and the run's Summary page**. A screenshot of
the Summary is enough to diagnose a failure — no artifact download or unzip required. The full
HTML report, traces, screenshots and video are still uploaded as `regression-report-<os>`.

## Status

**Blocking gate as of run #9.** All 10 specs pass on `windows-2022` and `macos-latest`, both jobs
green, both report artifacts uploaded. A failing regression spec now fails the Validation run.

A full Electron run still cannot be executed in the authoring workspace (no display, no browser
system libraries), so CI remains the source of truth for these specs.

How the job reports failure:

- the spec step keeps `continue-on-error` so the digest, artifact upload and step-outcome table
  still run when specs fail;
- the final `Mark job failed if regression failed` step restores the true exit status;
- the diagnostics **upload** stays non-fatal deliberately — a report-upload problem is not a
  product regression (this was the cause of a red macOS job in run #8 while all specs passed).

`skipped=1` is expected: the audience-output toggle test skips when the runner has no physical
output. `flaky=1` means a spec needed a retry; CI allows 2 retries. `svelte-check` remains advisory
because of a pre-existing type backlog unrelated to these specs.
