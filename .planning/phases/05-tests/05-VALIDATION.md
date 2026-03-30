---
phase: 05
slug: tests
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-29
---

# Phase 05 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + playwright |
| **Config file** | `vitest.config.js` and `playwright.config.js` |
| **Quick run command** | `npm run test -- tests/unit` |
| **Full suite command** | `npm run test && npx playwright test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- tests/unit`
- **After every plan wave:** Run `npm run test && npx playwright test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | TEST-01 | infra | `npm run test -- tests/unit` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | TEST-03 | infra | `npx playwright test --list` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | TEST-01 | unit | `npm run test -- tests/unit/store` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | TEST-02 | unit | `npm run test -- tests/unit/utils/raceEngine.spec.js` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | TEST-03 | e2e | `npx playwright test tests/e2e/game-flow.spec.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` - add `test` and `test:e2e` scripts
- [ ] `vitest.config.js` - test environment and alias config
- [ ] `playwright.config.js` - web server, baseURL, timeout, retries
- [ ] `tests/` - create unit/e2e directory structure
- [ ] `@playwright/test` - install framework dependency

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Browser visibly completes the full six-round race flow without a frozen UI | TEST-03 | Automated E2E confirms DOM outcomes but not perceived animation smoothness | Run `npm run dev`, click Generate, click Start, and watch all six rounds complete while results append in order |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-29
