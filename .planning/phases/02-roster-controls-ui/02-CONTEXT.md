# Phase 2: Roster + Controls UI - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the game's UI shell: a 20-horse roster panel (name, color swatch, condition score per horse) and Generate/Start buttons correctly gated by `gamePhase`. No animation, no results panel, no schedule preview in the UI — the schedule only needs to be verifiable in Vuex devtools.

</domain>

<decisions>
## Implementation Decisions

### App Layout
- **D-01:** Three-column layout — roster left (~20% width), race track center (~55%), results right (~25%). All three columns are defined in Phase 2 but only the roster column is populated; center and right render as empty placeholders for Phases 3 and 4.

### Roster Display Format
- **D-02:** Claude's discretion — optimize for a narrow (~20%) column containing 20 items. Compact rows are likely the right call (all 20 horses visible without scrolling, data-focused). Claude picks the specific treatment for color swatch, condition score display, and row styling.

### Controls Placement
- **D-03:** Not discussed — Claude's discretion. Generate and Start buttons should be clearly associated with the roster/left column area since they control game flow. Placement above or below the roster is acceptable.

### Disabled State Feedback
- **D-04:** Not discussed — Claude's discretion. Standard visual treatment (grayed/reduced opacity) is fine. No tooltip required for Phase 2.

### Schedule Preview
- **D-05:** Not in Phase 2 scope. Success criteria requires only Vuex devtools visibility after Generate is clicked. No schedule summary or round list in the UI.

### Claude's Discretion
- Roster row design: exact swatch shape/size, condition score presentation (badge, number, progress bar), row hover state
- Controls placement: above vs below roster, button sizing and styling
- Disabled button visual treatment
- Column border/divider styling between the three layout columns
- Global CSS reset/base styles approach

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Phase 2 covers: ROST-01, ROST-02, SCHED-01, SCHED-02, SCHED-03, SCHED-04, RACE-01, RACE-04

### Roadmap
- `.planning/ROADMAP.md` — Phase 2 success criteria (4 acceptance criteria: roster visible with name/swatch/condition, Generate creates schedule in devtools, button gating by gamePhase, Start transitions to RACING)

### Project
- `.planning/PROJECT.md` — Tech stack (Vue 3 + Vuex 4 + Vite), desktop web only, out-of-scope items

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/store/modules/horses.js` — `allHorses` getter returns the full list of 20 horse objects (`{ name, color, condition }`). Roster component reads directly from this getter.
- `src/store/modules/schedule.js` — `generateSchedule` action is already implemented and wired. Generate button just dispatches `schedule/generateSchedule`.
- `src/store/modules/race.js` — `startRace` action dispatches `transitionTo('RACING')` and sets `currentRound: 1`. Start button dispatches `race/startRace`.
- `src/store/getters` — `race/gamePhase`, `race/isIdle`, `race/isScheduled`, `race/isRacing`, `race/isDone` all available for button gating.

### Established Patterns
- `src/App.vue` needs full replacement — currently renders Vite scaffold (HelloWorld + TheWelcome)
- Store uses namespaced modules (`horses/`, `schedule/`, `race/`, `results/`) — component `mapGetters`/`mapActions` must use namespace prefixes
- Horse array index = implicit horse ID (D-02 from Phase 1 context)
- Colors are hex strings inline in each horse object (`horse.color`)

### Integration Points
- `src/App.vue` — replace scaffold template with three-column game layout
- New components connect to Vuex via `useStore()` (Composition API) or `mapGetters`/`mapActions` (Options API)
- Generate button: `dispatch('schedule/generateSchedule')`
- Start button: `dispatch('race/startRace')`
- Button disabled logic: Generate disabled when `gamePhase === 'RACING'`; Start disabled when `gamePhase === 'IDLE' || gamePhase === 'RACING'`

</code_context>

<specifics>
## Specific Ideas

- No specific visual references — open to standard, clean game UI approaches.

</specifics>

<deferred>
## Deferred Ideas

- **Schedule preview in UI** — user did not request this; deferred to later phases if needed
- **Roster card grid format** — discussed and deferred to Claude's discretion (compact rows preferred for narrow column)
- **Color/condition presentation details** — deferred to Claude's discretion
- **Controls UI specifics** — deferred to Claude's discretion

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-roster-controls-ui*
*Context gathered: 2026-03-28*
