# Horse Racing Game / At Yarışı Oyunu

## What This Is / Proje Nedir

An interactive browser-based horse racing game built with Vue 3 and Vuex. Players manage a roster of 20 uniquely colored horses, generate a 6-round race schedule, watch animated races unfold round by round, and view sequential results — demonstrating clean component architecture and state management at scale.

Vue 3 ve Vuex ile geliştirilmiş, tarayıcı tabanlı interaktif bir at yarışı oyunu. Oyuncular 20 benzersiz renkli atın bulunduğu kadroyu yönetir, 6 turluk yarış programı oluşturur, turları animasyonlu olarak izler ve sonuçları sıralı biçimde görür. Temiz bileşen mimarisi ve büyük ölçekli state yönetimini sergiler.

## Core Value / Temel Değer

A complete, playable horse racing game where each race round runs visually and results appear sequentially as races conclude.

Her yarış turu görsel olarak işleyen ve sonuçların sıralı görüntülendiği, eksiksiz oynanabilir bir at yarışı oyunu.

## Current Milestone / Mevcut Milestone: v1.0 — Horse Racing Game / At Yarışı Oyunu

**Goal / Hedef:** Build the complete interactive horse racing game with animated races, Vuex state management, and component-based Vue 3 architecture — including unit and E2E tests.

Animasyonlu yarışlar, Vuex state yönetimi ve bileşen tabanlı Vue 3 mimarisiyle eksiksiz interaktif at yarışı oyununu geliştir — birim ve E2E testleri dahil.

**Target features / Hedef özellikler:**
- Horse roster: 20 horses with unique colors and condition scores (1–100) / At kadrosu: 20 at, benzersiz renk ve kondisyon puanı (1–100)
- Race schedule generator: 6 rounds, 10 random horses per round / Yarış programı üreteci: 6 tur, her turda 10 rastgele at
- Race engine: condition-weighted simulation, round lengths 1200–2200m / Yarış motoru: kondisyon ağırlıklı simülasyon, tur mesafeleri 1200–2200m
- Animated race track: horses visibly move during each round / Animasyonlu pist: her turda atlar görünür şekilde hareket eder
- Results panel: sequential display as each round concludes / Sonuçlar paneli: her tur bitiminde sıralı görüntüleme
- Vuex store: full state management for all game data / Vuex store: tüm oyun verisi için eksiksiz state yönetimi
- Component architecture: clean separation for maintainability / Bileşen mimarisi: bakım kolaylığı için temiz ayrım
- Unit tests (Vitest) and E2E tests (Playwright or Cypress) / Birim testleri (Vitest) ve E2E testleri (Playwright veya Cypress)

## Requirements / Gereksinimler

### Validated / Doğrulanmış

<!-- Shipped and confirmed valuable. / Gönderildi ve değeri onaylandı. -->

- [x] Race outcome is influenced by each horse's condition score / Yarış sonucu atların kondisyon puanından etkilenir *(Validated in Phase 1: Foundation — computeFinishOrder 94%+ win rate for high-condition horses)*
- [x] Vuex manages all game state (horses, schedule, current round, results) / Vuex tüm oyun durumunu yönetir *(Validated in Phase 1: Foundation — 4-module store with gamePhase FSM, build 0 errors)*
- [x] Player can view the full 20-horse roster with names, colors, and condition scores / Oyuncu 20 atlı kadroyu isim, renk ve kondisyon puanıyla görebilir *(Validated in Phase 2: Roster + Controls UI — HorseRoster + HorseRow components, browser-verified)*
- [x] Player can click Generate to create a 6-round race schedule (10 random horses per round) / Oyuncu Generate butonuyla 6 turluk yarış programı oluşturabilir *(Validated in Phase 2: Roster + Controls UI — GameControls dispatches schedule/generateSchedule, gamePhase FSM confirmed)*
- [x] Player can click Start to begin running races one round at a time / Oyuncu Start butonuyla yarışları tur tur başlatabilir *(Validated in Phase 2: Roster + Controls UI — Start button transitions gamePhase SCHEDULED→RACING, browser-verified)*

### Active / Aktif
- [x] Horses animate visually across the track during each round / Her turda atlar pist üzerinde görsel animasyonla hareket eder *(Validated in Phase 3: Animated Race Track — RaceTrack.vue with CSS transitions, auto-advance, browser-verified)*
- [x] Race results display sequentially in a Results panel as each round completes / Her tur tamamlandığında yarış sonuçları Sonuçlar panelinde sıralı görüntülenir *(Validated in Phase 4: Results Panel — ResultsPanel.vue with auto-scroll, finishOrder dispatch, browser-verified)*
- [x] Race outcome is influenced by each horse's condition score / Yarış sonucu atların kondisyon puanından etkilenir *(Validated in Phase 4: Results Panel — finishOrder derived by sorting horseIndices by condition descending)*
- [x] Vuex manages all game state (horses, schedule, current round, results) / Vuex tüm oyun durumunu yönetir *(Validated in Phase 4: Results Panel — results module wired with addRoundResult/clearResults actions)*
- [ ] Unit tests cover store logic and key components / Birim testleri store mantığını ve temel bileşenleri kapsar
- [ ] E2E tests cover the full generate → start → results flow / E2E testleri tam üret → başlat → sonuçlar akışını kapsar

