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
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const generateDisabled = computed(() => !store.getters['race/canGenerateSchedule'])
const startDisabled = computed(() => !store.getters['race/canStartRace'])

function handleGenerate() {
  store.dispatch('race/resetRace')
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
