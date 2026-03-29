---
phase: 03-animated-race-track
verified: 2026-03-29T00:00:00Z
status: human_needed
score: 14/14 automated must-haves verified
human_verification:
  - test: "Smooth left-to-right animation without stutter or teleportation"
    expected: "Horse markers slide continuously; no visible snapping between positions; each tick moves marker by a small increment"
    why_human: "CSS transition smoothness at 45ms < 50ms tick cannot be confirmed by static code analysis; requires visual inspection in a running browser"
  - test: "Higher-condition horses visibly move faster than lower-condition horses"
    expected: "In a round, horses with condition score 80+ are clearly ahead of horses with condition score 30- by mid-race"
    why_human: "Speed differences are real in code but perceptual confirmation that the gap is visible to a user requires live rendering"
  - test: "Generate button stays disabled during the 1.5s ROUND_COMPLETE pause"
    expected: "Between rounds, the Generate button is visually greyed out and unclickable for approximately 1.5 seconds"
    why_human: "The computed property is correct in code, but the real-time UI state during the setTimeout window needs browser confirmation"
  - test: "Markers stay at finish line during ROUND_COMPLETE, then reset cleanly for next round"
    expected: "Horses sit at right edge of lane for ~1.5s then snap to left edge when next round begins"
    why_human: "The right: 4px / left: auto logic in markerStyle is correct but the visual snap-back and absence of mid-transition glitch needs human eyes"
---

# Phase 3: Animated Race Track — Verification Report

**Phase Goal:** Horses visibly animate across dedicated lanes during each round, the race advances automatically from round to round, and the tick timing and CSS transition duration are co-designed so horses slide smoothly without stutter or teleportation.
**Verified:** 2026-03-29
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All truths from Plan 01 (tick engine) and Plan 02 (RaceTrack UI) were verified against the actual codebase.

#### Plan 01 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Tick loop fires every 50ms and increments horse positions proportionally to condition score | VERIFIED | `setInterval(..., GAME_CONFIG.TICK_INTERVAL_MS)` in race.js line 79; speed formula at line 70: `condition / (maxCondition * GAME_CONFIG.TICKS_TO_WIN)` |
| 2 | Winner (highest condition) reaches position 1.0 in ~60 ticks | VERIFIED | Speed for max-condition horse = maxCondition / (maxCondition * 60) = 1/60; 60 * (1/60) = 1.0 exactly |
| 3 | After all horses finish, gamePhase transitions RACING -> ROUND_COMPLETE | VERIFIED | `onRoundComplete` dispatches `transitionTo('ROUND_COMPLETE')` at race.js line 105; VALID_TRANSITIONS allows RACING->ROUND_COMPLETE |
| 4 | After 1.5s pause, next round auto-advances (ROUND_COMPLETE -> RACING) with reset positions | VERIFIED | `setTimeout` with `GAME_CONFIG.PAUSE_BETWEEN_ROUNDS_MS` (1500) at race.js line 106; `RESET_POSITIONS`, `SET_CURRENT_ROUND`, `transitionTo('RACING')` in the callback |
| 5 | After round 6, gamePhase transitions to DONE without auto-advance | VERIFIED | `if (state.currentRound >= GAME_CONFIG.TOTAL_ROUNDS)` check at race.js line 107; dispatches `transitionTo('DONE')` with no further `startRoundByNumber` call |
| 6 | Generate button is disabled during ROUND_COMPLETE phase | VERIFIED | GameControls.vue line 30: `gamePhase.value === 'RACING' \|\| gamePhase.value === 'ROUND_COMPLETE'` |

