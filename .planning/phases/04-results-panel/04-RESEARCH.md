# Phase 4: Results Panel - Research

**Researched:** 2026-03-29
**Domain:** Vue 3 SFC, Vuex 4 state, auto-scroll with `nextTick`, finishing-order derivation
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RESULT-01 | Race results appear sequentially in the Results panel as each round concludes | `onRoundComplete` in `race.js` dispatches `results/addRoundResult`; `ResultsPanel.vue` watches `allResults` computed length to auto-render new entries |
| RESULT-02 | Each result entry shows round number, distance, and full finishing order (1st–10th) | Result record shape: `{ roundNumber, distance, finishOrder: [horseIndex, ...] }` — `finishOrder` is 10 horse indices sorted by condition-score descending (deterministic speed order) |
| RESULT-03 | Results panel auto-scrolls to the latest result | Vue `watch` on `allResults.length` + `nextTick(() => container.scrollTop = container.scrollHeight)` pattern |
</phase_requirements>

---

## Summary

Phase 4 connects the existing race engine to the already-created `results.js` Vuex module and builds the `ResultsPanel.vue` component that replaces `ResultsPlaceholder.vue` in `App.vue`. The infrastructure is largely in place: `results.js` already has `ADD_ROUND_RESULT`, `CLEAR_RESULTS`, and getters (`allResults`, `resultByRound`, `resultCount`). The store index already registers it.

Two gaps need filling: (1) The `onRoundComplete` action in `race.js` must compute the finish order and dispatch `results/addRoundResult` before auto-advancing. (2) A `ResultsPanel.vue` SFC must replace the placeholder, reading from `results/allResults` and auto-scrolling on each new entry.

Finish order derivation is straightforward: because the speed formula is deterministic (`condition / (maxCondition * TICKS_TO_WIN)`), the finishing order within a round is strictly condition-rank descending. `onRoundComplete` already knows `horseIndices` (via `rootGetters['schedule/roundByNumber']`) and can sort them by `rootState.horses.list[idx].condition` descending to produce a 1st–10th list. There is no need for per-tick tracking.

For the results panel's visual layout: it is a scrollable column of result cards. Each card shows "Round N — Xm" heading and an ordered list of 10 finishers with place number, color swatch, and horse name. Auto-scroll uses `templateRef` on the scroll container plus a `watch` on `allResults.length` that calls `nextTick(() => el.scrollTop = el.scrollHeight)`.

**Primary recommendation:** Extend `onRoundComplete` in `race.js` to derive finish order by sorting `horseIndices` by condition descending; dispatch `results/addRoundResult`. Then build `ResultsPanel.vue` as a purely presentational SFC with `watch` + `nextTick` for auto-scroll. Clear results in `generateSchedule` via `results/clearResults` dispatch.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | ^3.5.30 | SFC reactivity, `watch`, `nextTick`, `templateRef` | Already in project; `nextTick` is the idiomatic way to defer DOM reads after reactive state updates |
| Vuex 4 | ^4.1.0 | Results state (`results.js` module already exists) | Mandated by assessment; already registered in store index |
| CSS custom properties | n/a | Design tokens — all tokens present in `base.css` | All needed tokens already defined; no new tokens required |

### No New Dependencies

This phase adds **zero new packages**. All work is:
- A small extension to `race.js` (one `dispatch` call + sort logic in `onRoundComplete`)
- A small addition to `schedule.js` or `GameControls` action chain (clear results on Generate)
- A new `ResultsPanel.vue` SFC
- Replacing `ResultsPlaceholder` import in `App.vue`

---

## Architecture Patterns

### Recommended Project Structure (changes only)

```
src/
├── store/modules/
│   ├── results.js         # EXISTING — no mutations needed
│   └── race.js            # EXTEND onRoundComplete only
├── components/
│   ├── ResultsPanel.vue   # NEW — replaces ResultsPlaceholder
│   └── ResultsPlaceholder.vue  # keep, don't delete
└── App.vue                # EXTEND — swap import
```

### Pattern 1: Finish Order Derivation in onRoundComplete

**What:** Sort the round's `horseIndices` by condition descending to produce the deterministic finish order.

**When to use:** Called from `race.js` `onRoundComplete` action, which already has access to `rootState`, `rootGetters`, and `dispatch`.

