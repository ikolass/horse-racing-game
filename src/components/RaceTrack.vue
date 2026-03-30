<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const MARKER_SIZE = 30
const FINISH_LINE_WIDTH = 2

const currentRound = computed(() => store.getters['race/currentRound'])
const countdown = computed(() => store.getters['race/countdown'])
const positions = computed(() => store.state.race.positions)
const allHorses = computed(() => store.getters['horses/allHorses'])

const visibleRound = computed(() => {
  const roundNum = currentRound.value || 1
  return store.getters['schedule/roundByNumber'](roundNum) ?? null
})

const racingHorses = computed(() => {
  if (!visibleRound.value) return []
  return visibleRound.value.horseIndices.map((idx) => ({
    idx,
    ...allHorses.value[idx],
  }))
})

function markerStyle(horseIdx) {
  const pos = positions.value[horseIdx] ?? 0
  const normalized = Math.min(Math.max(pos, 0), 1)
  return {
    left: `calc(${normalized * 100}% - ${normalized * MARKER_SIZE}px - ${normalized * FINISH_LINE_WIDTH}px)`,
  }
}

const hasSchedule = computed(() => !!visibleRound.value)
</script>

<template>
  <div data-testid="race-track" class="race-track">
    <template v-if="hasSchedule">
      <div class="round-header" data-testid="round-header">
        Round {{ visibleRound.roundNumber }} &#8212; {{ visibleRound.distance }}m
      </div>
      <div class="track-container">
        <div v-if="countdown > 0" class="countdown-overlay" data-testid="round-countdown">
          <span class="countdown-value">{{ countdown }}</span>
        </div>
        <div
          v-for="(horse, i) in racingHorses"
          :key="horse.idx"
          class="lane"
          :class="i % 2 === 0 ? 'lane-odd' : 'lane-even'"
          :data-testid="`lane-${horse.idx}`"
        >
          <div class="track-area">
            <div class="finish-line" data-testid="finish-line"></div>
            <div
              class="horse-marker"
              :data-testid="`marker-${horse.idx}`"
              :style="markerStyle(horse.idx)"
            >
              <span
                class="marker-icon"
                :style="{ backgroundColor: horse.color }"
                aria-hidden="true"
              >
                <svg viewBox="0 0 64 64" class="marker-icon-svg" focusable="false">
                  <path
                    d="M14 38c0-6 5-11 11-11h4l5-8 8 3-3 6 6 3c3 1 5 5 5 8v8h-5v-6h-6l-2 11h-5l1-11h-6l-2 11h-5l1-12c-4-1-7-5-7-10Z"
                    fill="currentColor"
                  />
                  <circle cx="43" cy="24" r="2" fill="var(--color-bg-dominant)" />
                </svg>
              </span>
              <span class="marker-name">{{ horse.name }}</span>
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
  position: relative;
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
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.marker-icon {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.2));
}

.marker-icon-svg {
  width: 22px;
  height: 22px;
}

.marker-name {
  font-size: var(--font-label);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.countdown-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 12, 20, 0.28);
  pointer-events: none;
}

.countdown-value {
  min-width: 88px;
  min-height: 88px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(11, 18, 32, 0.82);
  color: #ffffff;
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
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
