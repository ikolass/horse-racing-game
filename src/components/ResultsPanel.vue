<script setup>
import { computed, watch, nextTick, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const allResults = computed(() => store.getters['results/allResults'])
const allHorses = computed(() => store.getters['horses/allHorses'])
const scrollContainer = ref(null)

watch(
  () => allResults.value.length,
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  }
)
</script>

<template>
  <div class="results-panel" data-testid="results-panel">
    <div class="panel-header">Results</div>

    <div class="results-scroll" ref="scrollContainer">
      <div v-if="allResults.length === 0" class="empty-state">
        No results yet. Generate a schedule and start racing.
      </div>

      <div
        v-for="result in allResults"
        :key="result.roundNumber"
        class="result-card"
        :data-testid="`result-round-${result.roundNumber}`"
      >
        <div class="result-heading">
          Round {{ result.roundNumber }} &#8212; {{ result.distance }}m
        </div>
        <ol class="finish-list">
          <li
            v-for="(horseIdx, place) in result.finishOrder"
            :key="horseIdx"
            class="finish-item"
          >
            <span class="place">{{ place + 1 }}.</span>
            <span
              class="swatch"
              :style="{ backgroundColor: allHorses[horseIdx].color }"
            ></span>
            <span class="horse-name">{{ allHorses[horseIdx].name }}</span>
          </li>
        </ol>
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  font-size: var(--font-body);
}

.result-card {
  background: var(--color-bg-dominant, #1a1a2e);
  border-radius: 6px;
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-sm);
}

.result-heading {
  font-size: var(--font-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  margin-bottom: var(--space-xs);
}

.finish-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.finish-item {
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
