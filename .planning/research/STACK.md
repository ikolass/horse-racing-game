# Stack Research / Teknoloji Yığını Araştırması

**Project / Proje:** Horse Racing Game / At Yarışı Oyunu
**Researched / Araştırıldı:** 2026-03-28
**Confidence / Güven:** HIGH — all versions verified against npm registry

---

## Verified Versions / Doğrulanmış Sürümler

| Package | Version | Vue 3.5 | Vite 7 | Node 22 |
|---------|---------|---------|--------|---------|
| vuex | 4.1.0 | YES | n/a | YES |
| gsap | 3.14.2 | n/a (framework-agnostic) | n/a | YES |
| vitest | 4.1.2 | n/a | YES (explicit peer) | YES |
| @vue/test-utils | 2.4.6 | YES | n/a | YES |
| jsdom | 29.0.1 | n/a | n/a | YES |
| @vitest/coverage-v8 | 4.1.2 | n/a | YES | YES |
| @playwright/test | 1.58.2 | n/a | n/a | YES |
| nanoid | 5.1.7 | n/a | n/a | YES |

---

## Install Commands / Kurulum Komutları

```bash
# Runtime dependencies / Çalışma zamanı bağımlılıkları
npm install vuex@^4.1.0 gsap@^3.14.2 nanoid@^5.1.7

# Unit testing / Birim testleri
npm install -D vitest@^4.1.2 @vue/test-utils@^2.4.6 jsdom@^29.0.1 @vitest/coverage-v8@^4.1.2

# E2E testing / E2E testleri
npm install -D @playwright/test@^1.58.2
npx playwright install chromium
```

---

## Key Decisions / Temel Kararlar

### Vuex 4.1.0
- Peer dep: `vue: ^3.2.0` — compatible with Vue 3.5.30
- Required by assessment spec / Değerlendirme şartnamesi gereği zorunlu
- Do NOT use Pinia / Pinia kullanma

### GSAP 3.14.2
- Per-horse tweening with JS-controlled durations derived from condition scores
- `onComplete` callback makes round sequencing from Vuex actions clean
- Pure CSS can work but harder to synchronize with store state
- Her ata özel süre ayarlanabilir; `onComplete` ile Vuex aksiyonlarından tur sıralama kolaylaşır

### Vitest 4.1.2
- Explicitly lists `vite: "^6.0.0 || ^7.0.0 || ^8.0.0"` — confirmed with Vite 7.3.1
- Native Vite integration, zero config / Yerel Vite entegrasyonu, sıfır yapılandırma

### Playwright 1.58.2 (over Cypress)
- No Electron binary (lighter install) / Electron ikili yok (hafif kurulum)
- Standard async/await / Standart async/await
- Better default for new projects in 2026 / 2026'da yeni projeler için daha iyi tercih

### nanoid 5.1.7
- For horse IDs / At kimlik numaraları için
- Alternative: native `crypto.randomUUID()` — both work, low-stakes decision
- Lodash deliberately excluded — Fisher-Yates shuffle is 10 lines inline

---

## What NOT to Add / Eklenmeyecekler

| Package | Why Excluded / Neden Dışlandı |
|---------|-------------------------------|
| pinia | Assessment requires Vuex / Değerlendirme Vuex gerektiriyor |
| lodash | Only need shuffle; Fisher-Yates inline is 10 lines |
| vue-router | No routing needed / Yönlendirme gerekmiyor |
| tailwindcss | ~5 scoped components don't need a CSS framework |
| cypress | Heavier than Playwright; Electron binary; no advantage |
| axios | No API calls; pure in-memory state |
