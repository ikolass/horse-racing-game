<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const gamePhase = computed(() => store.getters['race/gamePhase'])
const currentRound = computed(() => store.getters['race/currentRound'])
const positions = computed(() => store.state.race.positions)
const allHorses = computed(() => store.getters['horses/allHorses'])

// The round to display: current round if set, otherwise round 1 (for SCHEDULED state)
const visibleRound = computed(() => {
  const roundNum = currentRound.value || 1
  return store.getters['schedule/roundByNumber'](roundNum) ?? null
})

// Map horse indices to full horse objects with their index attached
const racingHorses = computed(() => {
  if (!visibleRound.value) return []
  return visibleRound.value.horseIndices.map(idx => ({
    idx,
    ...allHorses.value[idx],
  }))
})

// Returns marker style: at finish line (right-anchored) or in-track (left-anchored)
function markerStyle(horseIdx) {
  const pos = positions.value[horseIdx] ?? 0
  if (pos >= 1.0) {
    return { right: '4px', left: 'auto' }
  }
  return { left: (pos * 100) + '%' }
}

// Whether a schedule exists (controls empty state vs track display)
const hasSchedule = computed(() => !!visibleRound.value)
</script>

<template>
  <div data-testid="race-track" class="race-track">
    <template v-if="hasSchedule">
      <div class="round-header" data-testid="round-header">
        Round {{ visibleRound.roundNumber }} &#8212; {{ visibleRound.distance }}m
      </div>
      <div class="track-container">
        <div
          v-for="(horse, i) in racingHorses"
          :key="horse.idx"
          class="lane"
          :class="i % 2 === 0 ? 'lane-odd' : 'lane-even'"
          :data-testid="`lane-${horse.idx}`"
        >
          <div class="lane-label">
            <span class="swatch" :style="{ backgroundColor: horse.color }"></span>
            <span class="lane-name">{{ horse.name }}</span>
          </div>
          <div class="track-area">
            <div class="finish-line" data-testid="finish-line"></div>
            <div
              class="horse-marker"
              :data-testid="`marker-${horse.idx}`"
              :style="markerStyle(horse.idx)"
            >
              <span class="marker-swatch" :style="{ backgroundColor: horse.color }"></span>
              <span class="marker-name">{{ horse.name }}</span>
              <span class="marker-badge">{{ horse.condition }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="empty-state">
        <h3>Waiting for schedule...</h3>
        <p>Click Generate Schedule to set up a race.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.race-track {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-dominant);
}

.round-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-md);
  background: var(--color-bg-secondary);
  font-size: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.track-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.lane {
  height: 40px;
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--color-divider);
}

.lane-odd {
  background: var(--color-bg-dominant);
}

.lane-even {
  background: var(--color-bg-secondary);
}

.lane-label {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 0 var(--space-sm);
  overflow: hidden;
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.lane-name {
  font-size: var(--font-body);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.finish-line {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-accent);
}

.horse-marker {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: left 45ms linear;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  white-space: nowrap;
}

.marker-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.marker-name {
  font-size: var(--font-body);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
}

.marker-badge {
  font-size: var(--font-label);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  background: var(--color-badge-bg);
  padding: var(--space-xs) var(--space-sm);
  border-radius: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-sm);
}

.empty-state h3 {
  font-size: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.empty-state p {
  font-size: var(--font-body);
  color: var(--color-text-muted);
}
</style>
