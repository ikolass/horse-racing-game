# Phase 3: Animated Race Track - Research

**Researched:** 2026-03-28
**Domain:** Vue 3 SFC animation, Vuex 4 tick-loop state management, CSS transitions
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `setInterval` at 50ms tick rate. Vuex action fires every 50ms, increments each horse's progress (`positions` map, values 0.0–1.0) based on condition-weighted speed, commits `SET_POSITIONS`. Vue reactivity drives `left: X%` on the moving marker.
- **D-02:** Winner reaches finish (position = 1.0) in approximately 3 seconds. Slower horses' durations are proportional to their condition-weighted speed. Last horse arrives ~5-6s depending on condition gap.
- **D-03:** Speed is smooth and linear — constant speed per horse derived from condition score. No jitter or random variation each tick. Faster horses (higher condition) always visibly lead.
- **D-04:** Existing `race.js` state slots (`positions: {}`, `intervalId: null`, `SET_POSITIONS`, `RESET_POSITIONS`, `SET_INTERVAL_ID`) are exactly what the tick loop needs — extend `startRace` / add a `runRound` action.
- **D-05:** Moving marker shows: small colored square swatch (matching `horse.color`) + horse name + condition score badge. Fulfills ROST-03.
- **D-06:** Marker style consistent with HorseRow — 12px swatch, dark blue `#0f3460` badge background, 12px semibold label.
- **D-07:** 10 stacked horizontal lanes, each 40px tall (total 400px for track area). Subtle bottom border divider (`var(--color-divider)`).
- **D-08:** Fixed left label area (≈120px wide): shows horse's color swatch + name. Always visible regardless of marker position.
- **D-09:** Track area (remaining width after label): moving marker travels here. Thin vertical finish line at right edge of track area.
- **D-10:** Round info header above the 10 lanes: shows "Round N — Xm" (e.g., "Round 2 — 1400m"). Styled with `--font-heading` (16px semibold).
- **D-11:** After a round ends, pause for 1.5 seconds with horses frozen at final positions.
- **D-12:** During 1.5s pause, round header and lane labels remain visible. No overlay or text banner.
- **D-13:** After pause, auto-advance: clear `positions`, reset markers to start, transition `gamePhase` to `RACING` for next round.
- **D-14:** After round 6 completes, do NOT auto-advance. `gamePhase` transitions to `DONE`. Track stays showing last round's state.

### Claude's Discretion

- Finish line exact styling (color, thickness — likely 2px muted or accent)
- Exact speed formula mapping condition score (1–100) to px/tick rate
- Whether the round header updates in place or the track briefly blanks between rounds
- Lane background color (slight alternation between `--color-bg-dominant` and `--color-bg-secondary` for readability, or uniform)

### Deferred Ideas (OUT OF SCOPE)

- Countdown timer between rounds (v2 requirement UX-01)
- Overtaking animation effects (e.g., brief speed burst)
- Track background scenery or decoration
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ANIM-01 | Horses visibly move across the track via CSS transitions during each round | CSS `transition: left Xms linear` on marker; `left` updated each tick via `SET_POSITIONS` → computed style binding |
| ANIM-02 | Each horse races in its own dedicated lane with no visual overlap | 10 lanes × 40px height, `position: relative` container + `position: absolute` marker per lane, no overlap possible |
| ANIM-03 | Current round number, distance, and participating horses are shown during the race | Round info header reads `schedule/roundByNumber(currentRound)`, lane labels always rendered with horse name |
| ROST-03 | Horse condition score badge is visible on the race track during each round | Moving marker contains badge using same CSS pattern as HorseRow `.badge` class |
| RACE-02 | Race outcome is influenced by each horse's condition score (weighted probability) | Speed-per-tick derived from `horse.condition`; higher condition → faster position increment → reaches finish first |
| RACE-03 | Rounds advance automatically after a brief pause when one completes | `runRound` detects winner crossing 1.0, transitions `RACING → ROUND_COMPLETE`, schedules `setTimeout(1500)` → auto-advance |
</phase_requirements>

---

## Summary

Phase 3 replaces the static `RaceTrackPlaceholder.vue` with a fully animated `RaceTrack.vue` component. The animation engine is a `setInterval` tick loop (50ms) living in a new `runRound` Vuex action. Each tick increments every racing horse's position value proportionally to its condition score, commits all positions in one `SET_POSITIONS` call, and Vue's reactivity system drives `left: X%` CSS on each horse's moving marker. A `transition: left Xms linear` declaration on the marker element makes the movement visually smooth between ticks.

