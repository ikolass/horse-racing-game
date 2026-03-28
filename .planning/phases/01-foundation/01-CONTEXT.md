# Phase 1: Foundation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the Vuex store with all 4 modules (horses, schedule, race, results), the GAME_CONFIG constants object, and the pure utility functions (shuffle + race engine). No UI is built in this phase — it is the data layer that every subsequent phase builds on.

</domain>

<decisions>
## Implementation Decisions

### Horse Data Design
- **D-01:** Horse names are a predefined list of 20 hand-crafted names baked into the store initial state (e.g. racing-themed names like "Thunder", "Eclipse", "Storm"). No runtime generation.
- **D-02:** Each horse object carries exactly three fields: `name`, `color`, `condition`. No explicit `id` or `slug` field — array index serves as the implicit ID where needed.

### Race Engine Weighting
- **D-03:** Linear weighting — each horse's weight equals its raw condition score. A horse with condition 80 is twice as likely to finish ahead of one with condition 40.
- **D-04:** No randomness floor — pure weighted random. A horse with condition 1 can still win, just very rarely. No minimum base weight is added.

### GAME_CONFIG Scope
- **D-05:** GAME_CONFIG contains core game rules only: `TOTAL_HORSES: 20`, `HORSES_PER_ROUND: 10`, `TOTAL_ROUNDS: 6`, `ROUND_DISTANCES: [1200, 1400, 1600, 1800, 2000, 2200]`. Animation/tick constants (tick interval, CSS transition duration) are deferred to Phase 3 — they will live in a separate config or be defined where Phase 3 needs them.

### Color Palette
- **D-06:** 20 manually curated hex values, spread across the hue wheel with deliberate lightness and saturation variation to ensure all colors are visually distinguishable. STATE.md flagged that algorithmic HSL generation produces indistinguishable adjacent hues — hand-picking avoids this.
- **D-07:** Colors live inline in each horse object as a `color` field (hex string). No separate color palette constant or lookup array.

### Claude's Discretion
- Specific 20 horse names (racing-themed — Claude picks)
- Specific 20 hex color values (visually distinct across hue wheel — Claude picks)
- Store module file structure / folder organization
- Whether `raceEngine.js` uses a weighted shuffle or a weighted sort-by-score approach to determine finish order

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Full v1 requirement list; Phase 1 covers STATE-01, STATE-02, STATE-03, ROST-01, ROST-02, RACE-02

### Roadmap
- `.planning/ROADMAP.md` — Phase 1 success criteria (5 acceptance criteria including: store initializes without errors, 20 horses in state, gamePhase state machine transitions, raceEngine weighted-random, GAME_CONFIG with no raw numbers in modules)

### Project
- `.planning/PROJECT.md` — Tech stack constraints (Vue 3 + Vuex 4 + Vite required by assessment), out-of-scope items

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None relevant — Vue 3 + Vite scaffold only. No existing components, hooks, or utilities applicable to Phase 1.

### Established Patterns
- `src/main.js` uses `createApp(App).mount('#app')` — Vuex store will be registered here via `app.use(store)`
- ESM (`"type": "module"` in package.json) — store files should use `export default` / named exports

### Integration Points
- `src/main.js` — where the Vuex store gets registered into the Vue app
- Vuex 4 is **not yet installed** — `npm install vuex@4` (or `vuex@next`) required as the first step

</code_context>

<specifics>
## Specific Ideas

- No specific references or "I want it like X" moments from discussion — open to standard Vuex 4 patterns.

</specifics>

<deferred>
## Deferred Ideas

- Tick interval (`TICK_INTERVAL_MS: 200`) and CSS transition duration (`CSS_TRANSITION_MS: 180`) noted in STATE.md — deferred to Phase 3, not in Phase 1 GAME_CONFIG
- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-28*
