# Project Research Summary / Proje Araştırma Özeti

**Project / Proje:** Horse Racing Game / At Yarışı Oyunu
**Domain / Alan:** Browser-based interactive game — Vue 3 + Vuex 4 / Tarayıcı tabanlı interaktif oyun
**Researched / Araştırıldı:** 2026-03-28
**Confidence / Güven:** HIGH

---

## Executive Summary / Yürütme Özeti

This is a browser-based horse racing simulation — an assessment project demonstrating clean Vue 3 component architecture and Vuex 4 state management. Expert approach: keep all game logic (race engine, schedule generation, result accumulation) in Vuex modules; restrict components to dispatching actions and rendering state. The race animation uses CSS `transform: translateX()` driven by reactive Vuex `positions` state, not GSAP or `<Transition>` — both are wrong tools for continuous positional movement.

Bu, temiz Vue 3 bileşen mimarisini ve Vuex 4 state yönetimini sergileyen bir tarayıcı tabanlı at yarışı simülasyonudur. Uzman yaklaşımı: tüm oyun mantığını (yarış motoru, program üretimi, sonuç birikimi) Vuex modüllerinde tutmak; bileşenleri yalnızca aksiyon gönderme ve state render etme ile sınırlamaktır. Yarış animasyonu, GSAP veya `<Transition>` değil — her ikisi de sürekli konumsal hareket için yanlış araçtır — reaktif Vuex `positions` state'i tarafından yönlendirilen CSS `transform: translateX()` kullanır.

The primary risk is timer management: a `setInterval` started inside a Vuex action must be cleared at race completion, on new schedule generation, and on component unmount. Failing this produces ghost intervals that stack on re-start clicks and corrupt `currentRound`. The second risk is reactivity overload: committing one mutation per horse per tick (10 mutations/tick) causes Vue's scheduler to fall behind and horses to teleport rather than slide. Both risks have clear, low-effort solutions documented in PITFALLS.md.

En büyük risk zamanlayıcı yönetimidir: Vuex aksiyonu içinde başlatılan bir `setInterval`, yarış bitiminde, yeni program üretiminde ve bileşen unmount'unda temizlenmelidir. Aksi hâlde hayalet interval'lar yeniden başlatma tıklamalarında birikir ve `currentRound` değerini bozar. İkinci risk reaktivite aşırı yüklenmesidir: her tick'te at başına bir mutasyon commit etmek (10 mutasyon/tick) Vue scheduler'ının geride kalmasına ve atların kayarak değil ışınlanarak hareket etmesine yol açar. Her iki riskin de net, düşük eforlu çözümleri PITFALLS.md'de belgelenmiştir.

---

## Key Findings / Temel Bulgular

### 1. Stack Additions / Teknoloji Eklemeleri

The Vue 3 + Vite scaffold is already initialized. Add the following packages only — nothing else is needed.

Vue 3 + Vite iskeleti hazır. Yalnızca aşağıdaki paketleri ekleyin — başka hiçbir şey gerekmez.

```bash
# Runtime / Çalışma zamanı
npm install vuex@^4.1.0 gsap@^3.14.2 nanoid@^5.1.7

# Unit testing / Birim testleri
npm install -D vitest@^4.1.2 @vue/test-utils@^2.4.6 jsdom@^29.0.1 @vitest/coverage-v8@^4.1.2

# E2E testing / E2E testleri
npm install -D @playwright/test@^1.58.2
npx playwright install chromium
```

**Exact versions verified against npm registry (2026-03-28) / Sürümler npm kayıt defterinde doğrulandı:**

| Package | Version | Role / Rol |
|---------|---------|------------|
| vuex | 4.1.0 | State management — assessment requirement / State yönetimi — değerlendirme zorunluluğu |
| gsap | 3.14.2 | Optional; CSS transitions preferred for animation / CSS geçişleri animasyon için tercih edilir |
| nanoid | 5.1.7 | Horse unique IDs / At benzersiz kimlikleri |
| vitest | 4.1.2 | Unit testing — Vite-native / Birim testleri |
| @vue/test-utils | 2.4.6 | Component mount helpers / Bileşen mount yardımcıları |
| jsdom | 29.0.1 | DOM environment for Vitest / Vitest için DOM ortamı |
| @vitest/coverage-v8 | 4.1.2 | Coverage reporting / Kapsam raporlama |
| @playwright/test | 1.58.2 | E2E testing / E2E testleri |

