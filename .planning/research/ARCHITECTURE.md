# Architecture Research / Mimari Araştırması

**Project / Proje:** Horse Racing Game / At Yarışı Oyunu
**Researched / Araştırıldı:** 2026-03-28
**Confidence / Güven:** HIGH

---

## Vuex Module Split / Vuex Modül Yapısı

### `store/modules/horses.js`
```
state:
  - list: Horse[]           // 20 horses, generated once at app init
                            // 20 at, uygulama başlatılırken oluşturulur

Horse shape:
  { id, name, color, conditionScore }
```

### `store/modules/schedule.js`
```
state:
  - rounds: Round[]         // 6 rounds, each with 10 horse IDs + distance
                            // 6 tur, her birinde 10 at ID'si + mesafe
  - generated: boolean

Round shape:
  { roundNumber, distance, horseIds }
```

### `store/modules/race.js`
```
state:
  - currentRound: number    // 0-5
  - gamePhase: string       // IDLE | SCHEDULED | RACING | ROUND_COMPLETE | DONE
  - positions: { [horseId]: number }   // 0–100 percent progress
  - finishOrder: string[]   // horse IDs in order of finishing
```

### `store/modules/results.js`
```
state:
  - rounds: RoundResult[]   // appended after each round

RoundResult shape:
  { roundNumber, distance, finishOrder: [{ rank, horseId, horseName, color }] }
```

---

## Component Tree / Bileşen Ağacı

```
App.vue
├── GameControls.vue          // Generate + Start buttons, round indicator
│                             // Üret + Başlat butonları, tur göstergesi
├── HorseList.vue             // 20-horse roster panel
│   └── HorseCard.vue         // Single horse: name, color swatch, condition score
│                             // Tek at: isim, renk, kondisyon puanı
├── RaceView.vue              // Race track area
│   ├── RoundInfo.vue         // Current round: number, distance, participating horses
│   └── RaceTrack.vue         // Animated race lanes
│       └── HorseLane.vue     // Single lane: horse identifier + animated position
│                             // Tek şerit: at kimliği + animasyonlu konum
└── ResultsPanel.vue          // All completed round results
    └── RoundResult.vue       // Single round result: rank table
                              // Tek tur sonucu: sıralama tablosu
```

---

## Race Simulation Loop / Yarış Simülasyon Döngüsü

```javascript
// store/modules/race.js — action: startRound
// setInterval lives in module-scope closure, NOT in Vuex state
// setInterval, Vuex state'inde değil, modül kapsamında yaşar

let raceInterval = null

actions: {
  startRound({ commit, state, rootGetters }) {
    const horses = rootGetters['schedule/currentRoundHorses']
    const steps = computeSteps(horses)  // conditionScore → step size per tick
                                        // kondisyon puanı → her adımda ilerleme miktarı

    raceInterval = setInterval(() => {
      commit('INCREMENT_POSITIONS', steps)

      const finished = state.finishOrder.length
      if (finished === horses.length) {
        clearInterval(raceInterval)
        commit('SET_PHASE', 'ROUND_COMPLETE')
      }
    }, 100)  // 100ms tick
  }
}
```

**Step formula / Adım formülü:**
```
baseStep = distance / 1000        // longer races = slower base
                                  // uzun mesafe = yavaş baz hız
conditionMultiplier = score / 50  // 1.0 at score 50; range 0.02–2.0
randomVariance = Math.random() * 0.5
stepSize = baseStep * conditionMultiplier + randomVariance
```

---

## Animation State Placement / Animasyon Durumu Konumu

| Data | Location / Konum | Reason / Neden |
|------|----------|--------|
| `positions[horseId]` (0–100) | Vuex `race` module | Source of truth for progress; needed by multiple components |
| CSS `transform: translateX()` | Computed in `HorseLane.vue` | Derived from store; DOM concern |
| `transition-duration` | Component style binding | Derived from conditionScore; not game state |
| `raceInterval` reference | Module-scope closure | Not reactive data; never commit to state |

**Key rule / Temel kural:** Never put `setInterval` IDs or DOM refs in Vuex state.

---

## Folder Structure / Klasör Yapısı

```
src/
├── assets/
│   └── horses.js              // Static horse names + 20-color palette
│                              // Statik at isimleri + 20 renk paleti
├── components/
│   ├── controls/
│   │   └── GameControls.vue
│   ├── horses/
│   │   ├── HorseList.vue
│   │   └── HorseCard.vue
│   ├── race/
│   │   ├── RaceView.vue
│   │   ├── RoundInfo.vue
│   │   ├── RaceTrack.vue
│   │   └── HorseLane.vue
│   └── results/
│       ├── ResultsPanel.vue
│       └── RoundResult.vue
├── store/
│   ├── index.js               // createStore + module registration
│   └── modules/
│       ├── horses.js
│       ├── schedule.js
│       ├── race.js
│       └── results.js
├── utils/
│   ├── raceEngine.js          // Weighted random finish order (pure fn)
│   │                          // Ağırlıklı rastgele bitiş sırası (saf fonksiyon)
│   └── shuffle.js             // Fisher-Yates shuffle
├── composables/
│   └── useRacePhase.js        // Reactive gamePhase helpers for components
│                              // Bileşenler için reaktif oyun fazı yardımcıları
├── App.vue
└── main.js
```

---

## Build Order / İnşa Sırası

1. `src/assets/horses.js` — 20 horse names + color palette
2. `src/utils/shuffle.js` — Fisher-Yates shuffle
3. `src/utils/raceEngine.js` — weighted random finish order
4. `store/modules/horses.js` — state + mutations + init action
5. `store/modules/schedule.js` — state + generate action
6. `store/modules/race.js` — state + startRound action
7. `store/modules/results.js` — state + mutations
8. `store/index.js` — wire modules
9. `HorseCard.vue` + `HorseList.vue` — roster display
10. `GameControls.vue` — buttons wired to gamePhase
11. `HorseLane.vue` — animated lane with position binding
12. `RaceTrack.vue` — orchestrates lanes
13. `RoundInfo.vue` — current round metadata
14. `RaceView.vue` — composes track + round info
15. `RoundResult.vue` + `ResultsPanel.vue` — results display
16. `App.vue` — top-level layout composition
17. `vitest.config.js` — unit test setup
18. Unit tests — store modules + raceEngine
19. Playwright E2E — full generate → start → results flow

---

## Integration Points / Entegrasyon Noktaları

| File | Action | Depends On |
|------|--------|------------|
| `store/modules/race.js` | Create | horses, schedule modules |
| `HorseLane.vue` | Create | `race/positions` Vuex state |
| `RaceTrack.vue` | Create | HorseLane, `schedule/currentRound` |
| `GameControls.vue` | Create | `race/gamePhase` getter |
| `ResultsPanel.vue` | Create | `results/rounds` state |
| `main.js` | Modify | store injection |
| `App.vue` | Modify | All top-level components |