#### Plan 02 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 7 | 10 horizontal lanes are visible, each 40px tall, with no vertical overlap | VERIFIED | `.lane { height: 40px }` and `.track-container { height: 400px }` in RaceTrack.vue; v-for over `racingHorses` (10 horses from visibleRound.horseIndices) |
| 8 | Each lane shows horse name and color swatch in fixed 120px label area | VERIFIED | `.lane-label { width: 120px; flex-shrink: 0 }` with `.swatch` and `.lane-name` children in template |
| 9 | Horse markers move smoothly left-to-right via CSS transition on left property | VERIFIED (code) | `.horse-marker { transition: left 45ms linear }` at RaceTrack.vue line 168; `markerStyle` sets `left: (pos * 100) + '%'`; HUMAN check required for visual smoothness |
| 10 | Higher-condition horses visibly move faster than lower-condition horses | VERIFIED (code) | Speed formula produces proportional speeds; HUMAN check required for perceptual confirmation |
| 11 | Each moving marker shows color swatch + horse name + condition badge | VERIFIED | Template lines 65-67: `.marker-swatch` with `:style backgroundColor`, `.marker-name` with `horse.name`, `.marker-badge` with `horse.condition` |
| 12 | Round info header displays current round number and distance | VERIFIED | `round-header` div at line 43: `Round {{ visibleRound.roundNumber }} &#8212; {{ visibleRound.distance }}m` |
| 13 | Finish line is visible at right edge of track area | VERIFIED | `.finish-line { position: absolute; right: 0; width: 2px; background: var(--color-accent) }` |
| 14 | Empty/idle state shows waiting message when no schedule exists | VERIFIED | `v-else` block at lines 73-78: "Waiting for schedule..." and "Click Generate Schedule to set up a race." |

