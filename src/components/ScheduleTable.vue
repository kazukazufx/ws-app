<template>
  <div class="schedule-wrapper">
    <!-- Month Navigation -->
    <div class="month-nav">
      <button class="nav-btn" @click="prevMonth">＜</button>
      <div class="month-title">
        <span class="year">{{ year }}年</span>
        <span class="month">{{ month }}月</span>
        <span class="month-label">勤務予定表</span>
      </div>
      <button class="nav-btn" @click="nextMonth">＞</button>
      <button class="today-btn" @click="goToday">今月</button>
    </div>

    <!-- Summary legend -->
    <div class="legend">
      <div v-for="p in patterns" :key="p.id" class="legend-item">
        <span class="legend-badge" :style="{ color: p.color, backgroundColor: p.bgColor }">
          {{ p.abbreviation }}
        </span>
        <span class="legend-name">{{ p.name }}</span>
      </div>
    </div>

    <!-- Schedule Table -->
    <div class="table-container" ref="tableContainer">
      <table class="schedule-table">
        <thead>
          <!-- Day numbers row -->
          <tr>
            <th class="name-col">氏名</th>
            <th class="role-col">役職</th>
            <th
              v-for="day in days"
              :key="day.date"
              class="day-header"
              :class="{
                'is-today': day.isToday,
                'is-sunday': day.dayOfWeek === 0,
                'is-saturday': day.dayOfWeek === 6,
              }"
            >
              <div class="day-num">{{ day.day }}</div>
              <div class="day-week" :class="weekClass(day.dayOfWeek)">{{ weekdays[day.dayOfWeek] }}</div>
            </th>
            <th class="summary-col">日勤</th>
            <th class="summary-col">準夜</th>
            <th class="summary-col">夜勤</th>
            <th class="summary-col">勤務日</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in sortedEmployees" :key="emp.id" class="employee-row">
            <td class="name-cell" @click="openEmployeeModal(emp)">{{ emp.name }}</td>
            <td class="role-cell">{{ emp.role }}</td>
            <td
              v-for="day in days"
              :key="day.date"
              class="shift-cell"
              :class="{
                'is-today': day.isToday,
                'is-sunday': day.dayOfWeek === 0,
                'is-saturday': day.dayOfWeek === 6,
              }"
              @click="openShiftPicker(emp, day)"
            >
              <div
                v-if="getAssignedPattern(emp.id, day.date)"
                class="shift-badge"
                :style="{
                  color: getAssignedPattern(emp.id, day.date)!.color,
                  backgroundColor: getAssignedPattern(emp.id, day.date)!.bgColor,
                }"
                :title="getCellTooltip(emp.id, day.date)"
              >
                {{ getAssignedPattern(emp.id, day.date)!.abbreviation }}
              </div>
            </td>
            <td class="summary-cell">{{ getCount(emp.id, 'day') }}</td>
            <td class="summary-cell">{{ getCount(emp.id, 'evening') }}</td>
            <td class="summary-cell">{{ getCount(emp.id, 'night') }}</td>
            <td class="summary-cell work-days">{{ getWorkDays(emp.id) }}</td>
          </tr>

          <!-- Daily totals row -->
          <tr class="totals-row">
            <td class="name-cell total-label" colspan="2">日計</td>
            <td
              v-for="day in days"
              :key="day.date"
              class="total-cell"
            >
              <div class="total-day">{{ getDayTotal(day.date) }}</div>
            </td>
            <td colspan="4" class="total-sum">
              合計: {{ totalWorkHours }}h
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Shift Picker Modal -->
    <ShiftPickerModal
      v-if="pickerState.open"
      :employee-id="pickerState.employeeId"
      :employee-name="pickerState.employeeName"
      :date="pickerState.date"
      :current-shift-id="pickerState.currentShiftId"
      :current-note="pickerState.currentNote"
      @close="pickerState.open = false"
      @save="saveShift"
    />

    <!-- Employee Modal -->
    <EmployeeModal
      v-if="empModalState.open"
      :employee="empModalState.employee"
      @close="empModalState.open = false"
      @save="saveEmployee"
      @delete="deleteEmployee"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useShiftStore } from '../stores/shiftStore'