The component itself is purely presentational: it reads `positions`, `currentRound`, `gamePhase`, and the horses list from Vuex getters; it never drives simulation logic. All race advancement, winner detection, 1.5s pause, and phase transitions happen in Vuex actions. The layout is 10 fixed-height lanes (40px each, 400px total) with a permanent left label column (≈120px) and a variable-width track area where markers travel from 0% to 100% (with the finish line drawn at the right edge).

The critical co-design constraint is that CSS `transition` duration must be equal to or slightly less than the 50ms tick interval. Setting `transition: left 45ms linear` gives the marker time to arrive before the next tick repositions it, producing fluid motion without stutter or position stacking. The speed formula normalizes against the highest-condition horse in the current round so the winner always crosses at ~3 seconds (60 ticks × 50ms), regardless of which 10 horses are selected.

**Primary recommendation:** Implement `runRound` as a module-scope closure that stores the actual `setInterval` reference and exposes only its ID to Vuex state (matching the established Foundation pattern). Use `transition: left 45ms linear` on the marker. Derive per-horse speed as `condition / (maxConditionInRound * 60)`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | ^3.5.30 | SFC reactivity, computed bindings | Already in project |
| Vuex 4 | ^4.1.0 | Tick-loop state, positions map | Mandated by assessment; already in project |
| CSS custom properties | n/a | Design tokens for colors, spacing | Already in base.css; all tokens available |

No new packages required. Phase 3 is a pure code/component addition on the existing stack.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vite | ^7.3.1 | Dev server, HMR during animation tuning | Use `npm run dev` to prototype tick/transition timing |
| Vitest | ^4.1.2 | Unit test coverage (Phase 5) | Not used in Phase 3; test infrastructure exists for Phase 5 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `left` + `transition` | `transform: translateX()` | Foundation decision log notes `transform` was considered; `left` chosen because `positions` values (0.0–1.0) map directly to `left: X%` without coordinate math. Both approach GPU compositing the same way at 50ms intervals. |
| `setInterval` | `requestAnimationFrame` | rAF gives ~16ms frames (60fps) which is finer than needed; `setInterval(50ms)` matches decided tick rate and is simpler to store/clear in Vuex |
| Single `SET_POSITIONS` per tick | Per-horse commits | Foundation decision: batch commit avoids 10 reactive updates per tick; confirmed correct |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── RaceTrack.vue          # Replaces RaceTrackPlaceholder.vue
├── store/modules/
│   └── race.js                # Extend: add runRound action, ADVANCE_ROUND mutation
└── config/
    └── gameConfig.js          # Add TICK_INTERVAL and TICKS_TO_WIN constants here
```

### Pattern 1: Module-Scope Tick Loop (Established Foundation Pattern)

**What:** The `setInterval` callback reference lives in a module-scope variable inside `race.js`, not in Vuex state. Only the interval ID (returned by `setInterval`) is stored in `state.intervalId`. This is the pattern established in Phase 1.

**When to use:** Always for the tick loop — Vuex state must be serializable/observable; function references do not belong in state.

**Example:**
```javascript
// src/store/modules/race.js (extension)
let _intervalRef = null; // module-scope, NOT in state

const TICK_MS = 50;
const TICKS_TO_WIN = 60; // 60 × 50ms = 3000ms for winner

