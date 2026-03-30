<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const MARKER_SIZE = 38
const FINISH_LINE_WIDTH = 2

const currentRound = computed(() => store.getters['race/currentRound'])
const countdown = computed(() => store.getters['race/countdown'])
const gamePhase = computed(() => store.getters['race/gamePhase'])
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

const liveFinishOrder = ref([])

watch(positions, (newPositions) => {
  for (const [idxStr, pos] of Object.entries(newPositions)) {
    const idx = Number(idxStr)
    if (pos >= 1 && !liveFinishOrder.value.includes(idx)) {
      liveFinishOrder.value.push(idx)
    }
  }
})

watch(gamePhase, (phase) => {
  if (phase === 'RACING') liveFinishOrder.value = []
})

function finishPosition(horseIdx) {
  const pos = liveFinishOrder.value.indexOf(horseIdx)
  return pos === -1 ? null : pos + 1
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
            <div class="finish-line" data-testid="finish-line">
              <span v-if="finishPosition(horse.idx)" class="finish-position">
                {{ finishPosition(horse.idx) }}.
              </span>
            </div>
            <div
              class="horse-marker"
              :data-testid="`marker-${horse.idx}`"
              :style="markerStyle(horse.idx)"
            >
              <span class="marker-name">{{ horse.name }}</span>
              <span
                class="marker-icon"
                :class="{ 'marker-icon-running': gamePhase === 'RACING' && (positions[horse.idx] ?? 0) < 1 }"
                aria-hidden="true"
              >&#128014;</span>
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
  background:
    linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 80px),
    linear-gradient(180deg, #254f2f 0%, #183922 100%);
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
  flex: 1;
  min-height: 0;
  position: relative;
}

.lane {
  flex: 1;
  min-height: 42px;
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.lane-odd {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0)),
    linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 100%);
}

.lane-even {
  background:
    linear-gradient(180deg, rgba(0,0,0,0.08), rgba(255,255,255,0.02)),
    linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 100%);
}

.track-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-image:
    linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 12%);
  background-size: 72px 100%;
}

.finish-line {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  background:
    repeating-linear-gradient(
      180deg,
      #f6f2dd 0 10px,
      #2d2d2d 10px 20px
    );
  box-shadow: -2px 0 0 rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
}

.finish-position {
  position: absolute;
  right: 60px;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
}

.horse-marker {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: left 45ms linear;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.marker-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  line-height: 1;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45));
  transform: scaleX(-1);
  transform-origin: 50% 85%;
  user-select: none;
}

.marker-icon-running {
  animation: horse-bob 380ms ease-in-out infinite;
}

.marker-name {
  font-size: var(--font-label);
  font-weight: var(--font-weight-semibold);
  color: rgba(255, 255, 255, 0.96);
  white-space: nowrap;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  letter-spacing: 0.01em;
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

@keyframes horse-bob {
  0% {
    transform: scaleX(-1) translateY(0);
  }

  50% {
    transform: scaleX(-1) translateY(-3px);
  }

  100% {
    transform: scaleX(-1) translateY(0);
  }
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