import { useEmployeeStore } from '../stores/employeeStore'
import ShiftPickerModal from './ShiftPickerModal.vue'
import EmployeeModal from './EmployeeModal.vue'
import type { Employee } from '../types'

const shiftStore = useShiftStore()
const employeeStore = useEmployeeStore()

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)
const weekdays = ['日', '月', '火', '水', '木', '金', '土']
const tableContainer = ref<HTMLElement | null>(null)

const patterns = computed(() => shiftStore.patterns)
const sortedEmployees = computed(() => employeeStore.sorted())

interface DayInfo {
  day: number
  date: string
  dayOfWeek: number
  isToday: boolean
}

const days = computed<DayInfo[]>(() => {
  const result: DayInfo[] = []
  const daysInMonth = new Date(year.value, month.value, 0).getDate()
  const todayStr = formatDate(today)
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year.value, month.value - 1, d)
    const dateStr = formatDate(dt)
    result.push({
      day: d,
      date: dateStr,
      dayOfWeek: dt.getDay(),
      isToday: dateStr === todayStr,
    })
  }
  return result
})

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function weekClass(dow: number) {
  if (dow === 0) return 'sun'
  if (dow === 6) return 'sat'
  return ''
}

function prevMonth() {
  if (month.value === 1) { month.value = 12; year.value-- }
  else month.value--
}

function nextMonth() {
  if (month.value === 12) { month.value = 1; year.value++ }
  else month.value++
}

function goToday() {
  year.value = today.getFullYear()
  month.value = today.getMonth() + 1
}

function getAssignedPattern(empId: string, date: string) {
  const a = shiftStore.getAssignment(empId, date)
  if (!a) return undefined
  return shiftStore.getPattern(a.shiftPatternId)
}

function getCellTooltip(empId: string, date: string): string {
  const a = shiftStore.getAssignment(empId, date)
  if (!a) return ''
  const p = shiftStore.getPattern(a.shiftPatternId)
  if (!p) return ''
  let tip = p.name
  if (!p.isOff) tip += ` ${p.startTime}〜${p.endTime}`
  if (a.note) tip += `\n備考: ${a.note}`
  return tip
}

function getCount(empId: string, patternId: string): number {
  return days.value.filter(d => {
    const a = shiftStore.getAssignment(empId, d.date)
    return a?.shiftPatternId === patternId
  }).length
}

function getWorkDays(empId: string): number {
  return days.value.filter(d => {
    const a = shiftStore.getAssignment(empId, d.date)
    if (!a) return false
    const p = shiftStore.getPattern(a.shiftPatternId)
    return p && !p.isOff
  }).length
}

function getDayTotal(date: string): number {
  return sortedEmployees.value.filter(emp => {
    const a = shiftStore.getAssignment(emp.id, date)
    if (!a) return false
    const p = shiftStore.getPattern(a.shiftPatternId)
    return p && !p.isOff
  }).length
}

const totalWorkHours = computed(() => {
  let total = 0
  for (const emp of sortedEmployees.value) {
    for (const day of days.value) {
      const a = shiftStore.getAssignment(emp.id, day.date)
      if (a) {
        const p = shiftStore.getPattern(a.shiftPatternId)
        if (p) total += p.workHours
      }
    }
  }
  return total
})

// Shift picker modal
const pickerState = reactive({
  open: false,
  employeeId: '',
  employeeName: '',
  date: '',
  currentShiftId: '',
  currentNote: '',
})

function openShiftPicker(emp: Employee, day: DayInfo) {
  const a = shiftStore.getAssignment(emp.id, day.date)
  pickerState.employeeId = emp.id
  pickerState.employeeName = emp.name
  pickerState.date = day.date
  pickerState.currentShiftId = a?.shiftPatternId ?? ''
  pickerState.currentNote = a?.note ?? ''
  pickerState.open = true
}

function saveShift(shiftId: string, note: string) {
  shiftStore.setAssignment(pickerState.employeeId, pickerState.date, shiftId, note)
  pickerState.open = false
}

