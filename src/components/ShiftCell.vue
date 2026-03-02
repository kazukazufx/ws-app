<template>
  <td
    class="shift-cell"
    :class="{
      'is-today': isToday,
      'is-sunday': dayOfWeek === 0,
      'is-saturday': dayOfWeek === 6,
      'is-holiday': isHoliday,
    }"
    @click="$emit('click')"
  >
    <div
      v-if="pattern"
      class="shift-badge"
      :style="{ color: pattern.color, backgroundColor: pattern.bgColor }"
    >
      {{ pattern.abbreviation }}
    </div>
    <div v-else class="shift-empty"></div>
  </td>
</template>

<script setup lang="ts">
import type { ShiftPattern } from '../types'

defineProps<{
  pattern?: ShiftPattern
  isToday?: boolean
  dayOfWeek: number
  isHoliday?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.shift-cell {
  width: 32px;
  min-width: 32px;
  max-width: 32px;
  height: 36px;
  text-align: center;
  vertical-align: middle;
  padding: 2px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  position: relative;
  transition: background-color 0.1s;
}

.shift-cell:hover {
  background-color: #f5f5f5;
}

.shift-cell.is-today {
  background-color: #fff8e1;
  border-color: #ffc107;
}

.shift-cell.is-sunday {
  background-color: #fff5f5;
}

.shift-cell.is-saturday {
  background-color: #f5f8ff;
}

.shift-cell.is-holiday {
  background-color: #fff5f5;
}

.shift-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.shift-empty {
  width: 26px;
  height: 26px;
}
</style>
