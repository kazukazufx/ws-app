<template>
  <div class="app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <div class="app-logo">
          <span class="logo-icon">📋</span>
          <span class="app-name">勤務予定表</span>
        </div>
        <div class="org-name">{{ settings.organizationName }}</div>
      </div>
      <div class="header-actions">
        <button class="toolbar-btn" @click="showAddEmployee = true">
          ＋ 従業員
        </button>
        <button class="toolbar-btn" @click="showShiftPatterns = true">
          シフト設定
        </button>
        <button class="toolbar-btn print-btn" @click="printSchedule">
          🖨 印刷
        </button>
        <button class="toolbar-btn icon-btn" @click="showSettings = true">
          ⚙
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <ScheduleTable />
    </main>

    <!-- Modals -->
    <EmployeeModal
      v-if="showAddEmployee"
      @close="showAddEmployee = false"
      @save="addEmployee"
      @delete="() => {}"
    />

    <ShiftPatternModal
      v-if="showShiftPatterns"
      @close="showShiftPatterns = false"
    />

    <SettingsModal
      v-if="showSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ScheduleTable from './components/ScheduleTable.vue'
import EmployeeModal from './components/EmployeeModal.vue'
import ShiftPatternModal from './components/ShiftPatternModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import { useSettingsStore } from './stores/settingsStore'
import { useEmployeeStore } from './stores/employeeStore'

const settingsStore = useSettingsStore()
const employeeStore = useEmployeeStore()
const settings = computed(() => settingsStore.settings)

const showAddEmployee = ref(false)
const showShiftPatterns = ref(false)
const showSettings = ref(false)

function addEmployee(data: { name: string; role: string; department: string }) {
  employeeStore.addEmployee(data)
  showAddEmployee.value = false
}

function printSchedule() {
  window.print()
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', 'Noto Sans JP', sans-serif;
  height: 100%;
  background: #f0f2f5;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

@media print {
  .header-actions {
    display: none !important;
  }
  .app-main {
    padding: 0 !important;
  }
  .table-container {
    overflow: visible !important;
    max-height: none !important;
  }
  .month-nav .nav-btn,
  .month-nav .today-btn {
    display: none !important;
  }
}
</style>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.app-header {
  background: linear-gradient(135deg, #1a237e, #283593);
  color: white;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  flex-shrink: 0;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 22px;
}

.app-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.org-name {
  font-size: 14px;
  opacity: 0.85;
  border-left: 1px solid rgba(255,255,255,0.3);
  padding-left: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.toolbar-btn {
  padding: 7px 14px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: rgba(255,255,255,0.25);
}

.icon-btn {
  width: 36px;
  padding: 7px;
  font-size: 16px;
  text-align: center;
}

.app-main {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
</style>
