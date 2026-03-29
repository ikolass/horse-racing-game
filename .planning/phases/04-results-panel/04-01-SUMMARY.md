---
phase: 04-results-panel
plan: "01"
subsystem: store-wiring
tags: [vuex, race-engine, results, state-management]
dependency_graph:
  requires: [03-02]
  provides: [results-data-pipeline]
  affects: [src/store/modules/race.js, src/store/modules/results.js, src/components/GameControls.vue]
tech_stack:
  added: []
  patterns: [cross-module-dispatch-with-root-true, condition-sort-descending]
key_files:
  created: []
  modified:
    - src/store/modules/race.js
    - src/store/modules/results.js
    - src/components/GameControls.vue
decisions:
  - "finishOrder derived by sorting horseIndices by condition descending (b-a) — deterministic, matches race engine speed formula"
  - "results.js actions block added (addRoundResult + clearResults) — required so dispatch resolves to mutations in namespaced module"
metrics:
  duration: "~2 min"
  completed: "2026-03-29"
  tasks: 2
  files_modified: 3
requirements: [RESULT-01, RESULT-02]
---

# Phase 4 Plan 1: Race Engine Results Wiring Summary

**One-liner:** Cross-module Vuex wiring so `onRoundComplete` dispatches `results/addRoundResult` with condition-sorted `finishOrder`, and `Generate` clears prior results via `results/clearResults`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend onRoundComplete to derive finish order and dispatch results | e80e714 | src/store/modules/race.js, src/store/modules/results.js |
| 2 | Add results/clearResults dispatch to GameControls Generate handler | 098b720 | src/components/GameControls.vue |

## What Was Built

### Task 1: onRoundComplete results dispatch

Modified `onRoundComplete` in `race.js`:
- Extended destructured parameters to include `rootState` and `rootGetters`
- Looks up the current round via `rootGetters['schedule/roundByNumber'](state.currentRound)`
- Sorts `round.horseIndices` by `condition` descending to produce `finishOrder` (highest condition = index 0 = 1st place)
- Dispatches `results/addRoundResult` with `{ roundNumber, distance, finishOrder }` using `{ root: true }` for cross-module dispatch
- The existing `setTimeout` auto-advance block is unchanged

### Task 2: Generate clears previous results

Added `store.dispatch('results/clearResults')` as the third call in `handleGenerate()` in `GameControls.vue`. This resets `results.rounds` to `[]` before a new schedule is generated, preventing stale results from accumulating.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added actions block to results.js**
- **Found during:** Task 1 (pre-implementation read)
- **Issue:** `results.js` had only mutations (`ADD_ROUND_RESULT`, `CLEAR_RESULTS`) but no `actions` block. Vuex namespaced `dispatch` calls (`dispatch('results/addRoundResult', ..., { root: true })` from race.js and `store.dispatch('results/clearResults')` from GameControls.vue) require named actions to exist — without them, dispatches silently fail or throw warnings.
- **Fix:** Added `actions` block to `results.js` with `addRoundResult({ commit }, result)` delegating to `ADD_ROUND_RESULT` mutation, and `clearResults({ commit })` delegating to `CLEAR_RESULTS` mutation.
- **Files modified:** `src/store/modules/results.js`
- **Commit:** e80e714

## Known Stubs

None — all data flows are fully wired. `results.rounds` will be populated after each round completes.

## Decisions Made

1. **finishOrder sorting direction:** `rootState.horses.list[b].condition - rootState.horses.list[a].condition` (b minus a = descending). Horse with highest condition is at index 0 (1st place). This mirrors the race engine's speed formula where higher condition = faster horse.

2. **results.js actions added:** Rather than dispatching directly to mutations (which is an anti-pattern in Vuex), proper actions are wired so dispatch semantics work correctly across namespaced modules and from components alike.

## Self-Check

Files created/modified:
- src/store/modules/race.js — modified
- src/store/modules/results.js — modified (deviation fix)
- src/components/GameControls.vue — modified

Commits:
- e80e714 — feat(04-01): derive finish order and dispatch results/addRoundResult in onRoundComplete
- 098b720 — feat(04-01): clear results on Generate in GameControls.vue

## Self-Check: PASSED