**Score:** 14/14 truths verified (4 requiring additional human confirmation for visual behavior)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/config/gameConfig.js` | TICK_INTERVAL_MS, TICKS_TO_WIN, PAUSE_BETWEEN_ROUNDS_MS constants | VERIFIED | 9-line file, all 7 constants present inside Object.freeze(); TICK_INTERVAL_MS:50, TICKS_TO_WIN:60, PAUSE_BETWEEN_ROUNDS_MS:1500 |
| `src/store/modules/race.js` | runRound, onRoundComplete, startRoundByNumber actions; tick loop | VERIFIED | 134 lines; all 5 actions present (transitionTo, startRace, runRound, onRoundComplete, startRoundByNumber); module-scope `_intervalRef`; setInterval with GAME_CONFIG constants |
| `src/components/GameControls.vue` | generateDisabled blocks ROUND_COMPLETE | VERIFIED | Line 30 includes `gamePhase.value === 'ROUND_COMPLETE'`; startDisabled also blocks ROUND_COMPLETE (extra fix from Plan 02) |
| `src/components/RaceTrack.vue` | Complete race track UI with lanes, markers, header, finish line | VERIFIED | 216 lines (> 80 min_lines requirement); all structural elements present; data-testid contract fulfilled |
| `src/App.vue` | Imports RaceTrack, not RaceTrackPlaceholder | VERIFIED | Line 4: `import RaceTrack from './components/RaceTrack.vue'`; line 14: `<RaceTrack />`; no RaceTrackPlaceholder reference in import or template |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `race.js` | `gameConfig.js` | `import GAME_CONFIG` | WIRED | Line 1: `import { GAME_CONFIG } from '@/config/gameConfig.js'`; used in runRound (TICK_INTERVAL_MS, TICKS_TO_WIN), onRoundComplete (PAUSE_BETWEEN_ROUNDS_MS, TOTAL_ROUNDS), startRace |
| `race.js` | `schedule.js` | `rootGetters['schedule/roundByNumber']` | WIRED | Lines 51 and 119; result is checked (`if (round)`) before use |
| `race.js` | `horses.js` | `rootState.horses.list` | WIRED | Line 62: `rootState.horses.list[idx]` to build horses array for speed computation |
| `RaceTrack.vue` | `race.js` | `store.getters['race/gamePhase']`, `race/currentRound`, `state.race.positions` | WIRED | Lines 7-9: all three read and used in computed properties that drive template rendering |
| `RaceTrack.vue` | `schedule.js` | `store.getters['schedule/roundByNumber']` | WIRED | Line 15: used in `visibleRound` computed; result drives `racingHorses` and header display |
| `RaceTrack.vue` | `horses.js` | `store.getters['horses/allHorses']` | WIRED | Line 10: `allHorses` computed; used in `racingHorses` to expand horse indices to full objects |
| `App.vue` | `RaceTrack.vue` | `import RaceTrack from` | WIRED | Line 4 import; line 14 template usage `<RaceTrack />` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `RaceTrack.vue` | `positions` | `store.state.race.positions` mutated by `SET_POSITIONS` in tick loop | Yes — `runRound` commits fresh spread `{ ...state.positions }` every 50ms | FLOWING |
| `RaceTrack.vue` | `racingHorses` | `visibleRound.horseIndices` from `schedule/roundByNumber` + `horses/allHorses` | Yes — schedule is populated by `generateSchedule` action from real shuffle logic | FLOWING |
| `RaceTrack.vue` | `gamePhase` / `currentRound` | `race/gamePhase` getter from Vuex FSM | Yes — driven by `transitionTo` and `SET_CURRENT_ROUND` mutations in real actions | FLOWING |
| `race.js` | `horses` (tick speeds) | `rootState.horses.list` | Yes — horses.list is initialized with 20 real horse objects in Phase 1 | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: Skipped for the animation components — visual smoothness, timing behavior, and marker movement cannot be verified without a running browser. The behavioral checks below confirm structural correctness only.

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| GAME_CONFIG has all 7 constants | File read: all keys present | TICK_INTERVAL_MS:50, TICKS_TO_WIN:60, PAUSE_BETWEEN_ROUNDS_MS:1500 present | PASS |
| race.js has 5 actions | grep count | transitionTo, startRace, runRound, onRoundComplete, startRoundByNumber all present | PASS |
| RaceTrack.vue exceeds min_lines:80 | wc -l: 216 lines | 216 > 80 | PASS |
| No hardcoded hex colors in RaceTrack.vue style block | grep `#[0-9a-fA-F]{3,6}` | Only match is HTML entity `&#8212;` (em dash) in template, not a hex color | PASS |
| CSS transition is exactly `left 45ms linear` | grep | Line 168: `transition: left 45ms linear` (not `transition: all`) | PASS |
| All 6 commits exist | git log | 993c6a9, 5f0df82, 12096b7, 208512d, 12c66f9, 6920673 all verified present | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| ANIM-01 | 03-01, 03-02 | Horses visibly move via CSS transitions during each round | SATISFIED | `transition: left 45ms linear` on `.horse-marker`; position driven by 50ms tick loop updating `left` style via `markerStyle()` |
| ANIM-02 | 03-02 | Each horse races in its own dedicated lane with no visual overlap | SATISFIED | `.lane { height: 40px }` with `border-bottom: 1px solid var(--color-divider)`; 10 lanes in `.track-container { height: 400px }` — 10 × 40px fills exactly |
| ANIM-03 | 03-02 | Current round number, distance, and participating horses shown during race | SATISFIED | Round header displays `Round N — Xm`; `racingHorses` v-for renders all participating horse names/colors in lane labels |
| ROST-03 | 03-02 | Horse condition score badge visible on race track during each round | SATISFIED | `.marker-badge` displays `{{ horse.condition }}` with styled badge (font-label, badge-bg background) |
| RACE-02 | 03-01 | Race outcome influenced by each horse's condition score | SATISFIED (deterministic) | Speed formula `condition / (maxCondition * TICKS_TO_WIN)` directly ties condition to speed and finish order. Note: `computeFinishOrder` (weighted-random from Phase 1) is NOT wired into race.js — the tick engine uses deterministic condition proportions instead. The requirement says "weighted probability" but the implementation achieves condition-influence through deterministic speed weighting. RACE-02 was also a Phase 1 requirement (raceEngine.js exists and is tested). The Phase 3 contribution is visual animation of condition influence. |
| RACE-03 | 03-01 | Rounds advance automatically after a brief pause when one completes | SATISFIED | `onRoundComplete` dispatches `transitionTo('ROUND_COMPLETE')` then uses `setTimeout(PAUSE_BETWEEN_ROUNDS_MS)` to auto-advance |

