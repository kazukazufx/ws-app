<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>シフトパターン管理</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <!-- Pattern list -->
        <div class="pattern-list">
          <div
            v-for="p in patterns"
            :key="p.id"
            class="pattern-item"
            :style="{ borderLeftColor: p.color }"
          >
            <div class="pattern-badge" :style="{ color: p.color, backgroundColor: p.bgColor }">
              {{ p.abbreviation }}
            </div>
            <div class="pattern-info">
              <div class="pattern-name">{{ p.name }}</div>
              <div class="pattern-time">
                {{ p.isOff ? '休み系' : `${p.startTime} 〜 ${p.endTime}` }}
              </div>
            </div>
            <button class="edit-btn" @click="startEdit(p)">編集</button>
          </div>
        </div>

        <div class="divider" />

        <!-- Edit/Add form -->
        <div class="form-section">
          <h4>{{ editingId ? 'シフト編集' : '新規シフト追加' }}</h4>
          <div class="form-row">
            <div class="form-group">
              <label>略称 <span class="required">*</span></label>
              <input v-model="form.abbreviation" maxlength="2" placeholder="日" class="short-input" />
            </div>
            <div class="form-group flex-1">
              <label>シフト名 <span class="required">*</span></label>
              <input v-model="form.name" placeholder="日勤" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>開始時刻</label>
              <input v-model="form.startTime" type="time" :disabled="form.isOff" />
            </div>
            <div class="form-group flex-1">
              <label>終了時刻</label>
              <input v-model="form.endTime" type="time" :disabled="form.isOff" />
            </div>
            <div class="form-group">
              <label>勤務時間(h)</label>
              <input v-model.number="form.workHours" type="number" min="0" max="24" step="0.5" :disabled="form.isOff" class="short-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>文字色</label>
              <input v-model="form.color" type="color" class="color-input" />
            </div>
            <div class="form-group flex-1">
              <label>背景色</label>
              <input v-model="form.bgColor" type="color" class="color-input" />
            </div>
            <div class="form-group flex-1">
              <label>休み扱い</label>
              <label class="checkbox-label">
                <input v-model="form.isOff" type="checkbox" />
                <span>休み系</span>
              </label>
            </div>
          </div>
          <p v-if="formError" class="error">{{ formError }}</p>
          <div class="form-actions">
            <button v-if="editingId" class="btn-delete-sm" @click="deletePattern">削除</button>
            <button v-if="editingId" class="btn-cancel-sm" @click="cancelEdit">キャンセル</button>
            <button class="btn-save-sm" @click="savePattern">
              {{ editingId ? '更新' : '追加' }}
            </button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-close" @click="$emit('close')">閉じる</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useShiftStore } from '../stores/shiftStore'
import type { ShiftPattern } from '../types'

defineEmits<{ (e: 'close'): void }>()

const shiftStore = useShiftStore()
const patterns = computed(() => shiftStore.patterns)
const editingId = ref<string | null>(null)
const formError = ref('')

const defaultForm = () => ({
  name: '',
  abbreviation: '',
  startTime: '08:30',
  endTime: '17:30',
  color: '#1565c0',
  bgColor: '#e3f2fd',
  isOff: false,
  workHours: 8,
})

const form = reactive(defaultForm())

function startEdit(p: ShiftPattern) {
  editingId.value = p.id
  Object.assign(form, {
    name: p.name,
    abbreviation: p.abbreviation,
    startTime: p.startTime,
    endTime: p.endTime,
    color: p.color,
    bgColor: p.bgColor,
    isOff: p.isOff,
    workHours: p.workHours,
  })
}

function cancelEdit() {
  editingId.value = null
  Object.assign(form, defaultForm())
}

function savePattern() {
  formError.value = ''
  if (!form.name.trim() || !form.abbreviation.trim()) {
    formError.value = '略称とシフト名は必須です'
    return
  }
  if (editingId.value) {
    shiftStore.updatePattern(editingId.value, { ...form })
    cancelEdit()
  } else {
    shiftStore.addPattern({ ...form })
    Object.assign(form, defaultForm())
  }
}

function deletePattern() {
  if (editingId.value && confirm('このシフトパターンを削除しますか？')) {
    shiftStore.deletePattern(editingId.value)
    cancelEdit()
  }
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
  width: 540px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a237e;
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
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.pattern-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.pattern-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-left: 4px solid;
  border-radius: 6px;
  background: #fafafa;
}

.pattern-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}

.pattern-info {
  flex: 1;
}

.pattern-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.pattern-time {
  font-size: 11px;
  color: #777;
}

.edit-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #bbb;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.edit-btn:hover {
  background: #f0f0f0;
}

.divider {
  height: 1px;
  background: #e0e0e0;
  margin: 12px 0;
}

.form-section h4 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #555;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.form-group.flex-1 {
  flex: 1;
}

.form-group label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.required {
  color: #e53935;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="time"] {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 6px 8px;
  font-size: 13px;
  outline: none;
}

.form-group input:focus {
  border-color: #1a237e;
}

.form-group input:disabled {
  background: #f5f5f5;
  color: #aaa;
}

.short-input {
  width: 60px;
}

.color-input {
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 2px;
  cursor: pointer;
  width: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 0;
}

.error {
  color: #e53935;
  font-size: 12px;
  margin: -4px 0 6px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-delete-sm {
  padding: 6px 12px;
  border: 1px solid #ef5350;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  color: #ef5350;
  margin-right: auto;
}

.btn-cancel-sm {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  font-size: 12px;
}

.btn-save-sm {
  padding: 6px 16px;
  border: none;
  border-radius: 5px;
  background: #1a237e;
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.modal-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.btn-close {
  padding: 8px 24px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}
</style>
