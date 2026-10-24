/**
 * 系统设置（前端演示实现，持久化到 localStorage）。
 */

import { reactive } from 'vue'

export interface ParkingSettings {
  name: string
  address: string
  hourlyRate: number
  freeMinutes: number
  dailyCap: number
  notifyEntry: boolean
  notifyExit: boolean
  notifyFull: boolean
}

const STORAGE_KEY = 'smart-parking:settings'

const DEFAULTS: ParkingSettings = {
  name: '智慧停车场（朝阳旗舰店）',
  address: '北京市朝阳区建国路 88 号 · B1-B2 层',
  hourlyRate: 5,
  freeMinutes: 15,
  dailyCap: 60,
  notifyEntry: true,
  notifyExit: true,
  notifyFull: false,
}

function load(): ParkingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ParkingSettings>) }
  } catch {
    /* 忽略解析异常，回退默认值 */
  }
  return { ...DEFAULTS }
}

export const settings = reactive<ParkingSettings>(load())

export function saveSettings(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function resetSettings(): void {
  Object.assign(settings, DEFAULTS)
  saveSettings()
}