// In actions:
runRound({ commit, state, getters, rootState }, roundData) {
  const { horseIndices } = roundData;
  const horses = horseIndices.map(i => rootState.horses.list[i]);
  const maxCondition = Math.max(...horses.map(h => h.condition));

  // Pre-compute constant speeds per horse (no randomness per tick — D-03)
  const speeds = {};
  horseIndices.forEach((idx, i) => {
    speeds[idx] = horses[i].condition / (maxCondition * TICKS_TO_WIN);
  });

  // Initialize positions to 0
  const initialPositions = {};
  horseIndices.forEach(idx => { initialPositions[idx] = 0; });
  commit('SET_POSITIONS', initialPositions);

  _intervalRef = setInterval(() => {
    const current = { ...state.positions };
    let allDone = true;
    horseIndices.forEach(idx => {
      if (current[idx] < 1.0) {
        current[idx] = Math.min(1.0, current[idx] + speeds[idx]);
        if (current[idx] < 1.0) allDone = false;
      }
    });
    commit('SET_POSITIONS', current);

    if (allDone) {
      clearInterval(_intervalRef);
      _intervalRef = null;
      commit('SET_INTERVAL_ID', null);
      dispatch('onRoundComplete');
    }
  }, TICK_MS);

  commit('SET_INTERVAL_ID', _intervalRef); // store ID for cleanup
},
```

**Note:** `setInterval` returns a numeric ID in browsers. The module-scope `_intervalRef` holds the same value — storing it separately allows reliable `clearInterval` even if Vuex state updates lag.

### Pattern 2: Winner Detection — "All Done" vs "First to Finish"

**What:** The tick loop checks whether ALL horses have reached 1.0 before ending the round (not just the first one). This ensures every horse's final position is committed before `onRoundComplete` fires, so the frozen-positions display (D-12) is fully populated.

**When to use:** Always — single-winner detection would leave slower horses mid-track during the 1.5s pause.

**Example:**
```javascript
// After all horses reach 1.0, their positions are clamped at exactly 1.0
// The component renders all 10 markers at the finish line before the pause
```

### Pattern 3: CSS Transition Co-Design

**What:** The marker element has `transition: left 45ms linear`. The tick fires every 50ms. The 5ms gap ensures the CSS transition completes before the next `left` value is applied, preventing queued/stacked transitions.

**When to use:** Must be set on the `.horse-marker` element. Do NOT use `transition: all` (risks animating other properties unintentionally).

**Example:**
```css
/* In RaceTrack.vue <style scoped> */
.horse-marker {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: left 45ms linear;
  /* left is set via :style binding = position * 100 + '%' */
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  white-space: nowrap;
}
```

### Pattern 4: Vue Reactivity Binding for Position

**What:** Each horse marker's `left` CSS property is driven by a computed getter that maps position value (0.0–1.0) to a percentage string.

**When to use:** In the template's `:style` binding on the moving marker element.

**Example:**
```vue
<!-- In RaceTrack.vue template -->
<div
  class="horse-marker"
  :style="{ left: (positions[horse.idx] ?? 0) * 100 + '%' }"
>
  <span class="swatch" :style="{ backgroundColor: horse.color }"></span>
  <span class="name">{{ horse.name }}</span>
  <span class="badge">{{ horse.condition }}</span>
</div>
```

**Key:** `?? 0` guard handles the pre-race state (positions empty before `runRound` initializes them) and prevents NaN from reaching the style binding.

### Pattern 5: Auto-Advance with setTimeout

**What:** After `RACING → ROUND_COMPLETE` transition, a `setTimeout(1500)` in the `onRoundComplete` action drives the next transition. The 1500ms pause is not stored in state — it is a fire-and-forget timer.

**When to use:** In `onRoundComplete` action only. The component does not manage any timers.

**Example:**
```javascript
onRoundComplete({ commit, dispatch, state, rootGetters }) {
  dispatch('transitionTo', 'ROUND_COMPLETE');

  setTimeout(() => {
    if (state.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
      // D-14: Last round — go to DONE, do not auto-advance
      dispatch('transitionTo', 'DONE');
    } else {
      // D-13: Auto-advance to next round
      commit('RESET_POSITIONS');
      commit('SET_CURRENT_ROUND', state.currentRound + 1);
      dispatch('transitionTo', 'RACING');
      dispatch('startRoundForCurrentRound');
    }
  }, 1500);
},
```

### Pattern 6: Pre-Race Track Population (Idle/Scheduled State)

**What:** Per CONTEXT.md `<specifics>`, before Start is clicked, the track shows the 10 horses for the upcoming round at position 0. The component reads `schedule/roundByNumber(currentRound || 1)` to populate lanes even when `gamePhase` is `SCHEDULED`.

**When to use:** Computed property that returns the horse list for the currently-visible round.

**Example:**
```javascript
// In RaceTrack.vue <script setup>
const visibleRound = computed(() => {
  const round = store.getters['schedule/roundByNumber'](
    currentRound.value || 1
  );
  return round ?? null;
});

