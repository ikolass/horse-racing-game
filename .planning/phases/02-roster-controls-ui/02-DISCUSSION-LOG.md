# Phase 2: Roster + Controls UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 02-roster-controls-ui
**Areas discussed:** App layout, Roster display format

---

## App Layout

| Option | Description | Selected |
|--------|-------------|----------|
| A) Left sidebar + main | Roster in fixed left column, main area right for track + results | |
| B) Top bar + content | Roster + controls span top, track + results stack below | |
| C) Three-column layout | Roster left (~20%), track center (~55%), results right (~25%) | ✓ |
| D) You decide | Claude picks layout | |

**User's choice:** C — Three-column layout

---

### Column sizing follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| A) Equal thirds | ~33% each | |
| B) Narrow–Wide–Narrow | Roster ~20%, track ~55%, results ~25% | ✓ |
| C) You decide | Claude picks proportions | |

**User's choice:** B — Narrow–Wide–Narrow (~20% / ~55% / ~25%)

---

## Roster Display Format

| Option | Description | Selected |
|--------|-------------|----------|
| A) Compact table rows | One row per horse: swatch + name + condition score. Dense, all 20 visible. | |
| B) Card grid | Small cards in 2–3 columns, more visual weight, requires scrolling | |
| C) List with left color accent | Colored left border per item, minimal/elegant | |
| D) You decide | Claude picks format optimized for narrow column | ✓ |

**User's choice:** D — Claude's discretion

---

## Claude's Discretion

- Roster row design (swatch shape, condition display, hover state)
- Controls placement (above vs below roster)
- Disabled button visual treatment
- Column divider/border styling
- Global CSS base styles

## Deferred Ideas

- Schedule preview in UI (success criteria only requires Vuex devtools)
- Color/condition presentation specifics
- Controls UI specifics
