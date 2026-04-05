<script setup>
import GameControls from './components/GameControls.vue'
import HorseRoster from './components/HorseRoster.vue'
import RaceTrack from './components/RaceTrack.vue'
import ResultsPanel from './components/ResultsPanel.vue'
</script>

<template>
  <div class="col col-roster" data-testid="col-roster">
    <GameControls />
    <HorseRoster />
  </div>
  <div class="col col-track">
    <RaceTrack />
  </div>
  <div class="col col-results">
    <ResultsPanel />
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

@media (max-width: 1100px) {
  .col {
    height: auto;
    min-height: 0;
  }

  .col-roster,
  .col-track {
    border-right: none;
    border-bottom: 1px solid var(--color-divider);
  }

  .col-roster {
    overflow: visible;
  }

  .col-track {
    min-height: 320px;
  }

  .col-results {
    min-height: 50vh;
  }
}
</style>
