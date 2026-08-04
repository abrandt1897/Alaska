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
- `alaska-2026-plan.json` — a saved/exported snapshot of app state
  (`plan`, `budget`, `bookings`, `stops`, `dates`, `tiers`, `budgetTarget`, `booked`).
  It is **not** loaded by the app automatically — it's produced by the
  "Save file" button or the file-connection feature, and can be re-imported
  from within the app. Treat it as trip data, not app config.

## Running / Testing
- Open `alaska-2026-planner.html` directly in a browser (double-click, or
  `open alaska-2026-planner.html` on macOS). No dev server needed.
- The "Connect file" feature (live save-to-disk) only works in Chromium
  browsers; Safari/Firefox fall back to `localStorage` + manual "Save file" export.
- There are no automated tests or a lint/build pipeline for this project.

## Architecture
Everything lives in `alaska-2026-planner.html`:
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
