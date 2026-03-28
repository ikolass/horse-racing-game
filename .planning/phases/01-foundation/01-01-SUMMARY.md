---
phase: 01-foundation
plan: 01
subsystem: core-utilities
tags: [game-config, shuffle, race-engine, pure-functions, esm]
dependency_graph:
  requires: []
  provides: [GAME_CONFIG, shuffle, computeFinishOrder]
  affects: [01-02 Vuex store modules, all subsequent phases]
tech_stack:
  added: [vitest]
  patterns: [Fisher-Yates shuffle, weighted-random selection without replacement]
key_files:
  created:
    - src/config/gameConfig.js
    - src/utils/shuffle.js
    - src/utils/raceEngine.js
    - src/utils/__tests__/raceEngine.test.js
  modified: []
decisions:
  - "Linear weighting (D-03): weight = raw condition score; horse with 80 is twice as likely to place before horse with 40"
  - "No randomness floor (D-04): a horse with condition 1 can still win; no minimum base weight added"
  - "GAME_CONFIG scope (D-05): 4 keys only — animation/tick constants deferred to Phase 3"
  - "GAME_CONFIG frozen with Object.freeze() including the ROUND_DISTANCES array"
metrics:
  duration: "~8 minutes"
  completed: "2026-03-28"
  tasks_completed: 2
  files_created: 4
---

# Phase 1 Plan 1: GAME_CONFIG + Shuffle + Race Engine Summary

**One-liner:** Pure ESM utility foundation — frozen GAME_CONFIG with 4 constants, non-mutating Fisher-Yates shuffle, and weighted-random race engine using linear condition scoring without a randomness floor.

## What Was Built

Three pure JavaScript ES module files with no Vue/Vuex dependencies:

1. **`src/config/gameConfig.js`** — Frozen GAME_CONFIG object with exactly 4 keys: `TOTAL_HORSES: 20`, `HORSES_PER_ROUND: 10`, `TOTAL_ROUNDS: 6`, `ROUND_DISTANCES: [1200, 1400, 1600, 1800, 2000, 2200]`. Both the outer object and ROUND_DISTANCES array are frozen. No animation/tick constants (deferred to Phase 3 per D-05).

2. **`src/utils/shuffle.js`** — Fisher-Yates shuffle that returns a new array (`const result = [...array]`) without mutating the input.

3. **`src/utils/raceEngine.js`** — `computeFinishOrder(horses)` using weighted selection without replacement. Weight = raw condition score (linear, per D-03). No minimum base weight (D-04). In 200 trials with a 95-condition vs. 5-condition horse, the higher-condition horse won first place 188/200 times (94%).

4. **`src/utils/__tests__/raceEngine.test.js`** — Vitest test suite covering: result length, all indices present exactly once, empty input, and the >60% statistical win rate requirement.

## Verification Results

| Check | Result |
|-------|--------|
| `node` verify: gameConfig + shuffle | PASS |
| `node` verify: raceEngine (200 trials) | PASS — 188/200 wins (94%) |
| Vitest unit tests (4 tests) | All 4 passed |
| No Vue/Vuex imports in utility files | Confirmed |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 05e51f6 | feat | GAME_CONFIG and shuffle utility |
| fadd579 | test | Failing test for computeFinishOrder (RED) |
| 01eda35 | feat | computeFinishOrder weighted-random race engine (GREEN) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed vitest as dev dependency**
- **Found during:** Task 2 (TDD setup)
- **Issue:** Vitest was not installed; plan assumes test infrastructure but doesn't explicitly install it
- **Fix:** `npm install --save-dev vitest` before writing tests
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** fadd579

None other — plan executed exactly as written.

## Known Stubs

None. All exported symbols are fully implemented pure functions.

## Self-Check: PASSED
