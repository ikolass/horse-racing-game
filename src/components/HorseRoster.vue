<template>
  <div class="horse-roster" data-testid="horse-roster">
    <h2 class="roster-title">Horses</h2>
    <div class="roster-list">
      <HorseRow
        v-for="(horse, index) in horses"
        :key="index"
        :horse="horse"
        :index="index"
      />
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { computed } from 'vue'
import HorseRow from './HorseRow.vue'

const store = useStore()
const horses = computed(() => store.getters['horses/allHorses'])
</script>

<style scoped>
.horse-roster {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.roster-title {
  font-size: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  padding: var(--space-md);
}

.roster-list {
  flex: 1;
  overflow-y: auto;
}
</style>