**Why no per-tick tracking is needed:** Speed formula is `condition / (maxCondition * 60)`. Every horse moves at a constant, unique speed derived purely from condition. Horses with identical condition scores are the only edge case (they finish "simultaneously"), but the sort still produces a stable, deterministic order for display purposes.

```javascript
// Inside onRoundComplete action in race.js
onRoundComplete({ commit, state, dispatch, rootState, rootGetters }) {
  dispatch('transitionTo', 'ROUND_COMPLETE');

  // Derive finish order from condition scores (deterministic speed order)
  const round = rootGetters['schedule/roundByNumber'](state.currentRound);
  if (round) {
    const sorted = [...round.horseIndices].sort((a, b) => {
      return rootState.horses.list[b].condition - rootState.horses.list[a].condition;
    });
    dispatch('results/addRoundResult', {
      roundNumber: round.roundNumber,
      distance: round.distance,
      finishOrder: sorted,   // array of horse indices, 1st to 10th
    }, { root: true });
  }

  setTimeout(() => {
    // ... existing auto-advance logic unchanged
  }, GAME_CONFIG.PAUSE_BETWEEN_ROUNDS_MS);
},
```

**Confidence:** HIGH — pattern verified against existing `race.js` structure and Vuex 4 cross-module dispatch API (`{ root: true }`).

### Pattern 2: Clear Results on Generate

**What:** Dispatch `results/clearResults` when the player clicks Generate, so the panel resets for a new schedule.

**When to use:** In `schedule.js` `generateSchedule` action (cross-module dispatch `{ root: true }`), or in `GameControls.vue` by dispatching both `schedule/generateSchedule` and `results/clearResults` (matching the existing two-dispatch pattern already established in Phase 2 for `generateSchedule` + `transitionTo`).

**Recommended approach:** Add `results/clearResults` dispatch to `GameControls.vue` alongside existing dispatches. This keeps `schedule.js` clean and follows the established Phase 2 pattern where `GameControls` orchestrates multiple store actions.

```javascript
// GameControls.vue — extend existing generate handler
function generate() {
  store.dispatch('schedule/generateSchedule');
  store.dispatch('race/transitionTo', 'SCHEDULED');
  store.dispatch('results/clearResults');   // ADD THIS
}
```

**Confidence:** HIGH — mirrors Phase 2 decision (D-02 in STATE.md: "GameControls dispatches TWO actions on Generate").

### Pattern 3: ResultsPanel.vue Auto-Scroll

**What:** Watch `allResults.length` reactively; after each new entry, defer to `nextTick` so Vue has patched the DOM, then scroll the container to the bottom.

**When to use:** Standard Vue 3 pattern for "scroll to bottom after list append".

```javascript
// ResultsPanel.vue <script setup>
import { computed, watch, nextTick, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const allResults = computed(() => store.getters['results/allResults'])
const scrollContainer = ref(null)   // bound to the scrollable div via ref="scrollContainer"

watch(
  () => allResults.value.length,
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  }
)
```

**Confidence:** HIGH — `nextTick` + `scrollTop = scrollHeight` is the canonical Vue 3 auto-scroll pattern.

### Pattern 4: Result Card Template Structure

**What:** Each result card shows a heading ("Round N — Xm") and an ordered list of 10 finishers (place, swatch, name).

```html
<!-- ResultsPanel.vue template (simplified) -->
<div class="results-panel" data-testid="results-panel">
  <div class="panel-header">Results</div>

  <div class="results-scroll" ref="scrollContainer">
    <div v-if="allResults.length === 0" class="empty-state">
      <p>No results yet. Generate a schedule and start racing.</p>
    </div>

    <div
      v-for="result in allResults"
      :key="result.roundNumber"
      class="result-card"
      :data-testid="`result-round-${result.roundNumber}`"
    >
      <div class="result-heading">
        Round {{ result.roundNumber }} &#8212; {{ result.distance }}m
      </div>
      <ol class="finish-list">
        <li
          v-for="(horseIdx, place) in result.finishOrder"
          :key="horseIdx"
          class="finish-item"
        >
          <span class="place">{{ place + 1 }}.</span>
          <span
            class="swatch"
            :style="{ backgroundColor: allHorses[horseIdx].color }"
          ></span>
          <span class="horse-name">{{ allHorses[horseIdx].name }}</span>
        </li>
      </ol>
    </div>
  </div>
</div>
```

