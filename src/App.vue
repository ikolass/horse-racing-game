<script setup>
import GameControls from './components/GameControls.vue'
import HorseRoster from './components/HorseRoster.vue'
import RaceTrackPlaceholder from './components/RaceTrackPlaceholder.vue'
import ResultsPlaceholder from './components/ResultsPlaceholder.vue'
</script>

<template>
  <div class="col col-roster" data-testid="col-roster">
    <GameControls />
    <HorseRoster />
  </div>
  <div class="col col-track">
    <RaceTrackPlaceholder />
  </div>
  <div class="col col-results">
    <ResultsPlaceholder />
  </div>
</template>

<style scoped>
.col {
  height: 100vh;
  overflow: hidden;
}

.col-roster {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-divider);
}

.col-track {
  border-right: 1px solid var(--color-divider);
}

.col-results {
  /* no left border — track column has right border */
}
</style>
