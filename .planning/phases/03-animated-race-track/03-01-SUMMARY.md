---
phase: 03-animated-race-track
plan: "01"
subsystem: race-engine
tags: [vuex, tick-loop, animation, game-state, setInterval]
dependency_graph:
  requires: [src/store/modules/schedule.js, src/store/modules/horses.js]
  provides: [race-tick-engine, auto-advance-logic, position-data-for-animation]
  affects: [src/components/RaceTrack.vue (plan 03-02), src/components/ResultsPanel.vue]
tech_stack:
  added: []
  patterns:
    - "module-scope _intervalRef for interval cleanup (not in Vuex state)"
    - "pre-computed condition-weighted speeds before tick loop starts"
    - "spread { ...state.positions } per tick for Vuex 4 reactivity"
    - "setInterval ID stored in Vuex state; actual ref in closure"
key_files:
  created: []
  modified:
    - src/config/gameConfig.js
    - src/store/modules/race.js
    - src/components/GameControls.vue
decisions:
  - "Speed formula: condition / (maxCondition * TICKS_TO_WIN) — winner always reaches 1.0 in exactly 60 ticks"
  - "PAUSE_BETWEEN_ROUNDS_MS: 1500ms between ROUND_COMPLETE and next RACING transition"
  - "Generate button blocked during ROUND_COMPLETE to prevent schedule corruption during auto-advance pause"
  - "No raw magic numbers in race.js — all constants from GAME_CONFIG"
metrics:
  duration: "~2 min"
  completed_date: "2026-03-29"
  tasks_completed: 3
  files_changed: 3
---

# Phase 3 Plan 1: Race Tick Engine Summary

## One-liner

Condition-weighted setInterval tick engine in Vuex drives horse positions 0.0–1.0 at 50ms/tick with 1.5s auto-advance across all 6 rounds.

## What Was Built

Extended `src/store/modules/race.js` with a complete race simulation engine:

- **`runRound`**: Clears previous interval, pre-computes per-horse speeds (`condition / (maxCondition * 60)`), initializes positions to 0, then fires `setInterval` every 50ms. Each tick spreads positions, increments each horse by its speed, clamps to 1.0, commits to store. When all horses reach 1.0, clears interval and dispatches `onRoundComplete`.

- **`onRoundComplete`**: Transitions to `ROUND_COMPLETE`, waits 1500ms, then either transitions to `DONE` (after round 6) or resets positions, increments round counter, transitions to `RACING`, and dispatches `startRoundByNumber`.

- **`startRoundByNumber`**: Looks up round data from `schedule/roundByNumber` getter and dispatches `runRound`.

- **`startRace`** (replaced stub): Transitions to `RACING`, sets round 1, fetches round 1 data, dispatches `runRound`.

Added tick constants to `GAME_CONFIG`: `TICK_INTERVAL_MS: 50`, `TICKS_TO_WIN: 60`, `PAUSE_BETWEEN_ROUNDS_MS: 1500`.

Fixed `GameControls.vue` `generateDisabled` to block during `ROUND_COMPLETE` as well as `RACING`.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add tick constants to GAME_CONFIG | 993c6a9 | src/config/gameConfig.js |
| 2 | Extend race.js with tick loop engine and auto-advance | 5f0df82 | src/store/modules/race.js |
| 3 | Fix GameControls generateDisabled to block during ROUND_COMPLETE | 12096b7 | src/components/GameControls.vue |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all logic is wired to real Vuex state and getters.

## Self-Check: PASSED

- FOUND: src/config/gameConfig.js
- FOUND: src/store/modules/race.js
- FOUND: src/components/GameControls.vue
- FOUND: .planning/phases/03-animated-race-track/03-01-SUMMARY.md
- FOUND commit: 993c6a9
- FOUND commit: 5f0df82
- FOUND commit: 12096b7