**Confidence:** HIGH — follows same pattern as `HorseRoster.vue` / `HorseRow.vue` established in Phase 2.

### Anti-Patterns to Avoid

- **Deriving finish order from the `positions` map after all horses reach 1.0:** By the time `onRoundComplete` fires, every horse is at exactly `1.0`. The positions map cannot encode arrival order because the tick loop overwrites all positions simultaneously. Derive order from speeds instead.
- **Storing finish order as horse names (strings):** Store as `horseIndex` integers, same as `horseIndices` in schedule rounds. Components look up names from `allHorses[idx]`. This is consistent with the rest of the store.
- **Scrolling synchronously before `nextTick`:** Vue batches DOM updates. Calling `scrollTop = scrollHeight` immediately after a state change reads stale DOM height. Always `await nextTick()` first.
- **Using `transition: all` in ResultsPanel CSS:** Follow the Phase 3 decision — never use `transition: all`. Apply transitions only to the specific property being animated.
- **Hardcoding hex colors in ResultsPanel.vue styles:** All non-inline colors must use CSS custom properties from `base.css`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finish order computation | Custom probabilistic or random sorter | Sort `horseIndices` by `condition` descending | Speed is already deterministic — condition rank IS finish rank |
| Auto-scroll | Manual `MutationObserver` or polling | `watch` + `nextTick` + `scrollTop = scrollHeight` | Standard Vue 3 pattern; 3 lines of code |
| Results state | Second copy of results in component local data | `results/allResults` Vuex getter | Module already exists with correct shape |
| Result clearing | Lifecycle hook or watcher in the component | Dispatch `results/clearResults` from `GameControls.vue` | Keeps clearing co-located with schedule generation |

---

## Existing Infrastructure (Critical Pre-conditions)

The following already exist and must NOT be recreated:

| Item | Location | State |
|------|----------|-------|
| `results.js` Vuex module | `src/store/modules/results.js` | Complete — has `ADD_ROUND_RESULT`, `CLEAR_RESULTS`, `allResults`, `resultByRound`, `resultCount` |
| `results` registered in store | `src/store/index.js` line 5 + 12 | Done — `import results` and listed in modules |
| `ResultsPlaceholder.vue` | `src/components/ResultsPlaceholder.vue` | Placeholder with no logic |
| `App.vue` col-results slot | `src/App.vue` lines 17–19 | `<ResultsPlaceholder />` — swap to `<ResultsPanel />` |
| `allHorses` getter | `src/store/modules/horses.js` | `horses/allHorses` → array of `{ name, color, condition }` |
| Design tokens | `src/assets/base.css` | All tokens available: colors, spacing, typography |
| `GAME_CONFIG` | `src/config/gameConfig.js` | `TOTAL_ROUNDS: 6`, `ROUND_DISTANCES: [1200, 1400, ...]` |

**Shape of `ADD_ROUND_RESULT` payload (from `results.js`):**

```javascript
// results.js mutation expects a result object pushed to state.rounds
// No shape enforced — the mutation just does state.rounds.push(result)
// Recommended shape:
{
  roundNumber: 1,        // integer 1–6
  distance: 1200,        // integer from ROUND_DISTANCES
  finishOrder: [8, 2, 13, ...]  // 10 horse indices, 1st to 10th
}
```

The `resultByRound` getter finds by `r.roundNumber`, so the `roundNumber` key is required.

---

## Common Pitfalls

### Pitfall 1: Results Not Cleared on Re-Generate

**What goes wrong:** Player clicks Generate a second time. Old results from the previous schedule remain in `results.rounds`. New race results append, producing 7–12 entries instead of 6.

**Why it happens:** `generateSchedule` in `schedule.js` only clears `schedule.rounds`. It does not touch `results.rounds`.

**How to avoid:** Dispatch `results/clearResults` in `GameControls.vue`'s generate handler, alongside the existing `schedule/generateSchedule` and `race/transitionTo` dispatches.

**Warning signs:** Results panel shows more than 6 entries after a second full race cycle.

### Pitfall 2: Finish Order Derived from Positions Map

**What goes wrong:** Developer reads `state.race.positions` at `onRoundComplete` time, hoping to sort horses by position value. All horses are at `1.0` — sort is unstable, produces arbitrary order.

