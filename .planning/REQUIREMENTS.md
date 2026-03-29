# Requirements / Gereksinimler: Horse Racing Game / At Yarışı Oyunu

**Defined / Tanımlandı:** 2026-03-28
**Core Value / Temel Değer:** Her yarış turu görsel olarak işleyen ve sonuçların sıralı görüntülendiği, eksiksiz oynanabilir bir at yarışı oyunu. / A complete, playable horse racing game where each race round runs visually and results appear sequentially.

---

## v1 Requirements / v1 Gereksinimleri

### Roster / At Kadrosu

- [x] **ROST-01**: Player can view all 20 horses with name, unique color, and condition score (1–100) / Oyuncu 20 atın tamamını isim, benzersiz renk ve kondisyon puanıyla görebilir
- [x] **ROST-02**: Each horse is displayed with a distinct color swatch in the roster panel / Her at kadro panelinde benzersiz renk göstergesiyle listelenir
- [x] **ROST-03**: Horse condition score badge is visible on the race track during each round / Kondisyon puanı rozeti her turda pist üzerinde görünür

### Schedule / Yarış Programı

- [x] **SCHED-01**: Player can click Generate to create a 6-round race schedule / Oyuncu Generate ile 6 turluk yarış programı oluşturabilir
- [x] **SCHED-02**: Each round randomly selects 10 horses from the 20-horse roster / Her tur 20 attan rastgele 10 at seçer
- [x] **SCHED-03**: Round distances are fixed in sequence: 1200m → 1400m → 1600m → 1800m → 2000m → 2200m / Tur mesafeleri sıralı ve sabit
- [x] **SCHED-04**: Generate button is disabled while a race is in progress / Yarış devam ederken Generate devre dışı

### Race Engine / Yarış Motoru

- [x] **RACE-01**: Player can click Start to begin racing rounds one at a time / Oyuncu Start ile yarışları tur tur başlatabilir
- [x] **RACE-02**: Race outcome is influenced by each horse's condition score (weighted probability) / Yarış sonucu kondisyon puanından etkilenir (ağırlıklı olasılık)
- [x] **RACE-03**: Rounds advance automatically after a brief pause when one completes / Tur bitiminde kısa bekleme sonrası sonraki tur otomatik başlar
- [x] **RACE-04**: Start button is disabled after racing begins until all 6 rounds complete / Yarış başladıktan sonra Start tüm turlar bitene kadar devre dışı

### Animation / Animasyon

- [x] **ANIM-01**: Horses visibly move across the track via CSS transitions during each round / Her turda atlar CSS geçişiyle pist üzerinde görünür hareket eder
- [x] **ANIM-02**: Each horse races in its own dedicated lane with no visual overlap / Her at ayrı şeridinde yarışır; üst üste binme yok
- [x] **ANIM-03**: Current round number, distance, and participating horses are shown during the race / Aktif tur numarası, mesafe ve katılımcı atlar yarış sırasında gösterilir

### Results / Sonuçlar

- [x] **RESULT-01**: Race results appear sequentially in the Results panel as each round concludes / Her tur bitiminde sonuçlar sıralı olarak Sonuçlar panelinde görünür
- [x] **RESULT-02**: Each result entry shows round number, distance, and full finishing order (1st–10th) / Her sonuç tur no., mesafe ve tam bitiş sıralamasını (1.–10.) gösterir
- [ ] **RESULT-03**: Results panel auto-scrolls to the latest result / Sonuçlar paneli en son sonuca otomatik kayar

### State Management / Durum Yönetimi

- [x] **STATE-01**: Vuex manages all game state (horses, schedule, current round, race positions, results) / Vuex tüm oyun durumunu yönetir (atlar, program, mevcut tur, konum, sonuçlar)
- [x] **STATE-02**: All race simulation logic lives in Vuex actions, not in components / Tüm yarış simülasyon mantığı Vuex aksiyonlarında, bileşenlerde değil
- [x] **STATE-03**: A gamePhase state machine (IDLE → SCHEDULED → RACING → ROUND_COMPLETE → DONE) controls all UI gates / gamePhase durum makinesi tüm UI geçişlerini (buton durumları, panel görünürlüğü) yönetir

### Tests / Testler

- [ ] **TEST-01**: Vitest unit tests cover all Vuex store mutations and actions / Vitest birim testleri tüm Vuex store mutation ve aksiyonlarını kapsar
- [ ] **TEST-02**: Vitest fairness test: condition score meaningfully influences race results (50-race simulation) / Kondisyon puanının yarış sonucunu anlamlı biçimde etkilediğini doğrulayan 50 yarış simülasyon testi
- [ ] **TEST-03**: Playwright E2E test covers the full generate → start → all rounds → results flow / Playwright E2E testi tam generate → start → tüm turlar → sonuçlar akışını kapsar

---

## v2 Requirements / v2 Gereksinimleri (Deferred / Ertelendi)

- **UX-01**: Countdown timer between rounds / Turlar arasında geri sayım göstergesi
- **UX-02**: Horse performance statistics across all rounds / Tüm turlar genelinde at performans istatistikleri
- **PERSIST-01**: Save/load game state via localStorage / localStorage ile oyun durumu kaydet/yükle

---

## Out of Scope / Kapsam Dışı

| Feature / Özellik | Reason / Neden |
|---------|--------|
| Multiplayer / Çok oyunculu | Single-player assessment scope / Tek oyunculu değerlendirme kapsamı |
| Backend / Persistent storage | In-memory state only / Yalnızca bellek içi durum |
| Betting / Bahis mekanizması | Not specified in requirements / Gereksinimlerde belirtilmemiş |
| Horse progression / At gelişimi | Static roster for v1 / v1 için sabit kadro |
| Mobile layout / Mobil düzen | Desktop web focus / Masaüstü odaklı |
| Pinia | Assessment mandates Vuex 4 / Değerlendirme Vuex 4 gerektiriyor |
| Physics engine | CSS transitions sufficient / CSS geçişleri yeterli |

---

## Traceability / İzlenebilirlik

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
| RESULT-03 | Phase 4 | Pending |
| TEST-01 | Phase 5 | Pending |
| TEST-02 | Phase 5 | Pending |
| TEST-03 | Phase 5 | Pending |

**Coverage / Kapsam:**
- v1 requirements: 23 total / toplam
- Mapped to phases: 23
- Unmapped: 0 ✓

---

*Requirements defined / Gereksinimler tanımlandı: 2026-03-28*
*Last updated / Son güncelleme: 2026-03-28 — Traceability updated after roadmap creation / Yol haritası oluşturulması sonrası izlenebilirlik güncellendi*
