# Horse Racing Game / At Yarisi Oyunu

## What This Is / Proje Nedir

An interactive browser-based horse racing game built with Vue 3 and Vuex. Players manage a roster of 20 uniquely colored horses, generate a 6-round race schedule, watch animated races unfold round by round, and view sequential results. The v1 milestone also includes Vitest unit coverage and a Playwright end-to-end regression flow.

Vue 3 ve Vuex ile gelistirilmis, tarayici tabanli interaktif bir at yarisi oyunu. Oyuncular 20 benzersiz renkli atin bulundugu kadroyu yonetir, 6 turluk yaris programi olusturur, turlari animasyonlu olarak izler ve sonuclari sirali bicimde gorur. v1 milestone kapsaminda ayrica Vitest birim kapsami ve Playwright uctan uca regresyon akisi da tamamlanmistir.

## Core Value / Temel Deger

A complete, playable horse racing game where each race round runs visually and results appear sequentially as races conclude.

Her yaris turu gorsel olarak isleyen ve sonuclarin sirali goruntulendigi, eksiksiz oynanabilir bir at yarisi oyunu.

## Current Milestone / Mevcut Milestone: v1.0 - Horse Racing Game / At Yarisi Oyunu

**Goal / Hedef:** Build the complete interactive horse racing game with animated races, Vuex state management, and component-based Vue 3 architecture, including unit and E2E tests.

Animasyonlu yarislar, Vuex state yonetimi ve bilesen tabanli Vue 3 mimarisiyle eksiksiz interaktif at yarisi oyununu gelistir; birim ve E2E testleri dahil.

**Target features / Hedef ozellikler:**
- Horse roster: 20 horses with unique colors and condition scores (1-100) / At kadrosu: 20 at, benzersiz renk ve kondisyon puani (1-100)
- Race schedule generator: 6 rounds, 10 random horses per round / Yaris programi uretici: 6 tur, her turda 10 rastgele at
- Race engine: condition-weighted simulation, round lengths 1200-2200m / Yaris motoru: kondisyon agirlikli simulasyon, tur mesafeleri 1200-2200m
- Animated race track: horses visibly move during each round / Animasyonlu pist: her turda atlar gorunur sekilde hareket eder
- Results panel: sequential display as each round concludes / Sonuclar paneli: her tur bitiminde sirali goruntuleme
- Vuex store: full state management for all game data / Vuex store: tum oyun verisi icin eksiksiz state yonetimi
- Component architecture: clean separation for maintainability / Bilesen mimarisi: bakim kolayligi icin temiz ayrim
- Unit tests (Vitest) and E2E tests (Playwright) / Birim testleri (Vitest) ve E2E testleri (Playwright)

## Requirements / Gereksinimler

### Validated / Dogrulanmis

- [x] Race outcome is influenced by each horse's condition score / Yaris sonucu atlarin kondisyon puanindan etkilenir
- [x] Vuex manages all game state (horses, schedule, current round, results) / Vuex tum oyun durumunu yonetir
- [x] Player can view the full 20-horse roster with names, colors, and condition scores / Oyuncu 20 atlik kadroyu isim, renk ve kondisyon puaniyla gorebilir
- [x] Player can click Generate to create a 6-round race schedule (10 random horses per round) / Oyuncu Generate ile 6 turluk yaris programi olusturabilir
- [x] Player can click Start to begin running races one round at a time / Oyuncu Start ile yarislari tur tur baslatabilir
- [x] Horses animate visually across the track during each round / Her turda atlar pist uzerinde gorsel animasyonla hareket eder
- [x] Race results display sequentially in a Results panel as each round completes / Her tur tamamlandiginda yaris sonuclari Sonuclar panelinde sirali goruntulenir
- [x] Unit tests cover store logic and race fairness logic / Birim testleri store mantigini ve yaris adaleti mantigini kapsar
- [x] E2E tests cover the full generate -> start -> results flow / E2E testleri tam generate -> start -> sonuclar akisini kapsar

### Active / Aktif

- [x] v1.0 milestone complete / v1.0 milestone tamamlandi

### Out of Scope / Kapsam Disi