**Why it happens:** The tick loop sets every horse to `Math.min(current + speed, 1.0)` and stops only when ALL are at 1.0. By the time `onRoundComplete` fires, every value is 1.0.

**How to avoid:** Sort `horseIndices` from the schedule by condition score descending. This exactly matches the deterministic animation (highest condition = fastest speed = first to finish).

**Warning signs:** Results show a different horse in 1st place than the one that visually won the animation.

### Pitfall 3: Auto-Scroll Reads Stale DOM Height

**What goes wrong:** `scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight` is called synchronously inside the watcher. The new result card hasn't been rendered yet, so `scrollHeight` is the old height. Scroll lands one result short.

**Why it happens:** Vue batches reactive DOM updates until the next microtask tick. Direct DOM reads before `nextTick` see the previous render.

**How to avoid:** Always `await nextTick()` before reading or setting `scrollTop`.

**Warning signs:** Panel scrolls to the second-to-last result, not the latest.

### Pitfall 4: Cross-Module Dispatch Missing `{ root: true }`

**What goes wrong:** `dispatch('results/addRoundResult', payload)` inside `race.js` action silently fails. Vuex cannot find `results/addRoundResult` because namespaced modules require `{ root: true }` for cross-module dispatch.

**Why it happens:** In namespaced Vuex modules, `dispatch` without `{ root: true }` is scoped to the current module namespace.

**How to avoid:** Always use `dispatch('results/addRoundResult', payload, { root: true })` when calling from within a namespaced module.

**Warning signs:** No results appear in the panel despite rounds completing; no console errors (silent failure).

### Pitfall 5: `ref="scrollContainer"` Not Matching Template Ref Name

**What goes wrong:** Auto-scroll never fires. `scrollContainer.value` is always `null`.

**Why it happens:** Vue 3 `<script setup>` template refs require the `ref()` variable name to exactly match the `ref="..."` attribute string in the template.

**How to avoid:** Declare `const scrollContainer = ref(null)` and use `ref="scrollContainer"` on the container div. Verify with `console.log(scrollContainer.value)` in the watcher if in doubt.

---

## Code Examples

### Extending `onRoundComplete` in race.js

```javascript
// Source: derived from existing race.js structure + Vuex 4 cross-module dispatch docs
onRoundComplete({ commit, state, dispatch, rootState, rootGetters }) {
  dispatch('transitionTo', 'ROUND_COMPLETE');

  // Derive finish order from condition scores (matches deterministic animation order)
  const round = rootGetters['schedule/roundByNumber'](state.currentRound);
  if (round) {
    const finishOrder = [...round.horseIndices].sort((a, b) => {
      return rootState.horses.list[b].condition - rootState.horses.list[a].condition;
    });
    dispatch('results/addRoundResult', {
      roundNumber: round.roundNumber,
      distance: round.distance,
      finishOrder,
    }, { root: true });
  }

  setTimeout(() => {
    if (state.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
      dispatch('transitionTo', 'DONE');
    } else {
      const nextRound = state.currentRound + 1;
      commit('RESET_POSITIONS');
      commit('SET_CURRENT_ROUND', nextRound);
      dispatch('transitionTo', 'RACING');
      dispatch('startRoundByNumber', nextRound);
    }
  }, GAME_CONFIG.PAUSE_BETWEEN_ROUNDS_MS);
},
```

### ResultsPanel.vue — Script Setup

```javascript
// Source: Vue 3 composition API docs + project patterns
import { computed, watch, nextTick, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const allResults = computed(() => store.getters['results/allResults'])
const allHorses = computed(() => store.getters['horses/allHorses'])
const scrollContainer = ref(null)

watch(
  () => allResults.value.length,
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  }
)
```

### GameControls.vue — Extended Generate Handler