// Only render lanes when a schedule exists
// (gamePhase === 'IDLE' with no schedule: show placeholder text)
```

### Recommended Project Structure (Component Detail)

```
RaceTrack.vue
├── Template
│   ├── .round-header       "Round N — Xm" (shown when schedule exists)
│   ├── .track-container    position: relative, height: 400px
│   │   └── .lane × 10     height: 40px, position: relative
│   │       ├── .lane-label  fixed 120px left: swatch + name
│   │       ├── .track-area  remaining width, position: relative
│   │       │   ├── .finish-line  absolute, right: 0
│   │       │   └── .horse-marker  absolute, left: X%, transition
│   │       └── .lane-divider  border-bottom
│   └── (else) .empty-state  shown when no schedule exists
└── Script Setup
    ├── store getters: positions, currentRound, gamePhase
    ├── schedule getter: roundByNumber
    ├── horses getter: horseByIndex
    └── computed: visibleRound, racingHorses
```

### Anti-Patterns to Avoid

- **Storing `setInterval` reference in Vuex state:** Functions are not serializable and break Vue DevTools. Use module-scope variable, store only the numeric ID.
- **Per-horse `SET_POSITIONS` commits:** Committing individual position updates inside the interval fires 10 reactive updates per tick. Always batch via single `SET_POSITIONS` with a full object.
- **`transition: all` on marker:** Animates ALL CSS property changes, including color. Use `transition: left 45ms linear` only.
- **Using `gamePhase` reactive checks inside `setInterval` callback:** The closure captures stale state. Access current state via `state.positions` (passed through dispatch) or use the module-scope variable for exit conditions.
- **Positioning marker relative to full lane width:** The marker should travel within `.track-area` only (after the 120px label). The `left: 0%` → `left: 100%` journey should map to the track area element, not the full lane width. Achieve this by placing the marker inside `.track-area`, not inside `.lane`.
- **Hardcoded hex values in RaceTrack.vue:** All colors must use design tokens from `base.css`. No inline `#e94560` or `#0f3460` literals.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth animation between position updates | Custom interpolation / easing math in JS | CSS `transition: left 45ms linear` | Browser composites CSS transitions on a separate thread; JS math runs on main thread and blocks during computation |
| Timer cleanup on component unmount | Manual interval tracking in component | `onUnmounted` hook calling `store.dispatch('race/stopRace')` | Component owns lifecycle; store owns the interval reference. Dispatch keeps separation clean |
| Reactive position-to-style conversion | Watcher with manual DOM manipulation | `:style="{ left: positions[idx] * 100 + '%' }"` computed binding | Vue's reactivity system is exactly for this; watchers + DOM manipulation bypasses the virtual DOM |
| Condition score → visual speed mapping | Physics engine or complex easing | Linear `condition / (maxCondition * TICKS_TO_WIN)` | D-03 mandates constant speed; physics overkill |

**Key insight:** The CSS transition layer does all the visual interpolation work — the JS tick loop only needs to commit discrete position snapshots. The browser handles smoothness.

---

## Common Pitfalls

### Pitfall 1: Transition Duration Exceeds Tick Interval

**What goes wrong:** If `transition: left 60ms linear` with a 50ms tick, the browser queues a new transition before the previous one completes. Markers visibly stutter or lag behind, appearing to "catch up" in bursts.

**Why it happens:** Each tick commits a new `left` value. CSS transitions are interruptible but the interruption looks like a speed change. When transition >= tick, visual pacing becomes uneven.

**How to avoid:** Keep `transition` duration strictly less than tick interval. At 50ms tick, use 40–48ms transition. The 45ms value gives a comfortable buffer.

**Warning signs:** Markers appear to move in two-speed bursts (fast then slow, repeating) instead of constant velocity.

### Pitfall 2: Position Computed Against Wrong Container Width

**What goes wrong:** If `left: X%` is applied to a marker inside `.lane` (full width including label), then `left: 0%` starts at the very left edge overlapping the label, and `left: 100%` overshoots the track. Horses appear to run through their own name labels.

**Why it happens:** CSS percentage `left` values are relative to the positioned ancestor's width. The marker must be a child of `.track-area` (not `.lane`) so its `left: 0%` → `left: 100%` journey spans only the track area.

**How to avoid:** Place `.horse-marker` as a direct child of `.track-area`. Make `.track-area` `position: relative`. Make `.horse-marker` `position: absolute`.