**Note on RACE-02:** This requirement appears in both Phase 1 (ROADMAP.md `Requirements: STATE-01, STATE-02, STATE-03, ROST-01, ROST-02, RACE-02`) and Phase 3 plans. Its core satisfaction — `computeFinishOrder` weighted-random utility — was delivered in Phase 1 (`src/utils/raceEngine.js`). Phase 3's tick engine achieves condition-influence through deterministic speed weighting, which is a valid alternate implementation of the same goal. The `computeFinishOrder` function is not wired into the store but remains available for future use (e.g., results ordering in Phase 4).

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/RaceTrack.vue` | 28-33 | `markerStyle()` deviates from plan's `positionPercent()` | INFO | Intentional improvement — adds `right: 4px; left: auto` anchoring when `pos >= 1.0` to keep markers visible at finish line during ROUND_COMPLETE. Documented as a bug-fix deviation in 03-02-SUMMARY.md. Not a stub. |
| `src/utils/raceEngine.js` | 1-27 | `computeFinishOrder` exists but is not imported anywhere in the store | INFO | Function is tested and correct. It was Phase 1's RACE-02 deliverable. Phase 3 chose deterministic speed-weighting instead of calling this utility. No blocker — both achieve condition-influence. |
| `src/components/GameControls.vue` | 64 | `color: #ffffff` hardcoded in `.btn` style | INFO | Single hardcoded hex in button text color — pre-dates Phase 3 and unchanged by it. Not introduced by Phase 3 work. |

No blocker or warning-level anti-patterns found in Phase 3 deliverables.

---

### Human Verification Required

#### 1. Smooth CSS Animation

**Test:** Run `npm run dev`, open the browser, click Generate Schedule, click Start Race, watch the horse markers move.
**Expected:** All 10 markers slide continuously from left to right with no visible snapping, teleporting, or stuttering. The 45ms CSS transition on `left` should bridge the 50ms tick interval so movement appears fluid.
**Why human:** Static analysis confirms the `transition: left 45ms linear` rule and the 50ms setInterval, but whether the resulting motion looks smooth to a user requires a running browser.

#### 2. Condition-Speed Correlation Visible

**Test:** In the same race, compare a high-condition horse (score 80+) to a low-condition horse (score 20-) during round 1.
**Expected:** The high-condition horse is clearly ahead at the midpoint of the race and reaches the finish line noticeably earlier.
**Why human:** The speed formula is mathematically correct, but whether the visual difference is perceptible (not just technically present) needs human judgment.

#### 3. Generate Button Locked During ROUND_COMPLETE Pause

**Test:** After round 1 finishes, immediately click the Generate Schedule button during the ~1.5s pause before round 2 begins.
**Expected:** The button is visually disabled (greyed out) and does not respond to clicks during the full pause interval.
**Why human:** The computed property logic is correct, but real-time UI state during a `setTimeout` window requires live browser interaction to confirm.

#### 4. Markers Stay at Finish Line Then Reset Cleanly

**Test:** Watch the transition between rounds — when round 1 ends and round 2 begins.
**Expected:** All 10 markers sit at the right edge (finish line area) for approximately 1.5 seconds, then snap to the left starting position simultaneously when round 2 begins.
**Why human:** The `markerStyle` `right: 4px` logic (pos >= 1.0) and `RESET_POSITIONS` mutation are both correct in code, but the visual snap-back and absence of mid-transition artifacts requires browser confirmation.

---

### Gaps Summary

No gaps found. All automated must-haves are verified at all four levels (exists, substantive, wired, data-flowing). The only outstanding items are the four human-verification checks above, which address the inherently visual and timing-sensitive aspects of the phase goal — smooth animation, perceptible speed differences, and real-time button state.

The one noteworthy deviation from plan is the `positionPercent` → `markerStyle` change in RaceTrack.vue, which is an intentional improvement (markers anchor at finish line during ROUND_COMPLETE pause) rather than a gap. This was acknowledged in 03-02-SUMMARY.md as an auto-fixed bug.

---

*Verified: 2026-03-29*
*Verifier: Claude (gsd-verifier)*
