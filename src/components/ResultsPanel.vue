<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const allResults = computed(() => store.getters['results/allResults'])
const allRounds = computed(() => store.getters['schedule/allRounds'])
const allHorses = computed(() => store.getters['horses/allHorses'])
const currentRound = computed(() => store.getters['race/currentRound'])
const gamePhase = computed(() => store.getters['race/gamePhase'])
const roundFinishTimes = computed(() => store.state.race.roundFinishTimes)

const resultsByRound = computed(() => {
  return allResults.value.reduce((map, result) => {
    map[result.roundNumber] = result
    return map
  }, {})
})

function formatElapsed(ms) {
  return `${(ms / 1000).toFixed(2)} sn`
}

function horseElapsed(result, horseIdx) {
  return formatElapsed(result.finishTimes?.[horseIdx] ?? 0)
}

const liveResultsByRound = computed(() => {
  const roundNumber = currentRound.value
  if (!roundNumber || gamePhase.value === 'SCHEDULED' || gamePhase.value === 'IDLE') {
    return {}
  }

  const round = allRounds.value.find((entry) => entry.roundNumber === roundNumber)
  if (!round) return {}

  const finishOrder = [...round.horseIndices]
    .filter((horseIdx) => roundFinishTimes.value[horseIdx] !== undefined)
    .sort((a, b) => roundFinishTimes.value[a] - roundFinishTimes.value[b])

  if (finishOrder.length === 0) return {}

  return {
    [roundNumber]: {
      roundNumber,
      distance: round.distance,
      finishOrder,
      finishTimes: roundFinishTimes.value,
      elapsedMs: Math.max(...Object.values(roundFinishTimes.value)),
      live: true,
    },
  }
})

function displayResult(roundNumber) {
  return resultsByRound.value[roundNumber] ?? liveResultsByRound.value[roundNumber] ?? null
}
</script>

<template>
  <div class="results-panel" data-testid="results-panel">
    <div class="panel-header">Results</div>

    <div class="results-scroll">
      <div v-if="allRounds.length === 0" class="empty-state">
        No schedule yet. Generate a schedule to preview each round.
      </div>

      <div v-else class="rounds-list">
        <div
          v-for="round in allRounds"
          :key="round.roundNumber"
          class="round-row"
          :data-testid="`round-row-${round.roundNumber}`"
        >
          <section class="info-card schedule-card" :data-testid="`schedule-round-${round.roundNumber}`">
            <div class="card-label">Scheduled</div>
            <div class="card-heading">
              Round {{ round.roundNumber }} &#8212; {{ round.distance }}m
            </div>
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

          <section class="info-card result-card" :data-testid="`result-round-${round.roundNumber}`">
            <template v-if="displayResult(round.roundNumber)">
              <div class="card-label">{{ displayResult(round.roundNumber).live ? 'Live' : 'Finished' }}</div>
              <div class="card-header-row">
                <div class="card-heading">
                  Round {{ round.roundNumber }} &#8212; {{ round.distance }}m
                </div>
                <div class="result-timer" :data-testid="`result-time-${round.roundNumber}`">
                  {{ formatElapsed(displayResult(round.roundNumber).elapsedMs ?? 0) }}
                </div>
              </div>
              <ol class="horse-list">
                <li
                  v-for="(horseIdx, place) in displayResult(round.roundNumber).finishOrder"
                  :key="horseIdx"
                  class="horse-row"
                >
                  <span class="place">{{ place + 1 }}.</span>
                  <span
                    class="swatch"
                    :style="{ backgroundColor: allHorses[horseIdx].color }"
                  ></span>
                  <span class="horse-name">{{ allHorses[horseIdx].name }}</span>
                  <span class="horse-time">{{ horseElapsed(displayResult(round.roundNumber), horseIdx) }}</span>
                </li>
              </ol>
            </template>

            <template v-else>
              <div class="card-label">Pending</div>
              <div class="card-heading">
                Round {{ round.roundNumber }} &#8212; {{ round.distance }}m
              </div>
              <div class="pending-state">
                This card will fill after Round {{ round.roundNumber }} finishes.
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
  background: color-mix(in srgb, var(--color-bg-dominant) 86%, var(--color-accent) 14%);
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
