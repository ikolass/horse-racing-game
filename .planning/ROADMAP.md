# Roadmap: Horse Racing Game / At Yarisi Oyunu

## Overview / Genel Bakis

The project delivers a complete, playable browser-based horse racing game in five phases. Phase 1 establishes the Vuex store and data models that every subsequent component depends on. Phase 2 renders the roster and wires the Generate/Start controls to the state machine. Phase 3 brings the game alive with an animated race track driven by the tick loop. Phase 4 appends sequential round results as each race concludes. Phase 5 validates correctness with Vitest unit tests and a Playwright E2E flow.

Proje, tarayici tabanli eksiksiz oynanabilir at yarisi oyununu bes fazda sunar. Faz 1, sonraki tum bilesenlerin bagimli oldugu Vuex store ve veri modellerini olusturur. Faz 2 kadroyu render eder ve Generate/Start kontrollerini durum makinesine baglar. Faz 3, tick dongusuyle yonlendirilen animasyonlu yaris pistiyle oyunu canlandirir. Faz 4, her tur biterken sirali tur sonuclarini ekler. Faz 5, Vitest birim testleri ve Playwright E2E akisiyla dogrulugu dogrular.

---

## Phases / Fazlar

**Phase Numbering / Faz Numaralandirma:**
- Integer phases (1, 2, 3): Planned milestone work / Planlanan milestone calismasi
- Decimal phases (2.1, 2.2): Urgent insertions (marked INSERTED) / Acil eklemeler

- [x] **Phase 1: Foundation** - Vuex store, data models, GAME_CONFIG, utility functions
- [x] **Phase 2: Roster + Controls UI** - 20-horse roster display + Generate/Start button logic
- [x] **Phase 3: Animated Race Track** - Race tick engine + CSS animation + round auto-advance
- [x] **Phase 4: Results Panel** - Sequential round results display + auto-scroll
- [x] **Phase 5: Tests** - Vitest unit tests + Playwright E2E coverage

---

## Phase Details / Faz Detaylari

### Phase 1: Foundation
**Goal**: The Vuex store is fully initialized with all 4 modules, the GAME_CONFIG constants object is defined, and the pure utility functions (shuffle, race engine) are correct and independently verifiable so every subsequent phase builds on a known-good data layer.

**Depends on**: Nothing (first phase)

**Requirements**: STATE-01, STATE-02, STATE-03, ROST-01, ROST-02, RACE-02

**Plans:** 2/2 plans executed
- [x] 01-01-PLAN.md - GAME_CONFIG constants + shuffle and raceEngine utilities
- [x] 01-02-PLAN.md - Vuex store with 4 modules (horses, schedule, race, results) + main.js registration

### Phase 2: Roster + Controls UI
**Goal**: The player can see all 20 horses with names, color swatches, and condition score badges in a roster panel, and the Generate and Start buttons are rendered and correctly gated by `gamePhase`.

**Depends on**: Phase 1

**Requirements**: ROST-01, ROST-02, SCHED-01, SCHED-02, SCHED-03, SCHED-04, RACE-01, RACE-04

**Plans:** 2/2 plans executed
- [x] 02-01-PLAN.md - CSS game tokens + HorseRow + HorseRoster + GameControls components
- [x] 02-02-PLAN.md - App.vue 3-column layout + placeholder components + browser verification
**UI hint**: yes

### Phase 3: Animated Race Track
**Goal**: Horses visibly animate across dedicated lanes during each round, the race advances automatically from round to round, and the tick timing and CSS transition duration are co-designed so horses slide smoothly without stutter or teleportation.

**Depends on**: Phase 2

**Requirements**: ANIM-01, ANIM-02, ANIM-03, ROST-03, RACE-02, RACE-03

**Plans:** 2/2 plans executed
- [x] 03-01-PLAN.md - Race tick engine (race.js extension + gameConfig constants + GameControls fix)
- [x] 03-02-PLAN.md - RaceTrack.vue component + App.vue swap + visual verification
**UI hint**: yes

### Phase 4: Results Panel
**Goal**: Race results appear sequentially in a Results panel, appended one entry per completed round, each labeled with round number and distance, listing the full 1st-10th finishing order.

**Depends on**: Phase 3

**Requirements**: RESULT-01, RESULT-02, RESULT-03

**Plans:** 2/2 plans executed
- [x] 04-01-PLAN.md - Store wiring: finish order derivation in onRoundComplete + clear results on Generate
- [x] 04-02-PLAN.md - ResultsPanel.vue component + App.vue swap + visual verification
**UI hint**: yes

### Phase 5: Tests
**Goal**: Vitest unit tests cover all Vuex store mutations, actions, and race-engine fairness; a Playwright E2E test covers the full generate -> start -> all rounds -> results visible flow; and all tests pass.

**Depends on**: Phase 4

**Requirements**: TEST-01, TEST-02, TEST-03

**Plans:** 3/3 plans executed
- [x] 05-01-PLAN.md - Vitest/Playwright infrastructure + shared store test helper
- [x] 05-02-PLAN.md - Vuex unit coverage + race-engine fairness test
- [x] 05-03-PLAN.md - Playwright full-flow regression + visual approval checkpoint

---

## Progress / Ilerleme

**Execution Order / Yurutme Sirasi:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-03-28 |
| 2. Roster + Controls UI | 2/2 | Complete | 2026-03-28 |
| 3. Animated Race Track | 2/2 | Complete | 2026-03-29 |
| 4. Results Panel | 2/2 | Complete | 2026-03-29 |
| 5. Tests | 3/3 | Complete | 2026-03-30 |

---

*Roadmap created / Yol haritasi olusturuldu: 2026-03-28 - Milestone v1.0*
