---
phase: 03-animated-race-track
plan: 02
subsystem: ui
tags: [vue3, vuex, css-animation, race-track, game-ui]

# Dependency graph
requires:
  - phase: 03-01-animated-race-track
    provides: race tick engine with position state (state.race.positions), gamePhase FSM, currentRound, auto-advance between rounds
  - phase: 02-animated-race-track
    provides: App.vue 3-column layout, CSS design tokens, RaceTrackPlaceholder slot
provides:
  - RaceTrack.vue — 10-lane animated race track driven by Vuex positions state with CSS left-transition
  - App.vue updated to import and render RaceTrack in center column
  - Visual confirmation of smooth animation, round header, finish line, condition badges, empty/idle state, and 6-round auto-advance
affects:
  - 04-results-panel (center column layout is now live; results panel is right column)
  - 05-tests (data-testid attributes race-track, round-header, lane-{idx}, marker-{idx}, finish-line are the Playwright selectors)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Presentational Vue 3 SFC with script setup — all state from Vuex, no local state, no dispatched actions
    - CSS transition on `left` property (45ms linear) — strictly less than tick interval (50ms) to prevent stutter
    - positionPercent(idx) helper maps 0.0–1.0 Vuex float to CSS percentage string with ?? 0 guard
    - .horse-marker is child of .track-area (not .lane) so left: 0%–100% maps to track area only, not label
    - data-testid contract: race-track, round-header, lane-{horseIndex}, marker-{horseIndex}, finish-line

key-files:
  created:
    - src/components/RaceTrack.vue
  modified:
    - src/App.vue

key-decisions:
  - "transition: left 45ms linear (NOT transition: all) — avoids animating layout/color changes; 45ms < 50ms tick interval guarantees smooth motion"
  - "Marker is child of .track-area, not .lane — ensures left: 0%-100% scopes to the track area only, keeping label column fixed"
  - "Start Race button also disabled during ROUND_COMPLETE (not just RACING) — prevents double-start during the 1.5s pause between rounds"
  - "Horse markers remain visible at finish line position (left: 100%) during ROUND_COMPLETE pause — do not reset to 0 until next round begins"

patterns-established:
  - "Presentational Vue SFC pattern: all data from Vuex, zero local state, zero dispatched actions"
  - "Design-token-only CSS: no hardcoded hex anywhere in RaceTrack.vue — all colors via var(--token)"
  - "Bug fix: ROUND_COMPLETE state also blocks Start Race button, matching RACING behavior"

requirements-completed: [ANIM-01, ANIM-02, ANIM-03, ROST-03, RACE-02]

# Metrics
duration: ~15min
completed: 2026-03-29
---

# Phase 3 Plan 02: Animated Race Track — RaceTrack.vue Summary

**RaceTrack.vue Vue 3 SFC with 10 CSS-animated horse lanes driven by Vuex positions, round header, finish line, condition badges, and empty/idle state — visual race flow confirmed across all 6 auto-advancing rounds**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-29
- **Completed:** 2026-03-29
- **Tasks:** 3 (including 1 human-verify checkpoint, approved)
- **Files modified:** 2

## Accomplishments

- Created RaceTrack.vue as a pure presentational SFC — 10 lanes rendered via v-for, each with a fixed 120px label column (swatch + name) and a relative track-area where .horse-marker animates left via CSS transition
- Swapped RaceTrackPlaceholder for RaceTrack in App.vue center column
- User visually verified smooth animation, higher-condition horses moving faster, condition badges, round header, finish line, empty state, and 6-round auto-advance — all confirmed working

## Task Commits

1. **Task 1: Create RaceTrack.vue component** - `208512d` (feat)
2. **Task 2: Swap RaceTrackPlaceholder for RaceTrack in App.vue** - `12c66f9` (feat)
3. **Bug fix: disable Start during ROUND_COMPLETE; markers stay at finish** - `6920673` (fix)
4. **Task 3: Human verification** - APPROVED (no commit; checkpoint outcome)

## Files Created/Modified

- `src/components/RaceTrack.vue` — Complete race track UI: round header, 10 animated lanes, finish line, empty state; purely presentational, all data from Vuex
- `src/App.vue` — Imports RaceTrack instead of RaceTrackPlaceholder; no other changes

## Decisions Made

- `transition: left 45ms linear` instead of `transition: all` — prevents animating unintended CSS properties; 45ms is strictly less than the 50ms tick interval to guarantee smooth motion
- `.horse-marker` is a child of `.track-area` (not `.lane`) so the `left` percentage scopes to the track area, keeping the 120px label column fixed and layout-stable
- `Start Race` button is also disabled during `ROUND_COMPLETE` (not just `RACING`) — discovered post-task-2 that users could click Start during the 1.5s pause and trigger a double-start
- Horse markers remain at finish-line position (`left: 100%`) during `ROUND_COMPLETE` pause rather than resetting — provides clear visual feedback that the round is complete before markers snap back

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Start Race button not disabled during ROUND_COMPLETE state**
- **Found during:** Post-Task 2 (visual verification prep)
- **Issue:** GameControls only disabled Start for IDLE and RACING — ROUND_COMPLETE was unguarded, allowing a double-start click during the 1.5s auto-advance pause
- **Fix:** Added ROUND_COMPLETE to the `startDisabled` computed condition in GameControls.vue; horse markers kept at left: 100% (finish position) during ROUND_COMPLETE instead of resetting to 0 prematurely
- **Files modified:** src/components/GameControls.vue, src/components/RaceTrack.vue (marker left guard)
- **Verification:** Start button confirmed disabled during inter-round pause; markers visible at finish line during pause
- **Committed in:** `6920673`

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Fix was necessary for correct game flow — without it users could corrupt race state during the auto-advance pause. No scope creep.

## Issues Encountered

None beyond the auto-fixed bug above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 3 is fully complete: tick engine (03-01) + animated race track (03-02) both done
- Phase 4 (Results Panel) can begin: the results module exists in Vuex with COMMIT_RESULTS mutation; ResultsPlaceholder is the right-column target to replace
- Playwright selectors ready: data-testid attributes `race-track`, `round-header`, `lane-{idx}`, `marker-{idx}`, `finish-line` are all wired
- No blockers

---
*Phase: 03-animated-race-track*
*Completed: 2026-03-29*
