<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEdit ? '従業員編集' : '従業員追加' }}</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>氏名 <span class="required">*</span></label>
          <input v-model="form.name" type="text" placeholder="山田 花子" />
        </div>
        <div class="form-group">
          <label>役職</label>
          <input v-model="form.role" type="text" placeholder="看護師" list="role-list" />
          <datalist id="role-list">
            <option value="看護師長" />
            <option value="副看護師長" />
            <option value="看護師" />
            <option value="准看護師" />
            <option value="介護士" />
            <option value="介護福祉士" />
            <option value="介護主任" />
            <option value="ケアマネージャー" />
            <option value="理学療法士" />
            <option value="作業療法士" />
          </datalist>
        </div>
        <div class="form-group">
          <label>部署</label>
          <input v-model="form.department" type="text" placeholder="看護部" list="dept-list" />
          <datalist id="dept-list">
            <option value="看護部" />
            <option value="介護部" />
            <option value="リハビリ部" />
            <option value="事務" />
          </datalist>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
      <div class="modal-footer">
        <button v-if="isEdit" class="btn-delete" @click="handleDelete">削除</button>
        <div class="spacer" />
        <button class="btn-cancel" @click="$emit('close')">キャンセル</button>
        <button class="btn-save" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { Employee } from '../types'

const props = defineProps<{
  employee?: Employee
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { name: string; role: string; department: string }): void
  (e: 'delete', id: string): void
}>()

const isEdit = computed(() => !!props.employee)
const error = ref('')

const form = reactive({
  name: props.employee?.name ?? '',
  role: props.employee?.role ?? '',
  department: props.employee?.department ?? '',
})

function handleSave() {
  if (!form.name.trim()) {
    error.value = '氏名は必須です'
    return
  }
  emit('save', { name: form.name.trim(), role: form.role.trim(), department: form.department.trim() })
}

function handleDelete() {
  if (props.employee && confirm(`${props.employee.name} を削除しますか？`)) {
    emit('delete', props.employee.id)
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
  width: 380px;
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
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
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

.required {
  color: #e53935;
}

.form-group input {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.form-group input:focus {
  border-color: #1a237e;
}

.error {
  color: #e53935;
  font-size: 12px;
  margin: 0;
}

.modal-footer {
  padding: 12px 20px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.spacer {
  flex: 1;
}

.btn-delete {
  padding: 8px 16px;
  border: 1px solid #ef5350;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #ef5350;
}

.btn-delete:hover {
  background: #ffebee;
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
