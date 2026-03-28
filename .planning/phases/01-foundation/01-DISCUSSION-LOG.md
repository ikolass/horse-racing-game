# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-foundation
**Areas discussed:** Horse data design, Race engine weighting, GAME_CONFIG scope, Color palette

---

## Horse Data Design

### Names

| Option | Description | Selected |
|--------|-------------|----------|
| Predefined list | 20 hand-crafted names baked into store initial state | ✓ |
| Generated at runtime | Names constructed algorithmically from adjective+noun combos | |
| You decide | Claude picks a predefined list of 20 racing-themed names | |

**User's choice:** Predefined list
**Notes:** Simple, consistent, reviewable. Thematic names (e.g. Thunder, Storm, Eclipse).

### Horse Fields

| Option | Description | Selected |
|--------|-------------|----------|
| name + color + condition | Exactly what requirements specify; ID via array index | ✓ |
| Add id + slug | Explicit numeric id and slug for stable Vuex/DOM references | |
| You decide | Claude picks the minimal set needed | |

**User's choice:** name + color + condition
**Notes:** Minimal fields matching requirements. No extra fields needed for Phase 1.

---

## Race Engine Weighting

### Condition weighting

| Option | Description | Selected |
|--------|-------------|----------|
| Linear weight | Weight = condition score. Score 80 is 2× more likely than score 40 | ✓ |
| Exponential curve | Weight = condition^N. Top horses dominate strongly | |

**User's choice:** Linear weight
**Notes:** Simple, predictable, satisfies TEST-02 fairness test requirement.

### Randomness floor

| Option | Description | Selected |
|--------|-------------|----------|
| No floor — pure weighted random | Weight is purely condition score; condition-1 horse can still win | ✓ |
| Add minimum floor | Every horse gets at least X% base weight regardless of condition | |

**User's choice:** No floor
**Notes:** Keeps algorithm simple and fair.

---

## GAME_CONFIG Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Core rules only | TOTAL_HORSES, HORSES_PER_ROUND, TOTAL_ROUNDS, ROUND_DISTANCES only | ✓ |
| Include tick + animation | Also TICK_INTERVAL_MS: 200 and CSS_TRANSITION_MS: 180 | |

**User's choice:** Core rules only
**Notes:** Animation constants deferred to Phase 3 where they're actually needed.

---

## Color Palette

### Color definition

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded hex values | 20 manually curated hex colors | ✓ |
| CSS named colors | CSS color names (limited to ~20 distinguishable) | |
| You decide | Claude picks 20 visually distinct hex values | |

**User's choice:** Hardcoded hex values
**Notes:** STATE.md flagged algorithmic HSL generation produces indistinguishable adjacent hues.

### Color storage

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in horse data | Each horse object has a `color` field with its hex value | ✓ |
| Separate color palette constant | HORSE_COLORS array in GAME_CONFIG or separate file | |

**User's choice:** Inline in horse data
**Notes:** Color and horse are one unit — no separate lookup needed.

---

## Claude's Discretion

- Specific 20 horse names (racing-themed)
- Specific 20 hex color values (spread across hue wheel)
- Store module file structure and folder organization
- Weighted shuffle vs weighted sort approach in raceEngine.js

## Deferred Ideas

- TICK_INTERVAL_MS and CSS_TRANSITION_MS constants — deferred to Phase 3