```javascript
// Add results/clearResults to existing two-dispatch pattern
function generate() {
  store.dispatch('schedule/generateSchedule');
  store.dispatch('race/transitionTo', 'SCHEDULED');
  store.dispatch('results/clearResults');  // NEW
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `$el.scrollTop` in `mounted` hook | `ref` + `watch` + `nextTick` | Vue 3 (Composition API) | Reactive, no lifecycle timing hacks needed |
| `this.$store.dispatch` | `useStore()` + `store.dispatch` | Vue 3 (script setup) | Already used throughout the project |

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — this phase is pure code changes using already-installed Vue 3 + Vuex 4).

---

## Validation Architecture

`workflow.nyquist_validation` is absent from `.planning/config.json` — treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.2 |
| Config file | none — Vite auto-discovers via `vitest` in devDependencies |
| Quick run command | `npx vitest run src/utils/__tests__/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RESULT-01 | `addRoundResult` appends to `results.rounds`; dispatched on round complete | unit | `npx vitest run src/store/modules/__tests__/results.test.js` | No — Wave 0 |
| RESULT-01 | `onRoundComplete` dispatches `results/addRoundResult` with correct payload | unit | `npx vitest run src/store/modules/__tests__/race.test.js` | No — Wave 0 |
| RESULT-02 | `finishOrder` is 10 indices sorted by condition descending | unit | covered in race.test.js above | No — Wave 0 |
| RESULT-03 | Auto-scroll: visual behavior | manual-only | `npm run dev` — human verifies scroll after each round | — |

Note: RESULT-03 (auto-scroll) is DOM-interaction behavior that cannot be reliably unit-tested without a browser. It is verified in the human checkpoint task.

### Sampling Rate

- **Per task commit:** `npx vitest run src/store/modules/__tests__/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/store/modules/__tests__/results.test.js` — covers RESULT-01 store mutations and getters
- [ ] `src/store/modules/__tests__/race.test.js` — covers `onRoundComplete` dispatch of `results/addRoundResult` with correct payload shape (RESULT-01, RESULT-02)

*(Note: `src/utils/__tests__/raceEngine.test.js` already exists and covers `computeFinishOrder` — this is not needed for Phase 4 which derives order via sort, not `computeFinishOrder`.)*

---

## Open Questions

1. **Two-dispatch vs. single-dispatch for clearing results**
   - What we know: `GameControls.vue` already dispatches two actions on Generate (established in Phase 2). `results/clearResults` could be a third dispatch there, or could be moved into `generateSchedule` action in `schedule.js`.
   - What's unclear: Whether the phase planner prefers to keep all orchestration in `GameControls` (cleaner component) or colocate cleanup with generation (simpler component).
   - Recommendation: Add `results/clearResults` to `GameControls.vue` to follow the established two-dispatch pattern (now three-dispatch). This is consistent and avoids cross-module coupling in `schedule.js`.

2. **`data-testid` contracts for Phase 5 E2E**
   - What we know: Phase 5 (Playwright E2E) will need to query results panel elements. STATE.md notes: "Phase 5: Playwright selectors need `data-testid` attributes on results/controls/round indicators".
   - What's unclear: Exact attribute names the Phase 5 researcher will expect.
   - Recommendation: Apply the same naming convention as Phase 3: `data-testid="results-panel"`, `data-testid="result-round-1"` through `data-testid="result-round-6"`. The planner should include these in the component spec.

---

## Sources

### Primary (HIGH confidence)

- Project source — `src/store/modules/results.js` — confirmed existing mutations, actions, getters
- Project source — `src/store/modules/race.js` — confirmed `onRoundComplete` structure, `rootGetters` + `rootState` access
- Project source — `src/store/index.js` — confirmed `results` module already registered
- Project source — `src/App.vue` — confirmed `ResultsPlaceholder` is the current import, `col-results` slot exists
- Project source — `src/assets/base.css` — confirmed all design tokens available
- Project source — `src/config/gameConfig.js` — confirmed `TOTAL_ROUNDS: 6`, `PAUSE_BETWEEN_ROUNDS_MS: 1500`
- Vue 3 official docs (training knowledge, HIGH) — `watch`, `nextTick`, template `ref` composition API patterns
- Vuex 4 official docs (training knowledge, HIGH) — cross-module dispatch with `{ root: true }` in namespaced modules

### Secondary (MEDIUM confidence)

- `scrollTop = scrollHeight` auto-scroll pattern — standard DOM API, widely documented, no external source needed

### Tertiary (LOW confidence)

- None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already installed and in use
- Architecture patterns: HIGH — derived directly from reading existing source files
- Pitfalls: HIGH — identified from reading actual code (positions-at-1.0 issue, cross-module dispatch requirement)
- Test gaps: HIGH — verified against `src/utils/__tests__/` and store module structure

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable stack — Vue 3 + Vuex 4 patch-level only)
