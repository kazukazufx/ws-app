import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { AppSettings } from '../types'

const STORAGE_KEY = 'kinmu_settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({
    organizationName: '施設名',
    defaultDepartment: '看護部',
  })

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      settings.value = JSON.parse(saved)
    } catch {
      // ignore
    }
  }

  watch(settings, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  function updateSettings(partial: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...partial }
  }

  return { settings, updateSettings }
})