**Do NOT add / Eklenmeyecekler:** pinia, lodash, vue-router, tailwindcss, cypress, axios.

---

### 2. Architecture Decisions / Mimari Kararlar

Four Vuex modules with strict separation of concerns. Never store `setInterval` IDs, DOM refs, or animation state in Vuex — use module-scope closures for timer references.

Dört Vuex modülü, katı sorumluluk ayrımıyla. `setInterval` ID'lerini, DOM ref'lerini veya animasyon state'ini asla Vuex'e koymayın — zamanlayıcı referansları için modül kapsamlı kapanışlar kullanın.

**Vuex Module Split / Vuex Modül Yapısı:**

| Module | Key State | Responsibility |
|--------|-----------|----------------|
| `horses` | `list: Horse[]` | 20-horse roster, generated once at init / 20 atlı kadro |
| `schedule` | `rounds: Round[]`, `generated: boolean` | 6-round schedule, 10 horses + distance each / 6 turluk program |
| `race` | `currentRound`, `gamePhase`, `positions`, `finishOrder` | Race tick loop, state machine / Yarış döngüsü, durum makinesi |
| `results` | `rounds: RoundResult[]` | Append-only results, one entry per completed round / Tamamlanan tur sonuçları |

**gamePhase state machine / gamePhase durum makinesi:**
`IDLE → SCHEDULED → RACING → ROUND_COMPLETE → DONE → IDLE`

**Component Tree / Bileşen Ağacı:**
```
App.vue
├── GameControls.vue          // Buttons + round indicator / Butonlar + tur göstergesi
├── HorseList.vue             // 20-horse roster panel
│   └── HorseCard.vue         // Name, color swatch, condition score / İsim, renk, puan
├── RaceView.vue              // Race track area / Pist alanı
│   ├── RoundInfo.vue         // Current round metadata / Mevcut tur bilgisi
│   └── RaceTrack.vue         // Animated lanes / Animasyonlu şeritler
│       └── HorseLane.vue     // Single animated lane / Tek animasyonlu şerit
└── ResultsPanel.vue          // All round results
    └── RoundResult.vue       // Single round rank table / Tek tur sıralama tablosu
```

**Build Order (recommended) / Önerilen İnşa Sırası:**
1. `src/assets/horses.js` — horse names + 20-color palette
2. `src/utils/shuffle.js` — Fisher-Yates (10 lines, no lodash)
3. `src/utils/raceEngine.js` — weighted random finish order (pure function)
4. Vuex modules: `horses` → `schedule` → `race` → `results` → `index.js`
5. `HorseCard` + `HorseList` — roster display
6. `GameControls` — wired to `gamePhase`
7. `HorseLane` → `RaceTrack` → `RoundInfo` → `RaceView` — animation layer
8. `RoundResult` + `ResultsPanel` — results display
9. `App.vue` — final composition
10. `vitest.config.js` → unit tests → Playwright E2E

**Race tick formula / Yarış tick formülü:**
```
baseStep = distance / 1000
conditionMultiplier = score / 50   // 1.0 at score 50; range 0.02–2.0
randomVariance = Math.random() * 0.5
stepSize = baseStep * conditionMultiplier + randomVariance
```

**Animation binding in HorseLane.vue:**
```vue
:style="{
  transform: `translateX(${progress}%)`,
  transition: `transform ${transitionDuration}s linear`
}"
```
Use `transform: translateX()`, not `left` — GPU-composited, avoids layout recalculation.

---

### 3. Feature Table Stakes / Temel Özellikler (Assessment Must-Haves)

Everything below will be directly checked by the evaluator. None are optional.

Aşağıdakilerin tamamı değerlendirici tarafından doğrudan kontrol edilecektir. Hiçbiri isteğe bağlı değildir.

