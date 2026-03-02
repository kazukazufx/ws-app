import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Employee } from '../types'

const STORAGE_KEY = 'kinmu_employees'

const defaultEmployees: Employee[] = [
  { id: '1', name: '山田 花子', role: '看護師長', department: '看護部', order: 0 },
  { id: '2', name: '鈴木 一郎', role: '看護師', department: '看護部', order: 1 },
  { id: '3', name: '田中 美穂', role: '看護師', department: '看護部', order: 2 },
  { id: '4', name: '佐藤 健二', role: '准看護師', department: '看護部', order: 3 },
  { id: '5', name: '高橋 さくら', role: '介護士', department: '介護部', order: 4 },
]

export const useEmployeeStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([])

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      employees.value = JSON.parse(saved) as Employee[]
    } catch {
      employees.value = [...defaultEmployees]
    }
  } else {
    employees.value = [...defaultEmployees]
  }

  watch(employees, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  function addEmployee(emp: Omit<Employee, 'id' | 'order'>) {
    const id = Date.now().toString()
    const order = employees.value.length
    employees.value.push({ ...emp, id, order })
  }

  function updateEmployee(id: string, partial: Partial<Employee>) {
    const idx = employees.value.findIndex(e => e.id === id)
    if (idx !== -1) {
      const existing = employees.value[idx]!
      employees.value[idx] = { ...existing, ...partial }
    }
  }

  function deleteEmployee(id: string) {
    employees.value = employees.value.filter(e => e.id !== id)
  }

  function reorder(from: number, to: number) {
    const arr = [...employees.value]
    const moved = arr.splice(from, 1)[0]
    if (!moved) return
    arr.splice(to, 0, moved)
    arr.forEach((e, i) => { e.order = i })
    employees.value = arr
  }

  const sorted = () => [...employees.value].sort((a, b) => a.order - b.order)

  return { employees, addEmployee, updateEmployee, deleteEmployee, reorder, sorted }
})