- Multiplayer / online features - single-player only / Cok oyunculu / cevrimici ozellikler - yalnizca tek oyunculu
- Persistent storage / backend - in-memory state only / Kalici depolama / arka uc - yalnizca bellek ici durum
- Horse breeding or progression - static roster for v1 / At uretme veya gelisim - v1 icin sabit kadro
- Betting / wagering mechanics - not specified in requirements / Bahis mekanizmalari - gereksinimlerde belirtilmemis
- Mobile-specific layout - desktop web focus / Mobil ozel duzen - masaustu web odakli

## Context / Baglam

- Existing project: Vue 3 + Vite scaffold already initialized / Mevcut proje: Vue 3 + Vite iskeleti hazir
- Assessment requires Vuex for state management (Vuex 4 for Vue 3) / Degerlendirme Vuex gerektiriyor (Vue 3 icin Vuex 4)
- 20 horses with unique colors require a predefined palette of 20 distinct colors / 20 at, benzersiz renk icin 20 farkli renkten olusan onceden tanimli palet gerekir
- Condition score (1-100) influences race outcome probability and visual speed ordering / Kondisyon puani (1-100) yaris sonucu olasiligini ve gorsel hiz siralamasini etkiler
- Round distances increase each round: 1200m -> 1400m -> 1600m -> 1800m -> 2000m -> 2200m / Tur mesafeleri her turda artar
- Testing stack is finalized as Vitest + Playwright / Test yigininin Vitest + Playwright olarak netlestigi

## Constraints / Kisıtlamalar

- **Tech Stack / Teknoloji**: Vue 3 + Vuex 4 + Vite - required by assessment / degerlendirme geregi
- **Horses / Atlar**: Exactly 20 horses, exactly 10 selected per round - hard rule / Tam 20 at, her turda tam 10 secim - kesin kural
- **Rounds / Turlar**: Exactly 6 rounds per schedule - hard rule / Program basina tam 6 tur - kesin kural
- **Testing / Test**: Vitest for unit tests, Playwright for E2E / Birim testleri icin Vitest, E2E icin Playwright

## Key Decisions / Temel Kararlar

| Decision / Karar | Rationale / Gerekce | Outcome / Sonuc |
|----------|-----------|---------|
| Vue 3 over Vue 2 | Already installed; modern, active ecosystem / Zaten kurulu; modern, aktif ekosistem | Adopted |
| Vuex 4 for state | Required by assessment spec / Degerlendirme sartnamesi geregi | Adopted |
| Vitest for unit tests | Native Vite integration, fast / Yerel Vite entegrasyonu, hizli | Adopted |
| Playwright for E2E | Stable browser automation with built-in webServer support / Dahili webServer destegiyle kararlı tarayici otomasyonu | Adopted |
| Condition-driven race loop | Clear visual feedback and deterministic round playback / Net gorsel geri bildirim ve deterministik tur akisi | Adopted |

## Evolution / Evrim

This document evolves at phase transitions and milestone boundaries.
Bu belge faz gecislerinde ve milestone sinirlarinda guncellenir.

**After each phase transition / Her faz gecisinden sonra:**
1. Requirements invalidated? -> Move to Out of Scope with reason / Gereksinimler gecersiz mi? -> Nedeniyle Kapsam Disi'na tasi
2. Requirements validated? -> Move to Validated with phase reference / Dogrulandi mi? -> Faz referansiyla Dogrulanmis'a tasi
3. New requirements emerged? -> Add to Active / Yeni gereksinimler ortaya cikti mi? -> Aktif'e ekle
4. Decisions to log? -> Add to Key Decisions / Kaydedilecek kararlar mi? -> Temel Kararlara ekle
5. "What This Is" still accurate? -> Update if drifted / "Proje Nedir" hala dogru mu? -> Saptiysa guncelle

**After each milestone / Her milestone'dan sonra:**
1. Full review of all sections / Tum bolumlerin tam incelemesi
2. Core Value check - still the right priority? / Temel Deger kontrolu - hala dogru oncelik mi?
3. Audit Out of Scope - reasons still valid? / Kapsam Disi denetimi - nedenler hala gecerli mi?
4. Update Context with current state / Baglami mevcut durumla guncelle

---
*Last updated / Son guncelleme: 2026-03-30 - Phase 5 complete; v1.0 milestone complete / Faz 5 tamamlandi; v1.0 milestone tamamlandi*