| Feature / Özellik | Detail / Detay |
|---------|----------------|
| 20-horse roster | Names, unique colors, condition scores 1–100 / İsimler, benzersiz renkler, kondisyon 1–100 |
| Generate button | Produces exactly 6 rounds, 10 random horses each, distances 1200–2200m / 6 tur, 10 at, mesafeler |
| Start button | Runs rounds sequentially, one at a time / Turları sıralı çalıştırır |
| Animated movement | Horses visibly move; speed tied to conditionScore / Görünür hareket, hız kondisyona bağlı |
| Sequential results | Results panel appends after each round, labeled "Round N — Xm" / Her tur sonunda eklenir |
| Condition influence | Race outcome probability weighted by conditionScore / Sonuç olasılığı kondisyona göre ağırlıklı |
| Vuex for ALL state | No component-local game data (no `ref()` for game logic) / Bileşende yerel oyun verisi yok |
| Component separation | Logical split matching architecture above / Yukarıdaki mimariye uygun ayrım |
| Unit tests (Vitest) | Store mutations, race engine, fairness distribution / Store mutasyonları, yarış motoru |
| E2E test (Playwright) | Full generate → start → round 1 result visible / Tam akış |

**Differentiators (good vs. great) / İyiyi mükemmelden ayıran:**
- `gamePhase` state machine driving all button disabled states cleanly
- conditionScore visibly reflected as lane speed, not just outcome probability
- Horse colors consistent from roster → race lane → results table
- Per-round countdown / auto-advance between rounds

**Defer to v2+ / v2'ye Ertelenenler:** betting, localStorage, mobile layout, multiplayer.

---

### 4. Top 5 Pitfalls / En Yüksek Riskli 5 Tuzak

**P1 — setInterval leak from Vuex action / Vuex aksiyonundan setInterval sızıntısı** (CRITICAL)
Store the interval ID in Vuex state (`raceIntervalId`). Dispatch a `stopRace` action at 3 call sites: round completion, new schedule generation, and `onUnmounted`. Disable Start button while racing to prevent stacked intervals.

Interval ID'sini Vuex state'inde saklayın (`raceIntervalId`). `stopRace` aksiyonunu 3 noktada dispatch edin: tur tamamlama, yeni program üretimi ve `onUnmounted`. Çakışan interval'ları önlemek için yarış sırasında Start butonunu devre dışı bırakın.

**P2 — 10 mutations/tick overloads Vue reactivity / Her tick 10 mutasyon Vue reaktivitesini zorlar** (CRITICAL)
Batch all position updates into a single `UPDATE_ALL_POSITIONS` mutation per tick. Set tick interval no faster than 200ms — visual smoothness comes from CSS transitions, not tick frequency.

Tüm konum güncellemelerini tek bir `UPDATE_ALL_POSITIONS` mutasyonuna toplu gönderin. Tick aralığını 200ms'den hızlı ayarlamayın — görsel akıcılık CSS geçişlerinden gelir.

**P3 — CSS transition duration shorter than tick interval / CSS geçiş süresi tick aralığından kısa** (CRITICAL)
Tick interval MUST be >= CSS transition duration. These are one design decision, not two. Recommended: tick=200ms, transition=180ms.

Tick aralığı CSS geçiş süresinden büyük veya eşit OLMALIDIR. Bunlar tek bir tasarım kararıdır. Önerilen: tick=200ms, geçiş=180ms.

**P4 — Vue.set() called in Vue 3 / Vue 3'te Vue.set() çağrısı** (HIGH)
Initialize all 20 horse position keys at store creation: `state.positions = Object.fromEntries(horses.map(h => [h.id, 0]))`. Direct assignment `state.positions[horseId] = val` is safe and reactive in Vue 3 — no `Vue.set()` needed.

Tüm 20 at konum anahtarını store oluşturulurken başlatın. Vue 3'te doğrudan atama reaktiftir — `Vue.set()` gerekmez.

**P5 — Vitest fake timers + nextTick deadlock / Vitest sahte zamanlayıcıları + nextTick kilidi** (HIGH)
`vi.advanceTimersByTime()` runs synchronously; Vue DOM updates are microtask-based. Always `await nextTick()` after advancing timers in tests. Write a shared `mountWithStore` helper and timer-test helper before writing any tests.

`vi.advanceTimersByTime()` senkron çalışır; Vue DOM güncellemeleri mikro-görev tabanlıdır. Testlerde zamanlayıcıları ilerletirken her zaman `await nextTick()` kullanın.

**Additional assessment-specific risks / Ek değerlendirme riskleri:**
- A2: Race logic in components instead of Vuex — instant fail / Yarış mantığı bileşenlerde — anında başarısız
- A3: Magic numbers scattered — extract to `GAME_CONFIG` constant object / Sihirli sayılar — sabite çıkarın
- A6: Results not labeled by round number — evaluator cannot verify sequential display / Tur numarasız sonuçlar

---

### 5. Key Implementation Notes / Önemli Uygulama Notları

