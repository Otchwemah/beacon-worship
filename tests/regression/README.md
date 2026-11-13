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
- dropdowns are `.dropdownElem` with `[role="option"]` entries
- the audience output toggle is `#output_window_button` and carries an `on`/`off` class

## Runner notes

- **Do not** point Playwright at `src/**/*.test.ts`. Those are vitest unit suites. This config
  uses `tests/regression/**/*.regression.ts` so the two runners never collide. (The original
  config used `testDir: "."` + `**/*.test.ts`, which did collide.)
- One Electron instance at a time (`workers: 1`) to avoid port/store conflicts.
- CI runs Windows first, then macOS, per the project's Windows-first requirement.
- The audience-output test skips itself when the runner has no physical output available, and
  restores the previous toggle state so runs stay repeatable.

## Status

The specs are listed/compiled-checked, but a full Electron run has **not** been executed in the
authoring workspace (no display and no browser system libraries there). The first real execution
happens in the Validation workflow's `regression` job. That job is **advisory
(`continue-on-error`) until it has a confirmed green run**, after which it should be flipped to
blocking.
