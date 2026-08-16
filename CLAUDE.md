# Alaska 2026 Trip Planner

## Overview
A single-file, client-only trip planner for a 14–23 Aug 2026 Alaska trip
(Anchorage → Seward → Palmer → Talkeetna → Healy/Denali → Anchorage).
Renders a day-by-day itinerary, a budget tracker, a bookings checklist, and
a Leaflet map of stops. No backend, no build step — open the HTML file in a
browser.

## Tech Stack
- Plain HTML/CSS/JS (`alaska-2026-planner.html`), no framework, no bundler
- Map: Leaflet 1.9.4 via CDN
- Fonts: Google Fonts (Archivo, IBM Plex Sans/Mono) via CDN
- Persistence: `localStorage` autosave, plus optional live sync to a local
  file via the File System Access API (Chrome/Edge only — `showSaveFilePicker`)
- IndexedDB is used only to remember the connected file handle across reloads

## Files
- `alaska-2026-planner.html` — the entire app (markup, styles, and JS in one file)
- `utils.js` — pure, side-effect-free helpers (`money`, `esc`, `groupCatFor`,
  `budgetTotals`, `gaugePercent`, `budgetVerdict`, `buildRouteUrl`) shared
  between the app and the test suite. Loaded as a plain `<script src="utils.js">`
  before the inline script (no bundler, no module system) — its top-level
  `function` declarations land in the same global scope the inline script
  runs in, so it works exactly like the code used to when it lived inline.
  It also has a CommonJS `module.exports` guard so Node/Vitest can `require`/
  `import` it directly.
- `alaska-2026-plan.json` — a saved/exported snapshot of app state
  (`plan`, `budget`, `bookings`, `stops`, `dates`, `tiers`, `budgetTarget`, `booked`).
  It is **not** loaded by the app automatically — it's produced by the
  "Save file" button or the file-connection feature, and can be re-imported
  from within the app. Treat it as trip data, not app config.

## Running / Testing
- Open `alaska-2026-planner.html` directly in a browser (double-click, or
  `open alaska-2026-planner.html` on macOS). No dev server needed — `utils.js`
  loads alongside it via a relative `<script src>`.
- The "Connect file" feature (live save-to-disk) only works in Chromium
  browsers; Safari/Firefox fall back to `localStorage` + manual "Save file" export.
- Dev tooling (Node/npm only — the app itself still needs no build step):
  - `npm install` once to pull in ESLint, Prettier, and Vitest.
  - `npm run lint` — ESLint (flat config in `eslint.config.js`), via
    `eslint-plugin-html` for the inline `<script>` blocks in the HTML files.
  - `npm run format` / `npm run format:check` — Prettier over `*.html`,
    `*.js`, and `*.json` (see `.prettierignore` for exclusions).
  - `npm test` / `npm run test:watch` — Vitest unit tests in `tests/`,
    covering the pure helpers in `utils.js` (`tests/utils.test.js`).
  - `npm run test:coverage` — the same tests with a v8 coverage report
    (text summary + `coverage/` HTML/lcov output, gitignored). Coverage is
    scoped to `utils.js` only (see `vitest.config.js`) and enforces an 80%
    threshold (the Istanbul/nyc default); CI uploads the report as a build
    artifact.
  - There is no unit coverage for the DOM-driving code inside the inline
    `<script>` block (rendering, persistence, map) — only the extracted
    pure helpers are tested. Manually verify UI changes in a browser.
- CI (`.github/workflows/ci.yml`) runs lint, format:check, and test:coverage
  on every push and pull request. The same three checks also run locally as
  a pre-push git hook (`.githooks/pre-push`), auto-installed by `npm install`
  via the `prepare` script (`git config core.hooksPath .githooks`).

## Architecture
Almost everything lives in `alaska-2026-planner.html`; a handful of pure
helpers live in `utils.js` (see Files above) purely so they're unit-testable:
- Seed data (`DATES0`, `PLAN0`, and similar `*0` constants) near the top of
  the `<script>` block defines the default itinerary/budget/stops if no
  saved state exists.
- Mutable app state (`plan`, `budget`, `bookings`, `stops`, `dates`, `tiers`,
  `budgetTarget`, `booked`) is loaded from a connected file or `localStorage`
  on startup, edited in place through the UI, and persisted back via
  `writeToFile()` / `localStorage.setItem` and the export button.
- The map (Leaflet) is rebuilt via `refreshMap()`; there's a guarded
  workaround for a Leaflet animation-callback crash on rapid re-renders —
  don't remove the guard without understanding why it's there.

## Editing notes
- Since this is one large file (~1700 lines), when editing keep changes
  scoped to the relevant section (styles / seed data / persistence / render
  logic) rather than reflowing unrelated parts.
- Trip content changes (itinerary text, prices, timings) belong in the
  `*0` seed constants, not in `alaska-2026-plan.json` — that file is just a
  snapshot users generate from the running app.