**Warning signs:** Markers start partially behind the name labels or disappear off the right edge of the lane.

### Pitfall 3: Stale Closure in setInterval Callback

**What goes wrong:** The interval callback closes over `state.positions` from the moment `setInterval` was called. As Vuex commits new position objects, the closed-over reference still points to the original (now outdated) object. Each tick may overwrite newer positions with stale ones.

**Why it happens:** `setInterval` captures variables at call time. Vuex `state.positions` is replaced by reference on each `SET_POSITIONS` commit — the old reference the closure holds is the previous object.

**How to avoid:** Always read `state.positions` inside the action callback fresh each tick using `store.state.race.positions` OR spread from the current committed state inside the action:
```javascript
// Inside setInterval callback — access via the action's `state` parameter
// (The action must be written so state is re-read each tick, not closed over)
// Use the Vuex action pattern with getters/state re-read:
runRound({ commit, state, rootState }) {
  _intervalRef = setInterval(() => {
    const currentPos = { ...state.positions }; // reads current Vuex state
    // ... mutate currentPos ...
    commit('SET_POSITIONS', currentPos);
  }, 50);
}
```
Note: In Vuex 4, the `state` object passed to actions IS reactive — reading `state.positions` inside the callback gives the current value.

**Warning signs:** All horses freeze at 0 or move only once; console shows positions resetting.

### Pitfall 4: Race Cleanup Missing on Re-Start or Generate

**What goes wrong:** If the user somehow triggers re-generation or a second Start while a round is running (which button gating should prevent, but defensive coding matters), the old `setInterval` keeps firing, creating duplicate tick loops that double the speed and corrupt positions.

**Why it happens:** `setInterval` continues until explicitly cleared. Without cleanup, old loops persist.

**How to avoid:** At the top of `runRound` (and in a `stopRace` action), always `clearInterval(_intervalRef)` before starting a new one. Also call `clearInterval` in `onRoundComplete` before the `setTimeout` fires.

**Warning signs:** Horses accelerate over successive rounds; condition scores appear to lose their effect.

### Pitfall 5: Missing `?? 0` Guard on Position Binding

**What goes wrong:** When the track renders in `SCHEDULED` state before `runRound` initializes `positions`, `positions[horseIdx]` returns `undefined`. `undefined * 100` = `NaN`. Vue renders `left: NaN%` which browsers silently ignore, leaving markers at `left: 0%` (fine) but also suppresses the `transition` property, causing a snap instead of smooth movement when the race starts.

**Why it happens:** `positions` is initialized as `{}`. The `SET_POSITIONS` in `runRound` fills it. There is a one-render gap between component mount and first tick.

**How to avoid:** Use `(positions[horse.idx] ?? 0) * 100 + '%'` in the style binding.

**Warning signs:** First tick of a round causes a visible snap instead of smooth start.

### Pitfall 6: gamePhase Gating During 1.5s Pause Window

**What goes wrong:** During the 1.5s `ROUND_COMPLETE` pause, `generateDisabled` in `GameControls` currently only blocks on `RACING`. If the user clicks Generate during `ROUND_COMPLETE`, a new schedule is generated mid-pause, and the auto-advance `setTimeout` fires with stale round data.

**Why it happens:** The existing `generateDisabled = gamePhase === 'RACING'` check (Phase 2) does not cover `ROUND_COMPLETE`.

**How to avoid:** In Phase 3, update `generateDisabled` in `GameControls.vue` to also block on `ROUND_COMPLETE`:
```javascript
const generateDisabled = computed(() =>
  gamePhase.value === 'RACING' || gamePhase.value === 'ROUND_COMPLETE'
);
```
This is a small fix but prevents race condition corruption.

**Warning signs:** Schedule panel shows new horses mid-round, next round starts with wrong horses.

---

## Code Examples

### Speed Formula

```javascript
// Source: Derived from D-02 (3s winner) + D-03 (linear, condition-weighted) in CONTEXT.md
// TICKS_TO_WIN = 3000ms / 50ms = 60 ticks for the highest-condition horse in the round

const TICK_MS = 50;
const TICKS_TO_WIN = 60;

function computeSpeeds(horseIndices, horsesList) {
  const horses = horseIndices.map(idx => horsesList[idx]);
  const maxCondition = Math.max(...horses.map(h => h.condition));
  const speeds = {};
  horseIndices.forEach((idx, i) => {
    // Condition 95 with maxCondition 95: speed = 1/60 per tick → 60 ticks → 3000ms
    // Condition 29 with maxCondition 95: speed = 29/(95*60) ≈ 0.0051 per tick → ~197 ticks → ~9850ms
    speeds[idx] = horses[i].condition / (maxCondition * TICKS_TO_WIN);
  });
  return speeds;
}
```

