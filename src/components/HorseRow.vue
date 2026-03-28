<template>
  <div class="horse-row" :data-testid="`horse-row-${index}`">
    <span class="swatch" :style="{ backgroundColor: horse.color }"></span>
    <span class="name">{{ horse.name }}</span>
    <span class="badge">{{ horse.condition }}</span>
  </div>
</template>

<script setup>
defineProps({
  horse: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})
</script>

<style scoped>
.horse-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  min-height: 28px;
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.name {
  flex: 1;
  font-size: var(--font-body);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
}

.badge {
  font-size: var(--font-label);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  background: var(--color-badge-bg);
  padding: var(--space-xs) var(--space-sm);
  border-radius: 4px;
}
</style>
