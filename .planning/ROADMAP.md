# Roadmap: Horse Racing Game / At Yarışı Oyunu

## Overview / Genel Bakış

The project delivers a complete, playable browser-based horse racing game in five phases. Phase 1 establishes the Vuex store and data models that every subsequent component depends on. Phase 2 renders the roster and wires the Generate/Start controls to the state machine. Phase 3 brings the game alive with an animated race track driven by the tick loop. Phase 4 appends sequential round results as each race concludes. Phase 5 validates correctness with Vitest unit tests and a Playwright E2E flow.

Proje, tarayıcı tabanlı eksiksiz oynanabilir at yarışı oyununu beş fazda sunar. Faz 1, sonraki tüm bileşenlerin bağımlı olduğu Vuex store ve veri modellerini oluşturur. Faz 2 kadroyu render eder ve Generate/Start kontrollerini durum makinesine bağlar. Faz 3, tick döngüsüyle yönlendirilen animasyonlu yarış pistiyle oyunu canlandırır. Faz 4, her tur biterken sıralı tur sonuçlarını ekler. Faz 5, Vitest birim testleri ve Playwright E2E akışıyla doğruluğu doğrular.

---

## Phases / Fazlar

**Phase Numbering / Faz Numaralandırma:**
- Integer phases (1, 2, 3): Planned milestone work / Planlanan milestone çalışması
- Decimal phases (2.1, 2.2): Urgent insertions (marked INSERTED) / Acil eklemeler

- [ ] **Phase 1: Foundation** - Vuex store, data models, GAME_CONFIG, utility functions
- [x] **Phase 2: Roster + Controls UI** - 20-horse roster display + Generate/Start button logic
- [x] **Phase 3: Animated Race Track** - Race tick engine + CSS animation + round auto-advance
- [x] **Phase 4: Results Panel** - Sequential round results display + auto-scroll
- [x] **Phase 5: Tests** - Vitest unit tests + Playwright E2E coverage

---

## Phase Details / Faz Detayları

### Phase 1: Foundation
**Goal**: The Vuex store is fully initialized with all 4 modules, the GAME_CONFIG constants object is defined, and the pure utility functions (shuffle, race engine) are correct and independently verifiable — so every subsequent phase builds on a known-good data layer.

**Vuex store 4 modülle tam olarak başlatılmış, GAME_CONFIG sabitler nesnesi tanımlı ve saf yardımcı fonksiyonlar (shuffle, yarış motoru) doğru ve bağımsız olarak doğrulanabilir — böylece sonraki tüm fazlar bilinen iyi bir veri katmanı üzerine inşa edilir.**

**Depends on**: Nothing (first phase) / Hiçbir şeye bağımlı değil (ilk faz)

**Requirements**: STATE-01, STATE-02, STATE-03, ROST-01, ROST-02, RACE-02

**Success Criteria** (what must be TRUE / doğru olması gerekenler):
  1. Vuex store initializes with all 4 modules (`horses`, `schedule`, `race`, `results`) and the browser console shows no errors on app load / Vuex store 4 modülle başlar ve uygulama yüklenirken konsolda hata yok
  2. All 20 horses exist in store state with unique names, distinct colors, and condition scores in the 1–100 range / Store state'inde 20 atın tamamı benzersiz isim, farklı renk ve 1–100 kondisyon puanıyla mevcuttur
  3. The `gamePhase` state machine starts at `IDLE` and transitions correctly (IDLE → SCHEDULED → RACING → ROUND_COMPLETE → DONE) when actions are dispatched / `gamePhase` durum makinesi `IDLE`'da başlar ve aksiyonlar dispatch edildiğinde doğru geçiş yapar
  4. `raceEngine.js` weighted-random function returns a finish order that consistently ranks higher-condition horses toward the front across repeated calls / `raceEngine.js` ağırlıklı rastgele fonksiyonu, tekrarlanan çağrılarda yüksek kondisyonlu atları öne sıralayan bir bitiş sırası döndürür
  5. `GAME_CONFIG` contains all magic numbers (TOTAL_HORSES: 20, HORSES_PER_ROUND: 10, TOTAL_ROUNDS: 6, ROUND_DISTANCES) and no raw numbers appear in store modules / `GAME_CONFIG` tüm sihirli sayıları içerir ve store modüllerinde ham sayı yok

**Plans:** 2 plans
Plans:
- [x] 01-01-PLAN.md — GAME_CONFIG constants + shuffle and raceEngine utilities
- [x] 01-02-PLAN.md — Vuex store with 4 modules (horses, schedule, race, results) + main.js registration