These facts would surprise a developer coming in cold / Bu gerçekler hazırlıksız bir geliştiriciyi şaşırtır:

1. **GSAP is listed in STACK.md but is NOT the recommended animation approach.** CSS transitions driven by Vuex `positions` state are simpler, more Vue-native, and directly reactive. GSAP is listed as an available tool but the research explicitly recommends CSS transitions over it for this use case.

   GSAP STACK.md'de listelenmiş, ancak önerilen animasyon yaklaşımı DEĞİLDİR. Vuex `positions` state'i tarafından yönlendirilen CSS geçişleri daha basit ve Vue-native'dir.

2. **Condition score affects BOTH animation speed AND finish probability.** These are two separate mechanics: (a) `stepSize` in the race tick loop uses `conditionScore` to determine per-tick progress, (b) a separate weighted random `raceEngine.js` function computes final finish order. They must agree — if animation speed predicts outcome perfectly, the weighted random becomes cosmetic.

   Kondisyon puanı hem animasyon hızını hem de bitiş olasılığını etkiler. Bunlar iki ayrı mekanizmadır.

3. **`raceInterval` must live in module-scope closure, NOT in Vuex state directly as a function/timer.** It can be stored as a nullable ID in state for cleanup, but the actual `setInterval()` reference must be in module scope. This is standard Vuex practice.

   `raceInterval` modül kapsamında yaşamalıdır, doğrudan Vuex state'inde değil.

4. **`v-for` key must be `horse.id`, never array index.** Using `:key="index"` causes Vue to reuse DOM nodes on schedule regeneration, firing CSS transitions on the wrong horse elements.

   `v-for` anahtarı `horse.id` olmalıdır, asla dizi indeksi değil.

5. **Results must be EMPTY at generate time and APPENDED one-by-one as rounds complete.** Pre-computing all 6 results at generation time violates the "sequential display" requirement. The `ADD_ROUND_RESULT` mutation fires only when a round's animation ends.

   Sonuçlar üretim anında boş olmalı ve her tur tamamlandıkça tek tek eklenmelidir.

6. **E2E tests need extended timeouts.** Default Playwright 5s timeout < race animation duration (~6s+). Use `{ timeout: 15000 }` on result selectors. Add `data-testid` attributes to results, controls, and round indicators.

   E2E testleri uzatılmış zaman aşımı gerektirir. Varsayılan 5 sn < animasyon süresi.

7. **20 distinct horse colors must be manually curated.** Algorithmic HSL generation often produces indistinguishable adjacent hues. Test all 20 on a white background before finalizing the palette.

   20 farklı at rengi manuel olarak seçilmelidir — algoritmik üretim benzer tonlar verebilir.

---

## Implications for Roadmap / Yol Haritası İçin Çıkarımlar

### Phase 1: Foundation — Store + Data Models / Temel — Store + Veri Modelleri
**Rationale:** All UI components are derived views of Vuex state. Store must exist before any component can be built meaningfully. Timer safety architecture must be embedded here — retrofitting it later is error-prone.
**Delivers:** Working Vuex store with all 4 modules, horse data, shuffle + race engine utilities.
**Addresses:** Roster display (data model), Generate logic, race simulation logic.
**Avoids:** P1 (setInterval leak), P4 (Vue.set), A2 (logic in components), A3 (magic numbers).

### Phase 2: Roster + Controls UI / Kadro + Kontrol Arayüzü
**Rationale:** Roster is pure display (no animation, no timing risk). GameControls wires buttons to gamePhase — proves the state machine works before animation complicates debugging.
**Delivers:** HorseList, HorseCard, GameControls — visible 20-horse roster, functional Generate button.
**Uses:** `horses` + `schedule` Vuex modules, `gamePhase` getter.
**Avoids:** P11 (v-for index key), A4 (indistinguishable colors), A5 (no button guard).

### Phase 3: Animated Race Track / Animasyonlu Yarış Pisti
**Rationale:** Highest complexity; depends on store being stable. Tick + CSS transition timing must be decided as a unit here (P3). Batch mutation pattern (P2) implemented here.
**Delivers:** RaceTrack, HorseLane, RoundInfo, RaceView — horses animate, rounds auto-advance.
**Uses:** `race` Vuex module, `positions` state, CSS `transform: translateX()`.
**Avoids:** P2 (reactivity overload), P3 (transition/tick mismatch), P7 (results before animation ends), P10 (lane overlap).