// Employee modal
const empModalState = reactive({
  open: false,
  employee: undefined as Employee | undefined,
})

function openEmployeeModal(emp: Employee) {
  empModalState.employee = emp
  empModalState.open = true
}

function saveEmployee(data: { name: string; role: string; department: string }) {
  if (empModalState.employee) {
    employeeStore.updateEmployee(empModalState.employee.id, data)
  }
  empModalState.open = false
}

function deleteEmployee(id: string) {
  employeeStore.deleteEmployee(id)
  empModalState.open = false
}

defineExpose({ tableContainer })
</script>

<style scoped>
.schedule-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #f5f5f5;
}

.month-title {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.year {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.month {
  font-size: 28px;
  font-weight: 800;
  color: #1a237e;
}

.month-label {
  font-size: 14px;
  color: #666;
}

.today-btn {
  padding: 6px 14px;
  border: 1px solid #1a237e;
  border-radius: 6px;
  background: white;
  color: #1a237e;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.today-btn:hover {
  background: #e8eaf6;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #555;
}

.legend-badge {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.schedule-table {
  border-collapse: collapse;
  font-size: 13px;
  white-space: nowrap;
}

.schedule-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Freeze first two columns */
.schedule-table .name-col,
.schedule-table .name-cell {
  position: sticky;
  left: 0;
  z-index: 5;
  background: #fff;
}

.schedule-table .role-col,
.schedule-table .role-cell {
  position: sticky;
  left: 100px;
  z-index: 5;
  background: #fff;
}

.schedule-table thead th {
  background: #1a237e;
  color: white;
  padding: 6px 4px;
  text-align: center;
  border: 1px solid #283593;
}

.schedule-table thead .name-col,
.schedule-table thead .role-col {
  background: #1a237e;
  z-index: 15;
}

.name-col {
  width: 100px;
  min-width: 100px;
}

.role-col {
  width: 90px;
  min-width: 90px;
}

.day-header {
  width: 32px;
  min-width: 32px;
  font-size: 11px;
  padding: 4px 2px;
}

.day-header.is-today {
  background: #f57c00 !important;
}

.day-header.is-sunday {
  background: #c62828 !important;
}

.day-header.is-saturday {
  background: #0d47a1 !important;
}

.day-num {
  font-size: 12px;
  font-weight: 700;
}

.day-week {
  font-size: 10px;
  opacity: 0.9;
}

.day-week.sun { color: #ff8a80; }
.day-week.sat { color: #82b1ff; }

.summary-col {
  width: 44px;
  min-width: 44px;
  font-size: 11px;
  background: #283593 !important;
}

/* Body rows */
.employee-row:hover .name-cell,
.employee-row:hover .role-cell {
  background: #f5f5f5;
}

.name-cell {
  padding: 6px 10px;
  font-weight: 600;
  font-size: 13px;
  color: #1a237e;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  border-right: 2px solid #c5cae9;
}

.name-cell:hover {
  background: #e8eaf6 !important;
  text-decoration: underline;
}

.role-cell {
  padding: 6px 8px;
  font-size: 11px;
  color: #666;
  border: 1px solid #e0e0e0;
  border-right: 2px solid #e0e0e0;
}

.shift-cell {
  width: 32px;
  min-width: 32px;
  height: 36px;
  text-align: center;
  vertical-align: middle;
  padding: 2px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
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

.shift-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.summary-cell {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  border: 1px solid #e0e0e0;
  background: #f8f9ff;
}

.work-days {
  background: #e8eaf6;
  color: #1a237e;
}

/* Totals row */
.totals-row td {
  background: #f0f4ff;
  border: 1px solid #c5cae9;
}

.total-label {
  font-weight: 700;
  color: #1a237e;
  font-size: 12px;
}

.total-cell {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #555;
  padding: 4px 2px;
}

.total-day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #c5cae9;
  color: #1a237e;
  font-size: 11px;
  font-weight: 700;
}

.total-sum {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #1a237e;
}
</style>