### Lane Layout CSS

```css
/* Source: D-07, D-08, D-09 in CONTEXT.md + base.css tokens */
.track-container {
  height: 400px; /* 10 lanes × 40px */
  display: flex;
  flex-direction: column;
}

.lane {
  height: 40px;
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--color-divider);
}

/* Alternating lane backgrounds (Claude's discretion) */
.lane:nth-child(odd) {
  background: var(--color-bg-dominant);
}
.lane:nth-child(even) {
  background: var(--color-bg-secondary);
}

.lane-label {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 0 var(--space-sm);
}

.track-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.finish-line {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-divider); /* muted — Claude's discretion: not accent to avoid visual noise */
}

.horse-marker {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: left 45ms linear;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  white-space: nowrap;
  /* left set via :style binding */
}
```

### Round Header

```vue
<!-- Source: D-10 in CONTEXT.md -->
<div v-if="visibleRound" class="round-header">
  Round {{ visibleRound.roundNumber }} — {{ visibleRound.distance }}m
</div>

<style scoped>
.round-header {
  font-size: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  padding: var(--space-sm) var(--space-md);
}
</style>
```

### Full RaceTrack.vue Script Setup Skeleton

```vue
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const gamePhase = computed(() => store.getters['race/gamePhase'])
const currentRound = computed(() => store.getters['race/currentRound'])
const positions = computed(() => store.state.race.positions)
const allHorses = computed(() => store.getters['horses/allHorses'])

// The round to display: current if racing, round 1 if scheduled but not started yet
const visibleRound = computed(() => {
  const roundNum = currentRound.value || 1
  return store.getters['schedule/roundByNumber'](roundNum) ?? null
})

const racingHorses = computed(() => {
  if (!visibleRound.value) return []
  return visibleRound.value.horseIndices.map(idx => ({
    idx,
    ...allHorses.value[idx],
  }))
})

function positionPercent(horseIdx) {
  return ((positions.value[horseIdx] ?? 0) * 100) + '%'
}

const hasSchedule = computed(() => !!visibleRound.value)
</script>
```

### Vuex race.js Extension Skeleton

