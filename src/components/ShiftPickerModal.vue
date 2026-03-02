<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>シフト設定</h3>
        <div class="modal-subtitle">{{ employeeName }} — {{ dateLabel }}</div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="shift-grid">
          <button
            v-for="pattern in patterns"
            :key="pattern.id"
            class="shift-option"
            :class="{ selected: selectedId === pattern.id }"
            :style="{ color: pattern.color, borderColor: selectedId === pattern.id ? pattern.color : '#e0e0e0', backgroundColor: pattern.bgColor }"
            @click="select(pattern.id)"
          >
            <span class="shift-abbr">{{ pattern.abbreviation }}</span>
            <span class="shift-name">{{ pattern.name }}</span>
            <span v-if="!pattern.isOff" class="shift-time">{{ pattern.startTime }}〜{{ pattern.endTime }}</span>
          </button>
          <button
            class="shift-option clear-option"
            :class="{ selected: selectedId === '' }"
            @click="select('')"
          >
            <span class="shift-abbr">―</span>
            <span class="shift-name">クリア</span>
          </button>
        </div>
        <div class="note-section">
          <label>備考</label>
          <input v-model="noteValue" type="text" placeholder="備考を入力..." class="note-input" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">キャンセル</button>
        <button class="btn-save" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useShiftStore } from '../stores/shiftStore'

const props = defineProps<{
  employeeId: string
  employeeName: string
  date: string
  currentShiftId: string
  currentNote: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', shiftId: string, note: string): void
}>()

const shiftStore = useShiftStore()
const patterns = computed(() => shiftStore.patterns)
const selectedId = ref(props.currentShiftId)
const noteValue = ref(props.currentNote)

const dateLabel = computed(() => {
  const d = new Date(props.date)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`
})

function select(id: string) {
  selectedId.value = id
}

function save() {
  emit('save', selectedId.value, noteValue.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 420px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.modal-header h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #1a237e;
}

.modal-subtitle {
  font-size: 13px;
  color: #666;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 16px 20px;
}

.shift-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.shift-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  background: #fafafa;
  transition: all 0.15s;
  gap: 2px;
}

.shift-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.shift-option.selected {
  box-shadow: 0 0 0 2px currentColor;
}

.clear-option {
  color: #9e9e9e !important;
  background: #f5f5f5 !important;
}

.clear-option.selected {
  border-color: #9e9e9e;
  box-shadow: 0 0 0 2px #9e9e9e;
}

.shift-abbr {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.shift-name {
  font-size: 11px;
  font-weight: 600;
}

.shift-time {
  font-size: 9px;
  opacity: 0.8;
}

.note-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.note-section label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.note-input {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.note-input:focus {
  border-color: #1a237e;
}

.modal-footer {
  padding: 12px 20px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-save {
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  background: #1a237e;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-save:hover {
  background: #283593;
}
</style>
