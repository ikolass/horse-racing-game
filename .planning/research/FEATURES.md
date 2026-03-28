# Feature Landscape / Özellik Haritası

**Domain / Alan:** Browser-based interactive horse racing game (Vue 3 + Vuex 4)
**Researched / Araştırıldı:** 2026-03-28
**Confidence / Güven:** HIGH for Vue/Vuex patterns; MEDIUM for game-mechanic conventions

---

## Table Stakes / Temel Özellikler

| Feature / Özellik | Why Expected / Neden Bekleniyor | Complexity | Vuex Dependency |
|---------|--------------|------------|-----------------|
| 20-horse roster display / 20 at kadrosu | Core data model; named requirement | Low | YES — horses array in store |
| Unique color per horse / Benzersiz renk | Visual identity; named requirement | Low | YES — stored on horse object |
| Condition scores 1-100 / Kondisyon puanı | Race engine input; named requirement | Low | YES — stored on horse object |
| Generate button (6-round schedule) / Üret butonu | Entry point to gameplay | Medium | YES — schedule array in store |
| Start button (sequential rounds) / Başlat butonu | Core gameplay loop | Medium | YES — currentRound, isRacing flags |
| Condition-weighted race result / Kondisyon ağırlıklı sonuç | Race fairness | Medium | YES — results array in store |
| Animated horse movement / Animasyonlu hareket | Visual feedback; named requirement | High | YES — raceProgress per horse |
| Sequential results panel / Sıralı sonuçlar paneli | Race conclusion display | Medium | YES — watch on results array |
| Vuex state management | Assessment hard requirement | Medium | CENTRAL |
| Component-based architecture / Bileşen mimarisi | Assessment hard requirement | Low | Implicit |
| Unit tests (Vitest) | Assessment deliverable | Medium | Store logic primary |
| E2E tests (Playwright) | Assessment deliverable | Medium | Indirect |

---

## Feature Details / Özellik Detayları

### 1. Condition-Score Race Result Calculation / Kondisyon Puanı ile Sonuç Hesaplama

**Recommended / Önerilen: Weighted random with proportional ticket assignment**

- Each horse's weight = conditionScore (1-100) / Her atın ağırlığı = kondisyon puanı
- Total weight = sum of all 10 horses' scores in the round / Toplam ağırlık = 10 atın puan toplamı
- Finish order: draw without replacement using proportional slot ranges / Bitiş sırası: orantılı aralıklarda geri koymadan çekiliş
- Horse with score 80 has 4x win chance vs score 20 — but no guarantee / 80 puanlı at 20 puanlıya göre 4x kazanma şansına sahip, ama garanti değil
- Pure function — fully unit-testable by seeding Math.random / Saf fonksiyon — Math.random seed'i ile tamamen test edilebilir
- Animation tie-in: conditionScore → CSS transition-duration (higher = faster) / Animasyon bağlantısı: yüksek puan = kısa süre = görsel hız

### 2. Animated Race Track — Vue 3 Best Practice / Animasyonlu Pist

**Recommended / Önerilen: CSS transitions driven by reactive Vuex store state**

- Store holds `raceProgress: { [horseId]: 0–100 }` (% across track)
- Component binds `:style="{ transform: 'translateX(' + progress + '%)' }"`
- CSS: `transition: transform [duration]s linear`
- Vuex action increments progress with `setInterval`; commits `FINISH_ROUND` when any horse hits 100%

| Approach / Yaklaşım | Verdict / Karar | Reason / Neden |
|----------|---------|--------|
| CSS transitions + store state | RECOMMENDED | GPU-accelerated, Vue-native, Vuex-controlled |
| requestAnimationFrame loop | Acceptable | More control but bypasses Vue reactivity |
| GSAP via Transition hooks | Overkill | Wrong tool for positional animation |
| Vue `<Transition>` component | Wrong tool | Enter/leave only, not positional |

**Key:** Use `transform: translateX()` not `left` — GPU-composited, avoids layout recalculation.

### 3. Results Panel — Sequential Display / Sonuçlar Paneli

**Recommended / Önerilen: Computed from store + watch for scroll side effects**

- Primary: `computed(() => store.state.results)` — Vuex mutations are synchronous
- Scroll-to-bottom: `watch(results, () => nextTick(() => { container.scrollTop = container.scrollHeight }))`
- `nextTick` required — DOM must update before scroll measurement
- Do NOT poll with setTimeout — Vuex reactivity is push-based
- Do NOT use custom events for results — breaks single-source-of-truth

### 4. UX Flow / Kullanıcı Akışı

```
[Initial / Başlangıç]
  Roster: 20 horses visible / 20 at görünür
  Track: idle / Boş
  Results: empty / Boş
  Buttons: [Generate] enabled, [Start] disabled

[After Generate / Ürettikten Sonra]
  Schedule built in store (6 rounds × 10 horses)
  [Generate] re-enables (allow re-generate before start)
  [Start] enabled

[After Start / Başlattıktan Sonra]
  [Generate] disabled, [Start] disabled
  Round 1: 10 horses animate simultaneously / 10 at eş zamanlı hareket eder
  First to reach 100% = 1st place / İlk %100'e ulaşan = 1. yer

[Round complete / Tur tamamlandı]
  Results appended to Results panel
  Brief pause (~1s)
  Next round auto-advances / Sonraki tur otomatik başlar

[After Round 6 / 6. Turdan Sonra]
  All 6 results displayed / 6 sonuç görüntülendi
  [Generate] re-enabled / Yeniden aktif
```

**Vuex gamePhase state machine:** `IDLE → SCHEDULED → RACING → ROUND_COMPLETE → DONE → IDLE`

---

## Differentiators / Fark Yaratan Özellikler

| Feature / Özellik | Value / Değer | Complexity |
|---------|-------------------|------------|
| Per-horse color in race lane / Pist şeridinde at rengi | Visual identity throughout | Low |
| Condition badge on horse / Kondisyon rozeti | Connects mechanic to visual | Low |
| Auto-advance rounds with countdown / Otomatik tur geçişi | More polished UX | Low-Med |
| "Round X of 6" indicator / Tur göstergesi | Player orientation | Low |

---

## Anti-Features / Eklenmeyecek Özellikler

| Anti-Feature | Why Avoid / Neden Kaçın |
|--------------|-----------|
| Betting / Bahis | Out of scope |
| localStorage / backend | Out of scope |
| Pinia | Assessment mandates Vuex |
| Physics engine | Overkill — CSS transitions sufficient |

---

## Assessment Checklist / Değerlendirme Kontrol Listesi

**Will be directly checked / Doğrudan kontrol edilecek:**
- All 20 horses with name, color, condition score
- Generate creates exactly 6 rounds, 10 random horses, distances in order
- Start runs rounds one at a time
- Horses visually move
- Results appear sequentially
- Vuex holds all state (no component-local game data)
- Logical component separation
- Unit tests pass
- E2E test covers full flow

**Differentiates good from great / İyiyi mükemmelden ayıran:**
- Smooth animations (not janky)
- conditionScore visibly influences both speed and outcome
- Horse colors carried through roster → track → results
- gamePhase state machine for clean button logic
