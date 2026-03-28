---
phase: 3
slug: animated-race-track
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.2 |
| **Config file** | none — Wave 0 installs (Phase 5 scope) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~5 seconds (once test files exist) |

---

## Sampling Rate

- **After every task commit:** Visual browser check (`npm run dev` → start race → observe animation)
- **After every plan wave:** Manual visual verification of all success criteria
- **Before `/gsd:verify-work`:** All 5 success criteria visually confirmed
- **Max feedback latency:** ~30 seconds (dev server reload)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-ANIM-01 | 01 | 1 | ANIM-01 | manual | Visual: horses slide left→right | ❌ Phase 5 | ⬜ pending |
| 03-ANIM-02 | 01 | 1 | ANIM-02 | manual | Visual: 10 lanes, no overlap | ❌ Phase 5 | ⬜ pending |
| 03-ANIM-03 | 01 | 1 | ANIM-03 | manual | Visual: round header shown | ❌ Phase 5 | ⬜ pending |
| 03-ROST-03 | 01 | 1 | ROST-03 | manual | Visual: condition badge visible | ❌ Phase 5 | ⬜ pending |
| 03-RACE-02 | 01 | 1 | RACE-02 | manual | Visual: faster horse wins | ❌ Phase 5 | ⬜ pending |
| 03-RACE-03 | 01 | 2 | RACE-03 | manual | Visual: next round auto-starts | ❌ Phase 5 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test files needed in Phase 3 — tests are Phase 5 scope.

Phase 3 MUST add `data-testid` attributes to enable Phase 5 Playwright:

| Element | data-testid |
|---------|-------------|
| Race track container | `data-testid="race-track"` |
| Round header | `data-testid="round-header"` |
| Individual lane (each) | `data-testid="lane-{horseIdx}"` |
| Horse marker (each) | `data-testid="marker-{horseIdx}"` |

*Existing infrastructure (Vitest) covers the stack — no install needed in Phase 3.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Horses slide smoothly (no stutter/teleport) | ANIM-01 | CSS transition correctness is visual | `npm run dev` → start race → observe marker movement at normal speed |
| 10 dedicated horizontal lanes, no vertical overlap | ANIM-02 | Layout pixel precision is visual | `npm run dev` → start race → inspect lane spacing |
| Condition badge visible on track during round | ROST-03 | DOM presence visual during animation | `npm run dev` → start race → verify badge shown on each marker |
| Higher-condition horse visibly faster | RACE-02 | Speed differential is perceptual | `npm run dev` → start race with known condition spread → observe |
| Round auto-advances after ~1.5s pause | RACE-03 | Timing UX is perceptual | `npm run dev` → let round complete → verify next starts automatically |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
