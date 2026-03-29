<template>
  <div class="game-controls">
    <button
      class="btn btn-generate"
      data-testid="btn-generate"
      :disabled="generateDisabled"
      @click="handleGenerate"
    >
      Generate Schedule
    </button>
    <button
      class="btn btn-start"
      data-testid="btn-start"
      :disabled="startDisabled"
      @click="handleStart"
    >
      Start Race
    </button>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { computed } from 'vue'

const store = useStore()
const gamePhase = computed(() => store.getters['race/gamePhase'])

const generateDisabled = computed(() =>
  gamePhase.value === 'RACING' || gamePhase.value === 'ROUND_COMPLETE'
)
const startDisabled = computed(() =>
  gamePhase.value === 'IDLE' || gamePhase.value === 'RACING' || gamePhase.value === 'ROUND_COMPLETE' || gamePhase.value === 'DONE'
)

function handleGenerate() {
  store.dispatch('schedule/generateSchedule')
  store.dispatch('race/transitionTo', 'SCHEDULED')
  store.dispatch('results/clearResults')
}

function handleStart() {
  store.dispatch('race/startRace')
}
</script>

<style scoped>
.game-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-md);
}

.btn {
  width: 100%;
  min-height: 36px;
  border: none;
  border-radius: 6px;
  font-size: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  background: var(--color-accent);
  color: #ffffff;
}

.btn:disabled {
  background: var(--color-btn-disabled-bg);
  color: var(--color-btn-disabled-text);
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