```javascript
// src/store/modules/race.js — additions only (extend existing file)

import { GAME_CONFIG } from '@/config/gameConfig.js'

const TICK_MS = 50
const TICKS_TO_WIN = 60 // fastest horse wins in 3000ms

let _intervalRef = null // module-scope only

// Add to existing mutations:
// SET_CURRENT_ROUND already exists — used as-is
// RESET_POSITIONS already exists — used as-is
// SET_INTERVAL_ID already exists — used as-is

// New actions to add:
const newActions = {
  runRound({ commit, state, rootState, dispatch }, { horseIndices }) {
    // Clear any existing interval (defensive)
    if (_intervalRef) {
      clearInterval(_intervalRef)
      _intervalRef = null
    }

    const horses = horseIndices.map(idx => rootState.horses.list[idx])
    const maxCondition = Math.max(...horses.map(h => h.condition))

    const speeds = {}
    horseIndices.forEach((idx, i) => {
      speeds[idx] = horses[i].condition / (maxCondition * TICKS_TO_WIN)
    })

    // Initialize positions
    const initPos = {}
    horseIndices.forEach(idx => { initPos[idx] = 0 })
    commit('SET_POSITIONS', initPos)

    _intervalRef = setInterval(() => {
      const current = { ...state.positions }
      let allDone = true

      horseIndices.forEach(idx => {
        if (current[idx] < 1.0) {
          current[idx] = Math.min(1.0, current[idx] + speeds[idx])
          if (current[idx] < 1.0) allDone = false
        }
      })

      commit('SET_POSITIONS', current)

      if (allDone) {
        clearInterval(_intervalRef)
        _intervalRef = null
        commit('SET_INTERVAL_ID', null)
        dispatch('onRoundComplete')
      }
    }, TICK_MS)

    commit('SET_INTERVAL_ID', _intervalRef)
  },

  onRoundComplete({ commit, state, dispatch }) {
    dispatch('transitionTo', 'ROUND_COMPLETE')

    setTimeout(() => {
      if (state.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
        // D-14: Last round complete → DONE, no auto-advance
        dispatch('transitionTo', 'DONE')
      } else {
        // D-13: Auto-advance to next round
        const nextRound = state.currentRound + 1
        commit('RESET_POSITIONS')
        commit('SET_CURRENT_ROUND', nextRound)
        dispatch('transitionTo', 'RACING')
        // The store needs access to schedule to get horseIndices for next round
        // dispatch calls itself back via startRoundByNumber
        dispatch('startRoundByNumber', nextRound)
      }
    }, 1500)
  },

  startRoundByNumber({ dispatch, rootGetters }, roundNumber) {
    const round = rootGetters['schedule/roundByNumber'](roundNumber)
    if (round) {
      dispatch('runRound', { horseIndices: round.horseIndices })
    }
  },

  // Extend existing startRace:
  startRace({ commit, dispatch, rootGetters }) {
    dispatch('transitionTo', 'RACING')
    commit('SET_CURRENT_ROUND', 1)
    const round = rootGetters['schedule/roundByNumber'](1)
    if (round) {
      dispatch('runRound', { horseIndices: round.horseIndices })
    }
  },
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GSAP for web animation | CSS transitions + JS state | Ongoing (Vue 3 era) | No dep needed; browser composites transitions |
| `requestAnimationFrame` for game loops | `setInterval` at fixed tick rates | N/A | rAF is better for 60fps visual; 50ms game tick is coarser and matches D-01 |
| Component-local animation state | All state in Vuex | Phase 1 decision | Component is purely reactive; no local `ref`s for position |

**Deprecated/outdated:**
- Vue 2 Options API `mounted`/`destroyed` lifecycle for setInterval: Phase 3 uses Vuex actions entirely — component does not manage timers.
- `state.positions[horseIdx] = value` direct mutation: Always use `SET_POSITIONS` with a full new object for proper Vue 3 reactivity.

---

## Open Questions

1. **Should `startRace` in `race.js` be fully replaced or have the new body added alongside the stub?**
   - What we know: Current stub transitions to `RACING` and sets `currentRound = 1`. The new body adds `runRound` dispatch. The existing code is safe to extend.
   - What's unclear: Whether Phase 5 tests mock `startRace` behavior directly (they don't exist yet).
   - Recommendation: Replace the stub body entirely in the plan. The stub had no side effects beyond what the new implementation replicates.

2. **Does `generateDisabled` need updating in `GameControls.vue`?**
   - What we know: Current check is `gamePhase === 'RACING'`. Phase 3 adds `ROUND_COMPLETE` state which lasts 1.5s.
   - What's unclear: Whether Generate during `ROUND_COMPLETE` causes real corruption (the auto-advance setTimeout fires with a stale `rootGetters['schedule/roundByNumber']` reference which reads Vuex state — so a re-generate would corrupt the in-progress sequence).
   - Recommendation: Yes, update `generateDisabled` to include `ROUND_COMPLETE`. Document in the plan as a required patch.

3. **`raceEngine.js` `computeFinishOrder` — used in Phase 3?**
   - What we know: CONTEXT.md mentions it is available for determining final positions when winner crosses. The tick loop naturally produces a finish order (first horse to reach 1.0 wins).
   - What's unclear: Whether the results panel (Phase 4) needs a finish-order array committed to Vuex state from Phase 3.
   - Recommendation: Do NOT call `computeFinishOrder` in Phase 3. The tick loop's natural ordering (positions reaching 1.0 sequentially) is the authoritative finish order. Phase 4 should derive or record it. Keep Phase 3 scope clean.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is a pure code/component addition. No external services, CLIs, databases, or runtimes beyond the existing Node/Vite/Vue stack (already verified as operational from Phase 2 completion).

---

## Validation Architecture

`nyquist_validation` key is absent from `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.2 |
| Config file | None detected — Wave 0 gap |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --coverage` |

Note: Vitest is installed in devDependencies but no test files or config exist yet. Phase 3 is not responsible for test implementation (that is Phase 5), but the plan should not break testability. Adding `data-testid` attributes now prevents Phase 5 rework.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | Horses move across track via CSS transitions | manual-only | Visual check in browser | N/A |
| ANIM-02 | 10 dedicated lanes, no vertical overlap | manual-only | Visual check in browser | N/A |
| ANIM-03 | Round header shows number, distance, horses | unit | `npx vitest run tests/RaceTrack.spec.js` | ❌ Wave 0 (Phase 5) |
| ROST-03 | Condition badge visible on track | manual-only | Visual check in browser | N/A |
| RACE-02 | Condition score influences race outcome | unit (engine) | `npx vitest run tests/raceEngine.spec.js` | ❌ Wave 0 (Phase 5) |
| RACE-03 | Rounds advance automatically after 1.5s | unit (store) | `npx vitest run tests/race.store.spec.js` | ❌ Wave 0 (Phase 5) |

Note: ANIM-01, ANIM-02, ROST-03 are inherently visual/browser-verified. The Phase 5 Playwright E2E test will cover the full flow; unit tests are not appropriate for pure CSS animation correctness.

### Sampling Rate

- **Per task commit:** Visual browser check (`npm run dev` → start race → observe)
- **Per wave merge:** Not applicable (no test files in Phase 3 scope)
- **Phase gate:** Manual visual verification of all 6 success criteria before `/gsd:verify-work`

### Wave 0 Gaps

- No test files needed in Phase 3 — tests are Phase 5 scope. Phase 3 must add `data-testid` attributes to enable Phase 5:

Required `data-testid` attributes for Phase 5 Playwright (document in plan):

| Element | data-testid |
|---------|-------------|
| Race track container | `data-testid="race-track"` |
| Round header | `data-testid="round-header"` |
| Individual lane (each) | `data-testid="lane-{horseIdx}"` |
| Horse marker (each) | `data-testid="marker-{horseIdx}"` |
| Finish line | `data-testid="finish-line"` (optional, Phase 5 may not need) |

---

## Sources

### Primary (HIGH confidence)

- Direct file inspection: `src/store/modules/race.js` — confirmed `positions`, `intervalId`, `SET_POSITIONS`, `RESET_POSITIONS`, `SET_INTERVAL_ID`, `transitionTo` all present and correct
- Direct file inspection: `src/store/modules/schedule.js` — confirmed `rounds[]` structure with `roundNumber`, `distance`, `horseIndices`
- Direct file inspection: `src/config/gameConfig.js` — confirmed `TOTAL_ROUNDS = 6`, `HORSES_PER_ROUND = 10`, `ROUND_DISTANCES`
- Direct file inspection: `src/utils/raceEngine.js` — confirmed `computeFinishOrder` signature and weight logic
- Direct file inspection: `src/assets/base.css` — confirmed all design tokens available
- Direct file inspection: `src/components/HorseRow.vue` — confirmed swatch/badge CSS pattern to replicate
- Direct file inspection: `src/App.vue` — confirmed `<RaceTrackPlaceholder>` import location for Phase 3 swap
- Direct file inspection: `package.json` — confirmed Vue 3.5.30, Vuex 4.1.0, Vitest 4.1.2, no animation libraries
- Direct file inspection: `.planning/phases/02-roster-controls-ui/02-UI-SPEC.md` — confirmed design language, spacing, color tokens, `data-testid` pattern
- `03-CONTEXT.md` decisions D-01 through D-14 — all locked constraints

### Secondary (MEDIUM confidence)

- `STATE.md` accumulated context: confirmed "CSS `transform: translateX()` preferred over GSAP — simpler, Vue-native" and "Single `UPDATE_ALL_POSITIONS` mutation per tick" and "Tick interval (200ms) >= CSS transition duration (180ms) — co-designed as one decision" from Foundation phase
- Note: STATE.md references 200ms tick from earlier exploration, but CONTEXT.md D-01 locks 50ms. The 50ms value supersedes the STATE.md note.

### Tertiary (LOW confidence)

- None — all findings verified against project source files and locked decisions.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json; no new packages required
- Architecture: HIGH — derived directly from locked CONTEXT.md decisions + existing code patterns
- Pitfalls: HIGH — derived from CSS transition mechanics (well-understood), Vue 3 reactivity model, and Vuex closure behavior (all verifiable from spec/source)
- Speed formula: HIGH — arithmetic derivation from D-02/D-03 constraints; cross-checked edge cases

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack; no external dependencies to drift)