### Phase 4: Results Panel / Sonuçlar Paneli
**Rationale:** Depends on race completing cleanly (Phase 3). Results are append-only — simplest display concern, deferred until animation is proven stable.
**Delivers:** ResultsPanel, RoundResult — sequential display of all 6 round results with round labels.
**Avoids:** P12 (results pre-populated), A6 (no round labels).

### Phase 5: Tests / Testler
**Rationale:** Tests validate correctness of Phases 1–4. Write `mountWithStore` helper and fake timer helper first to avoid P5/P6 in every test file.
**Delivers:** Vitest unit tests (store mutations, race engine, fairness distribution over 50 races), Playwright E2E (generate → start → round 1 result visible).
**Avoids:** P5 (nextTick deadlock), P6 (useStore undefined), P8/P9 (condition score miscalibration), A1 (trivial tests), P16 (E2E timeout).

### Phase Ordering Rationale / Sıralama Gerekçesi

- Store before components: every component is a derived view; building UI before store leads to local state that must be migrated
- Roster before race: pure display, fast to build, validates data models before animation risk
- Animation after store is stable: timing bugs in Phase 3 are isolatable when store is known-good
- Results after animation: results correctness depends on round completion signal from race module
- Tests last but informed throughout: test helpers written in Phase 1; unit tests alongside each module; E2E after full flow exists

### Research Flags / Araştırma Bayrakları

**Standard patterns (skip phase research) / Standart kalıplar (faz araştırması atla):**
- Phase 1: Vuex 4 module patterns are well-documented; store structure fully specified in ARCHITECTURE.md
- Phase 2: Vue 3 component/binding patterns are standard
- Phase 4: Vuex `watch` + `nextTick` scroll pattern is documented in FEATURES.md

**May benefit from quick research during planning / Planlama sırasında araştırma önerilir:**
- Phase 3: CSS transition timing calibration for smooth 10-horse animation — worth a quick prototype before committing to tick interval value
- Phase 5: Playwright selector strategy for animated elements — `data-testid` placement needs thought upfront

---

## Confidence Assessment / Güven Değerlendirmesi

| Area / Alan | Confidence / Güven | Notes / Notlar |
|-------------|-------------------|----------------|
| Stack | HIGH | All versions verified against npm registry 2026-03-28 |
| Features | HIGH for Vue/Vuex patterns; MEDIUM for game-mechanic conventions | Race engine fairness target (65–75% win rate for top horse) is a judgment call |
| Architecture | HIGH | Module boundaries, component tree, build order all internally consistent |
| Pitfalls | HIGH for Vue 3/Vuex 4 API behavior; MEDIUM for assessment heuristics | Assessment scoring criteria inferred, not sourced directly |

**Overall confidence / Genel güven:** HIGH

### Gaps to Address / Giderilecek Boşluklar

- **Color palette:** 20 distinct colors must be chosen manually and tested visually — no algorithmic solution confirmed. Resolve during Phase 2.
- **Condition score calibration:** Target win-rate range (65–75% for top horse vs. bottom) is a recommendation, not a requirement. Validate with the 50-race unit test in Phase 5.
- **Race animation duration:** Total per-round animation time depends on tick interval × steps needed. Needs a quick prototype in Phase 3 to confirm durations feel right (target: ~5–8 seconds per round).
- **E2E timeout values:** Actual animation durations affect Playwright `waitForSelector` timeout values. Set conservatively (15s) in Phase 5.

---

## Sources / Kaynaklar

### Primary (HIGH confidence / Yüksek güven)
- npm registry — package versions and peer dependency compatibility (2026-03-28)
- Vue 3 official docs — reactivity, `nextTick`, `<Transition>`, `v-for` key behavior
- Vuex 4 official docs — module structure, strict mode, action/mutation patterns
- Vitest official docs — `vi.useFakeTimers`, `vi.advanceTimersByTime`, coverage config
- Playwright official docs — `waitForSelector`, timeout configuration, `data-testid` selectors

### Secondary (MEDIUM confidence / Orta güven)
- Community consensus on CSS `transform: translateX()` vs `left` for GPU-composited animation
- Assessment heuristics for what evaluators check in Vue + Vuex submissions

---

*Research completed / Araştırma tamamlandı: 2026-03-28*
*Ready for roadmap / Yol haritasına hazır: yes*
