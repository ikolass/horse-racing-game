---
phase: 02-roster-controls-ui
plan: 01
subsystem: ui
tags: [vue3, vuex, css-custom-properties, components, game-ui]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Vuex store modules (horses, schedule, race) with gamePhase FSM and horse data
provides:
  - Game CSS custom properties (dark theme tokens replacing Vite scaffold)
  - 3-column grid layout (20%/55%/25%) on #app
  - HorseRow component (swatch + name + condition badge)
  - HorseRoster component (20 horses from Vuex)
  - GameControls component (Generate/Start buttons with gamePhase gating)
affects: [03-race-track-animation, 05-testing]

# Tech tracking
tech-stack:
  added: []
  patterns: [Vue 3 SFC with script setup, scoped CSS using design tokens, useStore + computed for Vuex reads]

key-files:
  created:
    - src/components/HorseRow.vue
    - src/components/HorseRoster.vue
    - src/components/GameControls.vue
  modified:
    - src/assets/base.css
    - src/assets/main.css

key-decisions:
  - "CSS custom properties token names: --color-bg-dominant, --color-accent, --color-badge-bg etc. (game theme, no scaffold tokens)"
  - "GameControls dispatches TWO actions on Generate: schedule/generateSchedule + race/transitionTo('SCHEDULED') because generateSchedule does not transition FSM"
  - "startDisabled covers IDLE, RACING, DONE; generateDisabled covers only RACING — matches UI-SPEC state/phase matrix exactly"

patterns-established:
  - "Vue SFC pattern: script setup + useStore() + computed() for all Vuex getter reads"
  - "data-testid attributes on all interactive/list elements for Phase 5 Playwright selectors"
  - "CSS tokens from base.css used directly in scoped component styles (no local token re-declarations)"

requirements-completed: [ROST-01, ROST-02, SCHED-01, SCHED-02, SCHED-03, SCHED-04, RACE-01, RACE-04]

# Metrics
duration: 2min
completed: 2026-03-28
---

# Phase 2 Plan 01: Roster Controls UI — CSS Tokens + Leaf Components Summary

**Game dark-theme CSS tokens (9 color + 5 spacing + 5 typography) replacing Vite scaffold, 3-column grid on #app, and three Vue 3 SFCs: HorseRow (swatch/name/badge), HorseRoster (20 horses from Vuex), GameControls (Generate/Start with FSM-gated disabled states)**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-28T16:45:25Z
- **Completed:** 2026-03-28T16:47:03Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Replaced all `--vt-c-*` Vite scaffold tokens with game-specific CSS custom properties in base.css (9 color tokens, 5 spacing tokens, 5 typography tokens)
- Replaced main.css scaffold layout with `display: grid; grid-template-columns: 20% 55% 25%;` on `#app` for the 3-column game layout
- Created HorseRow.vue rendering a 12x12px color swatch, horse name (flex-grow), and condition score badge — all wired to `horse.color`, `horse.name`, `horse.condition` props
- Created HorseRoster.vue reading all 20 horses from Vuex `horses/allHorses` getter and rendering a HorseRow per horse with `v-for`
- Created GameControls.vue with Generate and Start buttons — Generate dispatches both `schedule/generateSchedule` AND `race/transitionTo('SCHEDULED')` (FSM requires two dispatches); Start dispatches `race/startRace`; both buttons disabled per the SCHED-04/RACE-04 state matrix

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace Vite scaffold CSS with game design tokens** - `b75579b` (feat)
2. **Task 2: Create HorseRow and HorseRoster components** - `39a9136` (feat)
3. **Task 3: Create GameControls component with gamePhase gating** - `07a8e3e` (feat)

## Files Created/Modified

- `src/assets/base.css` - Game CSS custom properties replacing all Vite `--vt-c-*` tokens
- `src/assets/main.css` - App-level 3-column grid layout (20%/55%/25%) on `#app`
- `src/components/HorseRow.vue` - Single horse row: color swatch + name + condition badge
- `src/components/HorseRoster.vue` - List of 20 HorseRow components from Vuex `horses/allHorses`
- `src/components/GameControls.vue` - Generate/Start buttons with gamePhase-gated disabled states

## Decisions Made

- **Two-dispatch Generate handler**: `schedule/generateSchedule` does not transition the FSM on its own, so `handleGenerate()` explicitly dispatches both `schedule/generateSchedule` and `race/transitionTo('SCHEDULED')`. This matches the interface contract documented in the plan.
- **startDisabled matrix**: IDLE, RACING, and DONE all disable Start; SCHEDULED and ROUND_COMPLETE enable it — exactly matching the UI-SPEC State/Phase Mapping table.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CSS token foundation and leaf components are complete; Plan 02-02 can wire HorseRoster + GameControls into App.vue alongside RaceTrackPlaceholder and ResultsPlaceholder
- All `data-testid` attributes are in place: `btn-generate`, `btn-start`, `horse-roster`, `horse-row-{index}` — ready for Phase 5 Playwright selectors
- No blockers; all Vuex store connections verified against Phase 1 module interfaces

---
*Phase: 02-roster-controls-ui*
*Completed: 2026-03-28*
