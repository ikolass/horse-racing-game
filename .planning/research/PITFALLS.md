# Domain Pitfalls / Alan Tuzakları: Vue 3 + Vuex 4 Horse Racing Game

**Researched / Araştırıldı:** 2026-03-28
**Confidence / Güven:** HIGH for Vue 3/Vuex 4/Vitest API behavior; MEDIUM for assessment heuristics

---

## Critical Pitfalls / Kritik Tuzaklar

---

### Pitfall 1: setInterval Leak from Vuex Actions / Vuex Aksiyonlarından setInterval Sızıntısı

**What goes wrong / Ne oluyor:** A Vuex action starts a `setInterval` to advance race positions. The interval ID is stored nowhere. When the user generates a new schedule, the old interval keeps firing, mutating state for a race that no longer exists.

**Why it happens / Neden oluyor:** Vuex actions are plain functions — no lifecycle hooks, no automatic cleanup. Developers put `setInterval` in an action correctly but forget the cleanup obligation.

**Consequences / Sonuçlar:**
- Ghost intervals mutate positions for finished races
- Multiple Start clicks stack intervals → exponential mutations + jittery track
- `currentRound` can be incremented past 6
- Memory leak grows for the entire session

**Prevention / Önlem:**
```javascript
// store/modules/race.js
state: { raceIntervalId: null }

// In action:
const id = setInterval(...); commit('SET_INTERVAL_ID', id)

// CLEAR_RACE_INTERVAL mutation:
clearInterval(state.raceIntervalId); state.raceIntervalId = null
```
- Dispatch `stopRace` at 3 call sites: race completion, generate-new-schedule, `onUnmounted`
- Disable Start button while racing to prevent double-start

**Phase / Faz:** Store architecture — before any animation code.

---

### Pitfall 2: Mutation Frequency Overloading Vue Reactivity / Mutasyon Frekansının Vue Reaktivitesini Zorlaması

**What goes wrong:** 10 horses × 1 mutation per tick = 100 mutations/sec. Vue's scheduler falls behind → horses teleport instead of slide.

**Prevention:**
- One mutation per tick for ALL horses: `commit('UPDATE_ALL_POSITIONS', { horse1: 42, horse2: 38, ... })`
- Set tick interval no faster than 200ms — visual smoothness comes from CSS transitions, not mutation frequency

**Phase:** Animation architecture — before writing race tick logic.

---

### Pitfall 3: CSS Transition Duration Shorter Than Tick Interval / CSS Geçiş Süresi Adım Aralığından Kısa

**What goes wrong:** Tick is 100ms, CSS transition is 200ms. Next commit arrives before transition completes → element snaps mid-animation → stutter.

**Prevention:**
- Tick interval must be **≥** CSS transition duration — they are one design decision, not two
- `transform: translateX()` not `left` — GPU-composited, no layout recalculation

**Phase:** Animation integration — tick interval and CSS transition decided together.

---

### Pitfall 4: Using Vue.set() in Vue 3 / Vue 3'te Vue.set() Kullanımı

**What goes wrong:** `Vue.set(state.positions, horse.id, 0)` throws runtime error in Vue 3. Vue 2 muscle memory.

**Prevention:**
- Initialize all 20 horse position keys at store creation:
  ```javascript
  state.positions = Object.fromEntries(horses.map(h => [h.id, 0]))
  ```
- Direct assignment `state.positions[horseId] = val` is safe and reactive in Vue 3

**Phase:** Store initialization.

---

### Pitfall 5: Vitest Fake Timers + nextTick Deadlock / Vitest Sahte Zamanlayıcıları + nextTick Kilidi

**What goes wrong:** `vi.advanceTimersByTime(500)` runs synchronously. Vue DOM updates are microtask-based. Assertions run on stale state.

**Prevention:**
```javascript
vi.useFakeTimers()
store.dispatch('startRace')
vi.advanceTimersByTime(600)
await nextTick()  // ← always required / her zaman gerekli
expect(store.state.positions['horse1']).toBeGreaterThan(0)
vi.useRealTimers() // restore in afterEach / afterEach içinde geri yükle
```

**Phase:** Test architecture — write a shared timer-test helper before any tests.

---

### Pitfall 6: useStore() Returns undefined in Component Tests / Bileşen Testlerinde useStore() undefined Dönmesi

**What goes wrong:** Component mounted without store plugin → `useStore()` returns `undefined` → all computed values throw null reference.

**Prevention — create `test/utils/mountWithStore.js`:**
```javascript
import { createStore } from 'vuex'
import { mount } from '@vue/test-utils'
import storeConfig from '@/store'

export function mountWithStore(component, options = {}) {
  const store = createStore(storeConfig)
  return mount(component, { global: { plugins: [store] }, ...options })
}
```

**Phase:** Test infrastructure — the first test file written.

---

### Pitfall 7: No raceStatus State Machine → Results Show Before Animation Ends / Durum Makinesi Yok → Animasyon Bitmeden Sonuçlar Görünür

**What goes wrong:** `currentRound` increments synchronously before animation ends. Results panel shows "Round 1 Complete" while animation still plays.

