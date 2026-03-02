import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { ShiftPattern, ShiftAssignment } from '../types'

const PATTERNS_KEY = 'kinmu_shift_patterns'
const ASSIGNMENTS_KEY = 'kinmu_shift_assignments'

const defaultPatterns: ShiftPattern[] = [
  {
    id: 'day',
    name: '日勤',
    abbreviation: '日',
    startTime: '08:30',
    endTime: '17:30',
    color: '#1565c0',
    bgColor: '#e3f2fd',
    isOff: false,
    workHours: 8,
  },
  {
    id: 'evening',
    name: '準夜勤',
    abbreviation: '準',
    startTime: '16:30',
    endTime: '01:00',
    color: '#e65100',
    bgColor: '#fff3e0',
    isOff: false,
    workHours: 8,
  },
  {
    id: 'night',
    name: '夜勤',
    abbreviation: '夜',
    startTime: '00:30',
    endTime: '09:00',
    color: '#4a148c',
    bgColor: '#f3e5f5',
    isOff: false,
    workHours: 8,
  },
  {
    id: 'after_night',
    name: '明け',
    abbreviation: '明',
    startTime: '',
    endTime: '',
    color: '#00838f',
    bgColor: '#e0f7fa',
    isOff: true,
    workHours: 0,
  },
  {
    id: 'off',
    name: '休日',
    abbreviation: '休',
    startTime: '',
    endTime: '',
    color: '#546e7a',
    bgColor: '#eceff1',
    isOff: true,
    workHours: 0,
  },
  {
    id: 'paid',
    name: '有給',
    abbreviation: '有',
    startTime: '',
    endTime: '',
    color: '#2e7d32',
    bgColor: '#e8f5e9',
    isOff: true,
    workHours: 0,
  },
  {
    id: 'special',
    name: '特休',
    abbreviation: '特',
    startTime: '',
    endTime: '',
    color: '#827717',
    bgColor: '#f9fbe7',
    isOff: true,
    workHours: 0,
  },
]

export const useShiftStore = defineStore('shifts', () => {
  const patterns = ref<ShiftPattern[]>([])
  const assignments = ref<ShiftAssignment[]>([])

  // Load patterns
  const savedPatterns = localStorage.getItem(PATTERNS_KEY)
  if (savedPatterns) {
    try {
      patterns.value = JSON.parse(savedPatterns)
    } catch {
      patterns.value = [...defaultPatterns]
    }
  } else {
    patterns.value = [...defaultPatterns]
  }

  // Load assignments
  const savedAssignments = localStorage.getItem(ASSIGNMENTS_KEY)
  if (savedAssignments) {
    try {
      assignments.value = JSON.parse(savedAssignments)
    } catch {
      assignments.value = []
    }
  }

  watch(patterns, (val) => {
    localStorage.setItem(PATTERNS_KEY, JSON.stringify(val))
  }, { deep: true })

  watch(assignments, (val) => {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(val))
  }, { deep: true })

  function getAssignment(employeeId: string, date: string): ShiftAssignment | undefined {
    return assignments.value.find(a => a.employeeId === employeeId && a.date === date)
  }

  function setAssignment(employeeId: string, date: string, shiftPatternId: string, note = '') {
    const idx = assignments.value.findIndex(a => a.employeeId === employeeId && a.date === date)
    if (idx !== -1) {
      if (shiftPatternId === '') {
        assignments.value.splice(idx, 1)
      } else {
        assignments.value[idx] = { employeeId, date, shiftPatternId, note }
      }
    } else if (shiftPatternId !== '') {
      assignments.value.push({ employeeId, date, shiftPatternId, note })
    }
  }

  function getPattern(id: string): ShiftPattern | undefined {
    return patterns.value.find(p => p.id === id)
  }

  function addPattern(pattern: Omit<ShiftPattern, 'id'>) {
    const id = Date.now().toString()
    patterns.value.push({ ...pattern, id })
  }

  function updatePattern(id: string, partial: Partial<ShiftPattern>) {
    const idx = patterns.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      const existing = patterns.value[idx]!
      patterns.value[idx] = { ...existing, ...partial }
    }
  }

  function deletePattern(id: string) {
    patterns.value = patterns.value.filter(p => p.id !== id)
    assignments.value = assignments.value.filter(a => a.shiftPatternId !== id)
  }

  function getMonthAssignments(employeeId: string, year: number, month: number): ShiftAssignment[] {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return assignments.value.filter(a => a.employeeId === employeeId && a.date.startsWith(prefix))
  }

  const patternMap = computed(() => {
    const map: Record<string, ShiftPattern> = {}
    for (const p of patterns.value) {
      map[p.id] = p
    }
    return map
  })

  function resetPatterns() {
    patterns.value = [...defaultPatterns]
  }

  return {
    patterns,
    assignments,
    patternMap,
    getAssignment,
    setAssignment,
    getPattern,
    addPattern,
    updatePattern,
    deletePattern,
    getMonthAssignments,
    resetPatterns,
  }
})
