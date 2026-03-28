# Phase 3: Animated Race Track - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace `src/components/RaceTrackPlaceholder.vue` with a live animated race track component. Phase 3 delivers: 10 dedicated horse lanes, condition-weighted `setInterval` tick animation driving `left: X%` CSS, round info header, finish line, and auto-advance between rounds. All simulation logic lives in Vuex actions (existing `race.js` extension).

Phase 3 does NOT include: Results panel (Phase 4), unit/E2E tests (Phase 5), or any roster/controls changes.

</domain>

<decisions>
## Implementation Decisions

### Animation Model
- **D-01:** Use `setInterval` at 50ms tick rate. A Vuex action fires every 50ms, increments each horse's progress (`positions` map, values 0.0–1.0) based on condition-weighted speed, commits `SET_POSITIONS`. Vue reactivity drives `left: X%` on the moving marker.
- **D-02:** Winner reaches finish (position = 1.0) in approximately 3 seconds. Slower horses' durations are proportional to their condition-weighted speed. Last horse arrives ~5-6s depending on condition gap.
- **D-03:** Speed is smooth and linear — constant speed per horse derived from condition score. No jitter or random variation each tick. Faster horses (higher condition) always visibly lead.
- **D-04:** The existing `race.js` state slots (`positions: {}`, `intervalId: null`, `SET_POSITIONS`, `RESET_POSITIONS`, `SET_INTERVAL_ID`) are exactly what the tick loop needs — extend `startRace` / add a `runRound` action.

### Horse Marker (Moving)
- **D-05:** The moving marker on the track shows: small colored square swatch (matching the horse's `color` property) + horse name + condition score badge. This fulfills ROST-03 (condition badge visible on track during race).
- **D-06:** Marker style is consistent with the roster row appearance — same swatch size (12px), same badge style (dark blue `#0f3460` background, 12px semibold label).

### Lane Layout
- **D-07:** 10 stacked horizontal lanes, each 40px tall (total 400px for the track area). Subtle bottom border divider between lanes (`var(--color-divider)`).
- **D-08:** Fixed left label area (≈120px wide): shows horse's color swatch + name. This is always visible regardless of marker position.
- **D-09:** Track area (remaining width after label): the moving marker travels here. A thin vertical finish line sits at the right edge of the track area (accent color `#e94560` or muted — Claude's discretion).
- **D-10:** Round info header sits above the 10 lanes: shows "Round N — Xm" (e.g., "Round 2 — 1400m"). Styled with `--font-heading` (16px semibold).

### Between-Round Behavior
- **D-11:** After a round ends (all horses reach finish or winner crosses), pause for **1.5 seconds** with horses frozen at their final positions.
- **D-12:** During the 1.5s pause, the round header and lane labels remain visible. No overlay or text banner — the Results panel (Phase 4) is where finish order appears.
- **D-13:** After the pause, auto-advance: clear `positions`, reset markers to start, transition `gamePhase` to `RACING` for the next round. The FSM already allows `ROUND_COMPLETE → RACING`.
- **D-14:** After round 6 completes, do NOT auto-advance. Horses freeze at final positions. `gamePhase` transitions to `DONE`. The track stays showing the last round's state — no "Race complete" overlay needed (the Results panel handles this).

### Claude's Discretion
- Finish line exact styling (color, thickness — likely 2px muted or accent)
- Exact speed formula mapping condition score (1–100) to px/tick rate
- Whether the round header updates in place or the track briefly blanks between rounds
- Lane background color (slight alternation between `--color-bg-dominant` and `--color-bg-secondary` for readability, or uniform)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Store modules (extend, not replace)
- `src/store/modules/race.js` — FSM transitions, `positions` state, `intervalId` slot, `SET_POSITIONS`/`RESET_POSITIONS` mutations. Phase 3 adds `runRound` action and extends `startRace`.
- `src/store/modules/schedule.js` — `rounds[]` each with `roundNumber`, `distance`, `horseIndices`. Phase 3 reads this to know which 10 horses race each round.
- `src/store/index.js` — store composition, namespacing pattern.

### Existing utilities
- `src/utils/raceEngine.js` — `computeFinishOrder(horses)` returns finish order array. Used to determine final positions when the winner crosses the line.
- `src/config/gameConfig.js` — `GAME_CONFIG.HORSES_PER_ROUND = 10`, `TOTAL_ROUNDS = 6`, `ROUND_DISTANCES`.

### Design tokens (MUST follow)
- `src/assets/base.css` — All CSS custom properties: `--color-bg-dominant`, `--color-bg-secondary`, `--color-accent`, `--color-badge-bg`, `--color-divider`, `--space-*`, `--font-*`. No hardcoded hex values in Phase 3 components.

### Component to replace
- `src/components/RaceTrackPlaceholder.vue` — Replace entirely with `RaceTrack.vue` (or extend in place). The placeholder slot in `App.vue` already exists.

### Phase 2 UI-SPEC (visual consistency)
- `.planning/phases/02-roster-controls-ui/02-UI-SPEC.md` — Color palette, spacing scale, typography scale. Phase 3 components must follow the same design language.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/HorseRow.vue` — swatch + name + badge pattern already implemented. Phase 3 lane label and moving marker should reuse the same visual building blocks (not the component itself, but copy the CSS pattern).
- `src/assets/base.css` — all tokens ready. No new tokens needed.

### Established Patterns
- Vuex: namespaced modules, `useStore()` + `computed()` in Vue 3 SFCs, `dispatch('module/action')`.
- `race.js` store: `positions` is already designed as `{ [horseIndex]: 0.0 }` — values 0.0 (start) to 1.0 (finish), directly usable as CSS `left` percentage.
- `SET_POSITIONS` commits a full new positions object each tick (not individual updates) — this is the correct pattern for batch reactivity.

### Integration Points
- `App.vue` center column already imports and renders `<RaceTrackPlaceholder>` — Phase 3 replaces it with `<RaceTrack>` (import swap + component rename).
- `GameControls.vue` dispatches `race/startRace` → Phase 3's `startRace` action must kick off the tick loop for round 1 immediately.
- `gamePhase` FSM: `RACING → ROUND_COMPLETE → RACING` (repeat) → `DONE`. Phase 3 drives all these transitions from the tick loop.

</code_context>

<specifics>
## Specific Ideas

- Horse markers travel from left edge of track area to the finish line (not to the full column edge — the label area is fixed and not part of the track).
- The finish line is a thin vertical rule at the right side of the track area (inside the lane, not outside).
- During idle/scheduled state (before Start is clicked), the track area should show the 10 horses for the upcoming round in their starting positions (position = 0), so the layout is visible before animation starts. This avoids an empty track flashing to 10 lanes when Start is clicked.

</specifics>

<deferred>
## Deferred Ideas

- Countdown timer between rounds (v2 requirement UX-01) — requested in REQUIREMENTS.md v2, not Phase 3.
- Overtaking animation effects (e.g., brief speed burst) — adds complexity, out of scope for v1.
- Track background scenery or decoration — pure CSS utility, not required for assessment.

</deferred>

---

*Phase: 03-animated-race-track*
*Context gathered: 2026-03-28*