**Prevention:**
```javascript
// Vuex state
raceStatus: 'idle' | 'running' | 'round-complete' | 'finished'
```
- All UI gates (button disabled, panel visibility) driven by `raceStatus`, not `currentRound`
- `ADD_ROUND_RESULT` mutation fires only after animation completes

**Phase:** Store design — before building any UI components.

---

## Moderate Pitfalls / Orta Düzey Tuzaklar

### Pitfall 8: Condition Score Too Deterministic / Kondisyon Puanı Çok Belirleyici
High-score horse wins every race → animation is theater.
**Fix:** Add per-tick noise. Target: score-90 horse wins ~65-75% vs score-40 horse, not 95%+.

### Pitfall 9: Condition Score Too Noisy / Kondisyon Puanı Çok Rastgele
Variance so large that score has no statistical effect. Assessment requirement "outcome influenced by condition score" violated.
**Fix:** Unit test — top-condition horse finishes top 3 in > 60% of 50 simulated races.

### Pitfall 10: Horses Overlapping — No Lane Management / Atlar Üst Üste Biniyor
All 10 horses at `top: 0`. Visually tangled.
**Fix:** Assign lane index (0–9) at schedule generation; `top: laneIndex * laneHeight + 'px'`.

### Pitfall 11: v-for Key Set to Array Index / v-for Anahtarı Dizi İndeksine Ayarlı
`:key="index"` → Vue reuses DOM nodes on regenerate → CSS transitions fire on wrong elements.
**Fix:** Always `:key="horse.id"`.

### Pitfall 12: Results Pre-Populated at Generation Time / Sonuçlar Üretimde Önceden Doldurulmuş
All 6 results appear immediately. "Sequential display as each round concludes" requirement violated.
**Fix:** `state.results` starts empty; `ADD_ROUND_RESULT` commits only when round animation ends.

---

## Minor Pitfalls / Küçük Tuzaklar

### Pitfall 13: Pinia Installed Instead of Vuex / Pinia Kurulu, Vuex Değil
Modern scaffolds default to Pinia. Assessment specifies Vuex 4.
**Fix:** Verify `package.json` has `vuex`, not `pinia`.

### Pitfall 14: Strict Mode Disabled to Silence Errors / Sessizleştirmek İçin Strict Modu Kapatıldı
Disabling `strict: true` instead of fixing the root cause.
**Fix:** Keep `strict: true` in dev. All state changes go through `commit()`.

### Pitfall 15: Expensive Computed on Every Tick / Her Adımda Pahalı Computed
`Object.entries(state.positions).sort(...)` runs 5x/sec during animation.
**Fix:** Separate live positions (continuous) from final order (computed once at round end).

### Pitfall 16: E2E Test Timeouts on Animation Waits / Animasyon Beklemelerinde E2E Zaman Aşımı
Default Playwright timeout (5s) < race animation duration (6s+).
**Fix:** `page.waitForSelector('[data-testid="round-1-result"]', { timeout: 15000 })`

---

## Assessment-Specific Pitfalls / Değerlendirme Özel Tuzakları

### A1: Broken or Trivial Tests / Bozuk veya Önemsiz Testler
Evaluators read tests to understand how the developer thinks.
- Minimum: mutation tests, race tick action test, fairness distribution test (50 races), one Playwright E2E

### A2: Race Logic in Components Instead of Vuex / Yarış Mantığı Bileşenlerde
`setInterval` in `mounted()`, local `ref()` state, `results` as component-local data.
**Rule:** Components dispatch actions and render state — nothing more.

### A3: Magic Numbers / Sihirli Sayılar
```javascript
export const GAME_CONFIG = {
  TOTAL_HORSES: 20,
  HORSES_PER_ROUND: 10,
  TOTAL_ROUNDS: 6,
  ROUND_DISTANCES: [1200, 1400, 1600, 1800, 2000, 2200],
}
```

### A4: Colors Not Visually Distinct / Renkler Görsel Olarak Ayırt Edilemiyor
20 similar hues → indistinguishable on track.
**Fix:** Manually curate full-hue-range palette. Test all 20 on white background.

### A5: No Button Guard on Generate / Start / Buton Koruması Yok
Double-click creates duplicate schedules or stacked intervals.
**Fix:** Disable buttons during operations.

### A6: Results Not Labeled by Round Number / Sonuçlar Tur Numarasıyla Etiketlenmemiş
Evaluator cannot verify "sequential display" without round numbers.
**Fix:** Each result: "Round N — Distance Xm" header + finishing order.

---

## Key Summary / Temel Özet

1. **setInterval ID in Vuex state + cleanup in `onUnmounted`** — Day 1 architectural decision
2. **`await nextTick()` after every `vi.advanceTimersByTime()`** — write shared test helper first
3. **One commit per tick for all horses** — single `UPDATE_ALL_POSITIONS` mutation
4. **Tick interval ≥ CSS transition duration** — one design decision, not two
5. **`raceStatus` state machine** — drives all button guards and panel visibility