### Phase 2: Roster + Controls UI
**Goal**: The player can see all 20 horses with names, color swatches, and condition score badges in a roster panel, and the Generate and Start buttons are rendered and correctly gated by `gamePhase` — so the state machine is proven to work before animation complexity is introduced.

**Oyuncu, bir kadro panelinde tüm 20 atı isim, renk rozeti ve kondisyon puanı rozeti ile görebilir; Generate ve Start butonları render edilmiş ve `gamePhase` tarafından doğru şekilde kilitlenmiştir — böylece animasyon karmaşıklığı eklenmeden önce durum makinesinin çalıştığı kanıtlanır.**

**Depends on**: Phase 1

**Requirements**: ROST-01, ROST-02, SCHED-01, SCHED-02, SCHED-03, SCHED-04, RACE-01, RACE-04

**Success Criteria** (what must be TRUE / doğru olması gerekenler):
  1. Player can see all 20 horses listed in the roster panel, each with its name, a colored swatch matching its assigned color, and a visible condition score / Oyuncu, kadro panelinde tüm 20 atı isim, atanan renge uygun renk rozeti ve görünür kondisyon puanıyla görebilir
  2. Clicking Generate creates a schedule visible to the developer in Vuex devtools — 6 rounds each with 10 distinct horse IDs and the correct distance for that round position / Generate tıklandığında Vuex devtools'da görünür bir program oluşturulur: 6 tur, her birinde 10 farklı at ID'si ve doğru mesafe
  3. Generate button is disabled while `gamePhase` is `RACING` and Start button is disabled when `gamePhase` is `IDLE` or `RACING` / Generate butonu `RACING` fazında devre dışı; Start butonu `IDLE` veya `RACING` fazında devre dışı
  4. Clicking Start transitions `gamePhase` from `SCHEDULED` to `RACING` (verifiable in Vuex devtools before animation exists) / Start tıklandığında `gamePhase`, `SCHEDULED`'dan `RACING`'e geçer (animasyon olmadan Vuex devtools'da doğrulanabilir)

**Plans:** 2 plans
Plans:
- [x] 02-01-PLAN.md — CSS game tokens + HorseRow + HorseRoster + GameControls components
- [x] 02-02-PLAN.md — App.vue 3-column layout + placeholder components + browser verification
**UI hint**: yes

### Phase 3: Animated Race Track
**Goal**: Horses visibly animate across dedicated lanes during each round, the race advances automatically from round to round, and the tick timing and CSS transition duration are co-designed so horses slide smoothly without stutter or teleportation.

**Her turda atlar ayrı şeritlerde görünür biçimde animasyon yapar, yarış turdan tura otomatik ilerler; tick zamanlaması ve CSS geçiş süresi birlikte tasarlandığından atlar takılmadan veya ışınlanmadan yumuşakça kayar.**

**Depends on**: Phase 2

**Requirements**: ANIM-01, ANIM-02, ANIM-03, ROST-03, RACE-02, RACE-03

**Success Criteria** (what must be TRUE / doğru olması gerekenler):
  1. During a round, all participating horses are visible in separate horizontal lanes with no vertical overlap / Tur sırasında tüm katılımcı atlar dikey üst üste binme olmaksızın ayrı yatay şeritlerde görünür
  2. Each horse's marker moves smoothly from left to right across its lane — no snapping, teleporting, or stutter — with higher-condition horses visibly moving faster than lower-condition horses / Her atın işaretçisi şeridinde soldan sağa yumuşakça hareket eder — anlık zıplama, ışınlanma veya takılma yok — yüksek kondisyonlu atlar düşük kondisyonlulara göre görünür biçimde daha hızlı hareket eder
  3. The current round number, distance (e.g., "Round 3 — 1600m"), and participating horse names/colors are displayed while the round is in progress / Tur devam ederken mevcut tur numarası, mesafe (örn. "Round 3 — 1600m") ve katılımcı at isimleri/renkleri görüntülenir
  4. Each horse's condition score badge is visible on the track during the round / Her atın kondisyon puanı rozeti tur sırasında pistte görünür
  5. After a round completes, the next round starts automatically after a brief pause without requiring user interaction / Bir tur tamamlandıktan sonra, kullanıcı etkileşimi gerekmeksizin kısa bir duraklamanın ardından sonraki tur otomatik başlar

**Plans:** 2/2 plans executed
Plans:
- [x] 03-01-PLAN.md — Race tick engine (race.js extension + gameConfig constants + GameControls fix)
- [x] 03-02-PLAN.md — RaceTrack.vue component + App.vue swap + visual verification
**UI hint**: yes

### Phase 4: Results Panel
**Goal**: Race results appear sequentially in a Results panel — appended one entry per completed round, each labeled with round number and distance, listing the full 1st–10th finishing order — and the panel auto-scrolls to show the latest result.

**Yarış sonuçları, her tamamlanan tur için bir girdi eklenerek (tur numarası ve mesafe etiketiyle, tam 1.–10. bitiş sırası listelenerek) Sonuçlar panelinde sıralı görünür; panel en son sonucu göstermek için otomatik kayar.**

**Depends on**: Phase 3

**Requirements**: RESULT-01, RESULT-02, RESULT-03

**Success Criteria** (what must be TRUE / doğru olması gerekenler):
  1. Results panel is empty at the start of a new schedule and shows no pre-populated data / Yeni bir program başlangıcında Sonuçlar paneli boştur ve önceden doldurulmuş veri göstermez
  2. After each round completes (animation ends), a new result entry appears in the panel labeled "Round N — Xm" with the full 1st–10th finishing order shown / Her tur (animasyon) tamamlandıktan sonra, tam 1.–10. bitiş sırasıyla "Round N — Xm" etiketli yeni bir sonuç girdisi panelde görünür
  3. Results accumulate in chronological order — Round 1 at top, Round 6 at bottom — with no rounds skipped or duplicated / Sonuçlar kronolojik sırayla birikir — Round 1 üstte, Round 6 altta — atlanan veya tekrarlanan tur yok
  4. The results panel automatically scrolls to bring the most recently added result into view / Sonuçlar paneli, en son eklenen sonucu görünüme getirmek için otomatik kayar

**Plans:** 2/2 plans executed
Plans:
- [x] 04-01-PLAN.md — Store wiring: finish order derivation in onRoundComplete + clear results on Generate
- [x] 04-02-PLAN.md — ResultsPanel.vue component + App.vue swap + visual verification
**UI hint**: yes

### Phase 5: Tests
**Goal**: Vitest unit tests cover all Vuex store mutations, actions, and race-engine fairness; a Playwright E2E test covers the full generate → start → all rounds → results visible flow — and all tests pass.

**Vitest birim testleri tüm Vuex store mutasyonlarını, aksiyonlarını ve yarış motoru adilliğini kapsar; Playwright E2E testi tam generate → start → tüm turlar → sonuçlar görünür akışını kapsar — ve tüm testler geçer.**

**Depends on**: Phase 4

**Requirements**: TEST-01, TEST-02, TEST-03

**Success Criteria** (what must be TRUE / doğru olması gerekenler):
  1. `npm run test` (Vitest) passes with all store mutation tests green — every mutation in `horses`, `schedule`, `race`, and `results` modules has at least one test / `npm run test` (Vitest) tüm store mutasyon testleri yeşil geçer — her modüldeki her mutasyonun en az bir testi var
  2. The fairness test passes: in a 50-race simulation, the horse with the highest condition score finishes in the top 3 in more than 60% of races, confirming condition score meaningfully influences outcome / Adillik testi geçer: 50 yarış simülasyonunda en yüksek kondisyonlu at 50 yarışın %60'ından fazlasında ilk 3'te bitirir
  3. `npx playwright test` passes: the E2E test opens the app, clicks Generate, clicks Start, waits for all 6 rounds to complete, and asserts that 6 round result entries are visible in the Results panel / `npx playwright test` geçer: E2E testi uygulamayı açar, Generate'e tıklar, Start'a tıklar, 6 turun tamamlanmasını bekler ve Sonuçlar panelinde 6 tur sonuç girdisinin görünür olduğunu doğrular

**Plans:** 3/3 plans executed
Plans:
- [x] 05-01-PLAN.md â€” Vitest/Playwright infrastructure + shared store test helper
- [x] 05-02-PLAN.md â€” Vuex unit coverage + race-engine fairness test
- [x] 05-03-PLAN.md â€” Playwright full-flow regression + visual approval checkpoint

---

## Progress / İlerleme

**Execution Order / Yürütme Sırası:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase                   | Plans Complete | Status            | Completed |
|-------------------------|----------------|-------------------|-----------|
| 1. Foundation           | 2/2            | Complete          | -         |
| 2. Roster + Controls UI | 2/2            | Complete          | 2026-03-28 |
| 3. Animated Race Track  | 2/2 | Complete | 2026-03-29 |
| 4. Results Panel        | 2/2 | Complete | 2026-03-29 |
| 5. Tests                | 3/3            | Complete          | 2026-03-30 |

---

*Roadmap created / Yol haritası oluşturuldu: 2026-03-28 — Milestone v1.0*
