# Requirements / Gereksinimler: Horse Racing Game / At Yarisi Oyunu

**Defined / Tanimlandi:** 2026-03-28
**Core Value / Temel Deger:** Her yaris turu gorsel olarak isleyen ve sonuclarin sirali goruntulendigi, eksiksiz oynanabilir bir at yarisi oyunu. / A complete, playable horse racing game where each race round runs visually and results appear sequentially.

---

## v1 Requirements / v1 Gereksinimleri

### Roster / At Kadrosu

- [x] **ROST-01**: Player can view all 20 horses with name, unique color, and condition score (1-100) / Oyuncu 20 atin tamamini isim, benzersiz renk ve kondisyon puaniyla gorebilir
- [x] **ROST-02**: Each horse is displayed with a distinct color swatch in the roster panel / Her at kadro panelinde benzersiz renk gostergesiyle listelenir
- [x] **ROST-03**: Horse condition score badge is visible on the race track during each round / Kondisyon puani rozeti her turda pist uzerinde gorunur

### Schedule / Yaris Programi

- [x] **SCHED-01**: Player can click Generate to create a 6-round race schedule / Oyuncu Generate ile 6 turluk yaris programi olusturabilir
- [x] **SCHED-02**: Each round randomly selects 10 horses from the 20-horse roster / Her tur 20 attan rastgele 10 at secer
- [x] **SCHED-03**: Round distances are fixed in sequence: 1200m -> 1400m -> 1600m -> 1800m -> 2000m -> 2200m / Tur mesafeleri sirali ve sabit
- [x] **SCHED-04**: Generate button is disabled while a race is in progress / Yaris devam ederken Generate devre disi

### Race Engine / Yaris Motoru

- [x] **RACE-01**: Player can click Start to begin racing rounds one at a time / Oyuncu Start ile yarislari tur tur baslatabilir
- [x] **RACE-02**: Race outcome is influenced by each horse's condition score (weighted probability) / Yaris sonucu kondisyon puanindan etkilenir (agirlikli olasilik)
- [x] **RACE-03**: Rounds advance automatically after a brief pause when one completes / Tur bitiminde kisa bekleme sonrasi sonraki tur otomatik baslar
- [x] **RACE-04**: Start button is disabled after racing begins until all 6 rounds complete / Yaris basladiktan sonra Start tum turlar bitene kadar devre disi

### Animation / Animasyon

- [x] **ANIM-01**: Horses visibly move across the track via CSS transitions during each round / Her turda atlar CSS gecisiyle pist uzerinde gorunur hareket eder
- [x] **ANIM-02**: Each horse races in its own dedicated lane with no visual overlap / Her at ayri seridinde yarisir; ust uste binme yok
- [x] **ANIM-03**: Current round number, distance, and participating horses are shown during the race / Aktif tur numarasi, mesafe ve katilimci atlar yaris sirasinda gosterilir

### Results / Sonuclar

- [x] **RESULT-01**: Race results appear sequentially in the Results panel as each round concludes / Her tur bitiminde sonuclar sirali olarak Sonuclar panelinde gorunur
- [x] **RESULT-02**: Each result entry shows round number, distance, and full finishing order (1st-10th) / Her sonuc tur no., mesafe ve tam bitis siralamasini (1.-10.) gosterir
- [x] **RESULT-03**: Results panel auto-scrolls to the latest result / Sonuclar paneli en son sonuca otomatik kayar

### State Management / Durum Yonetimi

- [x] **STATE-01**: Vuex manages all game state (horses, schedule, current round, race positions, results) / Vuex tum oyun durumunu yonetir (atlar, program, mevcut tur, konum, sonuclar)
- [x] **STATE-02**: All race simulation logic lives in Vuex actions, not in components / Tum yaris simulasyon mantigi Vuex aksiyonlarinda, bilesenlerde degil
- [x] **STATE-03**: A gamePhase state machine (IDLE -> SCHEDULED -> RACING -> ROUND_COMPLETE -> DONE) controls all UI gates / gamePhase durum makinesi tum UI gecislerini yonetir

### Tests / Testler

- [x] **TEST-01**: Vitest unit tests cover all Vuex store mutations and actions / Vitest birim testleri tum Vuex store mutation ve aksiyonlarini kapsar
- [x] **TEST-02**: Vitest fairness test: condition score meaningfully influences race results (50-race simulation) / Kondisyon puaninin yaris sonucunu anlamli bicimde etkiledigini dogrulayan 50 yaris simulasyon testi
- [x] **TEST-03**: Playwright E2E test covers the full generate -> start -> all rounds -> results flow / Playwright E2E testi tam generate -> start -> tum turlar -> sonuclar akisina kapsar

---

## v2 Requirements / v2 Gereksinimleri (Deferred / Ertelendi)

- **UX-01**: Countdown timer between rounds / Turlar arasinda geri sayim gostergesi
- **UX-02**: Horse performance statistics across all rounds / Tum turlar genelinde at performans istatistikleri
- **PERSIST-01**: Save/load game state via localStorage / localStorage ile oyun durumu kaydet/yukle

---

## Out of Scope / Kapsam Disi

| Feature / Ozellik | Reason / Neden |
|---------|--------|
| Multiplayer / Cok oyunculu | Single-player assessment scope / Tek oyunculu degerlendirme kapsami |
| Backend / Persistent storage | In-memory state only / Yalnizca bellek ici durum |
| Betting / Bahis mekanizmasi | Not specified in requirements / Gereksinimlerde belirtilmemis |
| Horse progression / At gelisimi | Static roster for v1 / v1 icin sabit kadro |
| Mobile layout / Mobil duzen | Desktop web focus / Masaustu odakli |
| Pinia | Assessment mandates Vuex 4 / Degerlendirme Vuex 4 gerektiriyor |
| Physics engine | CSS transitions sufficient / CSS gecisleri yeterli |

---

## Traceability / Izlenebilirlik

| Requirement / Gereksinim | Phase / Faz | Status / Durum |
|-------------|-------|--------|
| STATE-01 | Phase 1 | Complete |
| STATE-02 | Phase 1 | Complete |
| STATE-03 | Phase 1 | Complete |
| ROST-01 | Phase 1 | Complete |
| ROST-02 | Phase 1 | Complete |
| RACE-02 | Phase 1 | Complete |
| SCHED-01 | Phase 2 | Complete |
| SCHED-02 | Phase 2 | Complete |
| SCHED-03 | Phase 2 | Complete |
| SCHED-04 | Phase 2 | Complete |
| RACE-01 | Phase 2 | Complete |
| RACE-04 | Phase 2 | Complete |
| ANIM-01 | Phase 3 | Complete |
| ANIM-02 | Phase 3 | Complete |
| ANIM-03 | Phase 3 | Complete |
| ROST-03 | Phase 3 | Complete |
| RACE-03 | Phase 3 | Complete |
| RESULT-01 | Phase 4 | Complete |
| RESULT-02 | Phase 4 | Complete |
| RESULT-03 | Phase 4 | Complete |
| TEST-01 | Phase 5 | Complete |
| TEST-02 | Phase 5 | Complete |
| TEST-03 | Phase 5 | Complete |

**Coverage / Kapsam:**
- v1 requirements: 23 total / toplam
- Mapped to phases: 23
- Unmapped: 0

---

*Requirements defined / Gereksinimler tanimlandi: 2026-03-28*
*Last updated / Son guncelleme: 2026-03-30 - Phase 5 test coverage and E2E verification completed / Faz 5 test kapsami ve E2E dogrulamasi tamamlandi*
