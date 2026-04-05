<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const allResults = computed(() => store.getters['results/allResults'])
const allRounds = computed(() => store.getters['schedule/allRounds'])
const allHorses = computed(() => store.getters['horses/allHorses'])
const currentRound = computed(() => store.getters['race/currentRound'])
const isRoundActive = computed(() => store.getters['race/isRoundActive'])
const roundFinishTimes = computed(() => store.state.race.roundFinishTimes)

const resultsByRound = computed(() =>
  allResults.value.reduce((map, result) => {
    map[result.roundNumber] = result
    return map
  }, {})
)

function formatElapsed(ms) {
  return `${(ms / 1000).toFixed(2)} sn`
}

function buildLiveResult(round) {
  const finishOrder = [...round.horseIndices]
    .filter((horseIdx) => roundFinishTimes.value[horseIdx] !== undefined)
    .sort((a, b) => roundFinishTimes.value[a] - roundFinishTimes.value[b])

  if (finishOrder.length === 0) {
    return null
  }

  return {
    roundNumber: round.roundNumber,
    distance: round.distance,
    finishOrder,
    finishTimes: roundFinishTimes.value,
    elapsedMs: Math.max(...Object.values(roundFinishTimes.value)),
  }
}

const roundCards = computed(() =>
  allRounds.value.map((round) => {
    const savedResult = resultsByRound.value[round.roundNumber] ?? null
    const liveResult =
      !savedResult &&
      currentRound.value === round.roundNumber &&
      isRoundActive.value
        ? buildLiveResult(round)
        : null
    const displayResult = savedResult ?? liveResult
    const heading = `Round ${round.roundNumber} - ${round.distance}m`
    const active =
      currentRound.value === round.roundNumber && isRoundActive.value

    return {
      ...round,
      active,
      heading,
      label: savedResult ? 'Finished' : active ? 'Racing' : 'Pending',
      displayResult,
    }
  })
)

function horseElapsed(result, horseIdx) {
  return formatElapsed(result.finishTimes?.[horseIdx] ?? 0)
}
</script>

<template>
  <div class="results-panel" data-testid="results-panel">
    <div class="panel-header">Results</div>

    <div class="results-scroll">
      <div v-if="roundCards.length === 0" class="empty-state">
        No schedule yet. Generate a schedule to preview each round.
      </div>

      <div v-else class="rounds-list">
        <div
          v-for="round in roundCards"
          :key="round.roundNumber"
          class="round-row"
          :data-testid="`round-row-${round.roundNumber}`"
        >
          <section
            class="info-card schedule-card"
            :data-testid="`schedule-round-${round.roundNumber}`"
          >
            <div class="card-label">Scheduled</div>
            <div class="card-heading">{{ round.heading }}</div>
            <ol class="horse-list">
              <li
                v-for="horseIdx in round.horseIndices"
                :key="horseIdx"
                class="horse-row"
              >
                <span
                  class="swatch"
                  :style="{ backgroundColor: allHorses[horseIdx].color }"
                ></span>
                <span class="horse-name">{{ allHorses[horseIdx].name }}</span>
              </li>
            </ol>
          </section>

          <section
            class="info-card result-card"
            :data-testid="`result-round-${round.roundNumber}`"
          >
            <div class="card-label">{{ round.label }}</div>
            <template v-if="round.displayResult">
              <div class="card-header-row">
                <div class="card-heading">{{ round.heading }}</div>
                <div
                  class="result-timer"
                  :data-testid="`result-time-${round.roundNumber}`"
                >
                  {{ formatElapsed(round.displayResult.elapsedMs ?? 0) }}
                </div>
              </div>
              <ol class="horse-list">
                <li
                  v-for="(horseIdx, place) in round.displayResult.finishOrder"
                  :key="horseIdx"
                  class="horse-row"
                >
                  <span class="place">{{ place + 1 }}.</span>
                  <span
                    class="swatch"
                    :style="{ backgroundColor: allHorses[horseIdx].color }"
                  ></span>
                  <span class="horse-name">{{ allHorses[horseIdx].name }}</span>
                  <span class="horse-time">{{
                    horseElapsed(round.displayResult, horseIdx)
                  }}</span>
                </li>
              </ol>
            </template>

            <template v-else-if="round.active">
              <div class="card-heading">{{ round.heading }}</div>
              <div class="pending-state">
                Race is in progress. Finishers will appear here as they complete
                the round.
              </div>
            </template>

            <template v-else>
              <div class="card-heading">{{ round.heading }}</div>
              <div class="pending-state">
                This card will fill after Round {{ round.roundNumber }} starts.
              </div>
            </template>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-secondary);
}

.panel-header {
  padding: var(--space-md);
  font-size: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-divider);
  flex-shrink: 0;
}

.results-scroll {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm);
}

.rounds-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.round-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}

.info-card {
  background: var(--color-bg-dominant, #1a1a2e);
  border-radius: 8px;
  padding: var(--space-sm) var(--space-md);
  min-width: 0;
  border: 1px solid var(--color-divider);
}

.schedule-card {
  background: color-mix(
    in srgb,
    var(--color-bg-dominant) 86%,
    var(--color-accent) 14%
  );
}

.result-card {
  background: var(--color-bg-dominant, #1a1a2e);
}

.card-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.card-heading {
  font-size: var(--font-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  margin-bottom: var(--space-xs);
}

.card-header-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.horse-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.horse-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 2px 0;
  font-size: var(--font-label);
  color: var(--color-text-primary);
}

.place {
  width: 24px;
  text-align: right;
  color: var(--color-text-muted);
  font-weight: var(--font-weight-semibold);
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.horse-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.horse-time {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.result-timer {
  font-size: var(--font-label);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.pending-state {
  min-height: 88px;
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  font-size: var(--font-label);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  font-size: var(--font-body);
}

@media (max-width: 1100px) {
  .round-row {
    grid-template-columns: 1fr;
  }
}
</style>
