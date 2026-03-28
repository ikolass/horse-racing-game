---
phase: 01-foundation
plan: 02
subsystem: vuex-store
tags: [vuex4, store, horses, schedule, race, results, state-machine]
dependency_graph:
  requires: [GAME_CONFIG, shuffle, computeFinishOrder]
  provides: [store/horses, store/schedule, store/race, store/results, gamePhase-FSM]
  affects: [Phase 2 UI components, Phase 3 animation, Phase 4 tests]
tech_stack:
  added: [vuex@4.1.0]
  patterns: [Vuex namespaced modules, FSM state machine, rootState cross-module access]
key_files:
  created:
    - src/store/index.js
    - src/store/modules/horses.js
    - src/store/modules/schedule.js
    - src/store/modules/race.js
    - src/store/modules/results.js
  modified:
    - src/main.js
    - package.json
decisions:
  - "20 hand-crafted horse names and manually curated hex colors baked into horses module initial state (D-01, D-06, D-07)"
  - "Each horse has exactly 3 fields: name, color, condition — array index serves as implicit ID (D-02)"
  - "VALID_TRANSITIONS object guards gamePhase FSM — illegal transitions log console.warn and return false"
  - "startRace action is a thin orchestration stub; tick loop is deferred to Phase 3"
metrics:
  duration: "~7 minutes"
  completed: "2026-03-28"
  tasks_completed: 2
  files_created: 5
---

# Phase 1 Plan 2: Vuex Store — 4 Namespaced Modules Summary

**One-liner:** Vuex 4 store with 4 namespaced modules — 20-horse static roster with curated hex colors, schedule generator using GAME_CONFIG+shuffle, gamePhase FSM (IDLE->SCHEDULED->RACING->ROUND_COMPLETE->DONE), and round results accumulator; registered in main.js with npm build passing.

## What Was Built

Five Vuex module files and an updated main.js:

1. **`src/store/modules/horses.js`** — Namespaced module with `state.list` of exactly 20 horse objects. Each object carries exactly 3 fields (D-02): `name` (string), `color` (hex string), `condition` (integer 1-100). Names are hand-crafted racing-themed strings (D-01). Colors are 20 manually curated hex values spread across the hue wheel (D-06, D-07) — inline in each object, no separate palette constant. Getters: `allHorses`, `horseByIndex`.

2. **`src/store/modules/schedule.js`** — Namespaced module that generates 6 race rounds. `generateSchedule` action imports `GAME_CONFIG` (no raw numbers 6 or 10) and `shuffle` from Phase 1 utilities. Uses `rootState.horses.list` for horse indices. Mutations: `SET_ROUNDS`, `CLEAR_SCHEDULE`. Getters: `allRounds`, `roundByNumber`.

3. **`src/store/modules/race.js`** — Namespaced module implementing the gamePhase state machine. `VALID_TRANSITIONS` object enforces legal paths: IDLE->SCHEDULED->RACING->ROUND_COMPLETE->DONE->IDLE (ROUND_COMPLETE also allows DONE branch). `transitionTo` action validates and warns on illegal attempts. `startRace` action is a Phase 3 stub (dispatches transition, sets round to 1). State fields: `gamePhase`, `currentRound`, `positions`, `intervalId`. Getters: `gamePhase`, `currentRound`, `isIdle`, `isScheduled`, `isRacing`, `isDone`.

4. **`src/store/modules/results.js`** — Namespaced accumulator module. State: `rounds: []`. Mutations: `ADD_ROUND_RESULT` (push), `CLEAR_RESULTS`. Getters: `allResults`, `resultByRound`, `resultCount`.

5. **`src/store/index.js`** — Root store created with `createStore` combining all 4 namespaced modules.

6. **`src/main.js`** — Updated to register store: `app.use(store)` before `app.mount('#app')`.

## Verification Results

| Check | Result |
|-------|--------|
| `node` verify: horses module (20 horses, unique names/colors, condition range) | PASS |
| `node` verify: race module initial state (IDLE, round 0, empty positions) | PASS |
| `node` verify: results module initial state (empty rounds array) | PASS |
| `node` verify: main.js store registration | PASS |
| `npm run build` | PASS — 0 errors, 44 modules transformed |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 54c6ee1 | feat | Install Vuex 4 and create horses + schedule modules |
| b9f6021 | feat | Create race + results modules, register store in main.js |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `startRace` action in `race.js` (lines 43-46): dispatches `transitionTo('RACING')` and sets `currentRound = 1` but has no tick loop. This is intentional — Phase 3 will add the interval-based animation loop. The stub is not a data rendering stub; it does not block any Phase 2 UI goals.

## Self-Check: PASSED
