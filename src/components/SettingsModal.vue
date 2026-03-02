<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>設定</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>施設名</label>
          <input v-model="form.organizationName" type="text" placeholder="〇〇病院 〇〇病棟" />
        </div>
        <div class="form-group">
          <label>デフォルト部署</label>
          <input v-model="form.defaultDepartment" type="text" placeholder="看護部" />
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
import { reactive } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'

const emit = defineEmits<{ (e: 'close'): void }>()
const settingsStore = useSettingsStore()

const form = reactive({ ...settingsStore.settings })

function save() {
  settingsStore.updateSettings(form)
  emit('close')
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
  width: 360px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
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
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.form-group input {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  outline: none;
}

.form-group input:focus {
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
</style>
