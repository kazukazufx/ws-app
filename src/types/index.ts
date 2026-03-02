export interface Employee {
  id: string
  name: string
  role: string
  department: string
  order: number
}

export interface ShiftPattern {
  id: string
  name: string
  abbreviation: string
  startTime: string
  endTime: string
  color: string
  bgColor: string
  isOff: boolean
  workHours: number
}

export interface ShiftAssignment {
  employeeId: string
  date: string // YYYY-MM-DD
  shiftPatternId: string
  note: string
}

export interface MonthSummary {
  employeeId: string
  year: number
  month: number
  shiftCounts: Record<string, number>
  totalWorkHours: number
  workDays: number
}

export interface AppSettings {
  organizationName: string
  defaultDepartment: string
}