### Out of Scope / Kapsam Dışı

- Multiplayer / online features — single-player only / Çok oyunculu / çevrimiçi özellikler — yalnızca tek oyunculu
- Persistent storage / backend — in-memory state only / Kalıcı depolama / arka uç — yalnızca bellek içi durum
- Horse breeding or progression — static roster for v1 / At üretme veya gelişim — v1 için sabit kadro
- Betting / wagering mechanics — not specified in requirements / Bahis mekanizmaları — gereksinimlerde belirtilmemiş
- Mobile-specific layout — desktop web focus / Mobil özel düzen — masaüstü web odaklı

## Context / Bağlam

- Existing project: Vue 3 + Vite scaffold already initialized / Mevcut proje: Vue 3 + Vite iskeleti hazır
- Assessment requires Vuex for state management (Vuex 4 for Vue 3) / Değerlendirme Vuex gerektiriyor (Vue 3 için Vuex 4)
- 20 horses with unique colors — requires a predefined palette of 20 distinct colors / 20 at, benzersiz renk — 20 farklı renkten oluşan önceden tanımlı palet gerektirir
- Condition score (1–100) influences race outcome probability, not just speed / Kondisyon puanı (1–100) yalnızca hızı değil yarış sonucu olasılığını etkiler
- Round distances increase each round: 1200m → 1400m → 1600m → 1800m → 2000m → 2200m / Tur mesafeleri her turda artar
- Bonus: Vitest unit tests + Playwright (or Cypress) E2E tests / Bonus: Vitest birim testleri + Playwright (veya Cypress) E2E testleri

## Constraints / Kısıtlamalar

- **Tech Stack / Teknoloji**: Vue 3 + Vuex 4 + Vite — required by assessment / değerlendirme gereği
- **Horses / Atlar**: Exactly 20 horses, exactly 10 selected per round — hard rule / Tam 20 at, her turda tam 10 seçim — kesin kural
- **Rounds / Turlar**: Exactly 6 rounds per schedule — hard rule / Program başına tam 6 tur — kesin kural
- **Testing / Test**: Vitest for unit tests (Vite ecosystem); Playwright or Cypress for E2E / Birim testleri için Vitest; E2E için Playwright veya Cypress

## Key Decisions / Temel Kararlar

| Decision / Karar | Rationale / Gerekçe | Outcome / Sonuç |
|----------|-----------|---------|
| Vue 3 over Vue 2 | Already installed; modern, active ecosystem / Zaten kurulu; modern, aktif ekosistem | — Pending |
| Vuex 4 for state | Required by assessment spec / Değerlendirme şartnamesi gereği | — Pending |
| Vitest for unit tests | Native Vite integration, fast / Yerel Vite entegrasyonu, hızlı | — Pending |
| Condition score weighting | Determines race outcome probability / Yarış sonucu olasılığını belirler | — Pending |

## Evolution / Evrim

This document evolves at phase transitions and milestone boundaries.
Bu belge faz geçişlerinde ve milestone sınırlarında güncellenir.

**After each phase transition / Her faz geçişinden sonra** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason / Gereksinimler geçersiz mi? → Nedeniyle Kapsam Dışı'na taşı
2. Requirements validated? → Move to Validated with phase reference / Doğrulandı mı? → Faz referansıyla Doğrulanmış'a taşı
3. New requirements emerged? → Add to Active / Yeni gereksinimler ortaya çıktı mı? → Aktif'e ekle
4. Decisions to log? → Add to Key Decisions / Kaydedilecek kararlar mı? → Temel Kararlara ekle
5. "What This Is" still accurate? → Update if drifted / "Proje Nedir" hâlâ doğru mu? → Sapmışsa güncelle

**After each milestone / Her milestone'dan sonra** (via `/gsd:complete-milestone`):
1. Full review of all sections / Tüm bölümlerin tam incelemesi
2. Core Value check — still the right priority? / Temel Değer kontrolü — hâlâ doğru öncelik mi?
3. Audit Out of Scope — reasons still valid? / Kapsam Dışı denetimi — nedenler hâlâ geçerli mi?
4. Update Context with current state / Bağlamı mevcut durumla güncelle

---
*Last updated / Son güncelleme: 2026-03-29 — Phase 4 (Results Panel) complete / Faz 4 tamamlandı*
