# Phase 3: Animated Race Track - Discussion Log

**Date:** 2026-03-28
**Phase:** 03 — Animated Race Track

---

## Areas Discussed

All 4 gray areas selected by user.

---

### Area 1: Animation Model

**Q: How should horse movement be driven?**
Options: setInterval tick / Pure CSS transition
Selected: **setInterval tick** — 50ms interval, Vuex `SET_POSITIONS` commits, Vue reactivity drives `left: X%`

**Q: How fast should the tick interval be?**
Options: 50ms / 100ms / requestAnimationFrame
Selected: **50ms** (recommended)

**Q: How long should each round animation run?**
Options: 3 seconds / 5 seconds / You decide
Selected: **3 seconds** — winner finishes in ~3s

**Q: Smooth linear or jitter?**
Options: Smooth linear / With slight jitter / You decide
Selected: **Smooth linear** — constant speed per horse from condition score

---

### Area 2: Horse Marker on Track

**Q: What should the horse marker look like while racing?**
Options: Swatch + name + badge / Colored circle only / Name + badge no swatch
Selected: **Swatch + name + badge** — fulfills ROST-03, consistent with roster

**Q: What is fixed on the left side of each lane?**
Options: Color swatch + name / Name only / Nothing
Selected: **Color swatch + name** (fixed, always visible)

---

### Area 3: Lane Layout

**Q: How tall should each lane be?**
Options: 40px lanes / 32px lanes / You decide
Selected: **40px lanes** — 10 × 40px = 400px total, fits monitor without scroll

**Q: Should there be a visible finish line?**
Options: Yes — thin vertical line / No — markers just reach the edge
Selected: **Yes — thin vertical line** (accent or muted color)

---

### Area 4: Between-Round Behavior

**Q: How long is the pause between rounds?**
Options: 1.5 seconds / 2.5 seconds / You decide
Selected: **1.5 seconds**

**Q: What happens visually during the pause?**
Options: Horses stay at finish positions / Show finish order overlay / Track fades out
Selected: **Horses stay at finish positions** — no overlay (Results panel handles finish order)

**Q: After all 6 rounds complete, what does the track show?**
Options: Final round stays frozen / Track clears to placeholder / You decide
Selected: **Final round stays frozen** — gamePhase → DONE, track shows last state

---

*Discussion complete. CONTEXT.md written.*
