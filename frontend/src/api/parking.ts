/**
 * 停车业务数据层（当前为前端演示实现）。
 *
 * 采用「模块级 reactive 状态 + 异步函数」：仪表盘、车辆记录、收费记录、
 * 车位管理、统计报表共享同一份数据，保证跨模块一致。接入真实后端时，
 * 保留导出类型与函数签名，替换函数体即可。
 */

import { reactive } from 'vue'
import type { BillingRecord, ParkingRecord, PaymentMethod, Zone } from './types'

const HOUR = 3600000
const DAY = 24 * HOUR

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// ---------- 车位分区 ----------

export const zones = reactive<Zone[]>([
  { id: 'z-a', name: 'A 区', prefix: 'A', floor: 'B1', slotCount: 10 },
  { id: 'z-b', name: 'B 区', prefix: 'B', floor: 'B1', slotCount: 10 },
  { id: 'z-c', name: 'C 区', prefix: 'C', floor: 'B2', slotCount: 12 },
  { id: 'z-d', name: 'D 区', prefix: 'D', floor: 'B2', slotCount: 8 },
])

/** 维护中的车位（不可分配、不可入场） */
export const maintenance = reactive<string[]>(['C12', 'D08'])

// ---------- 停车 / 账单记录（单一数据源：在场 = status 'parking'） ----------

export const records = reactive<ParkingRecord[]>([])

export const billing = reactive<BillingRecord[]>([])

let seq = 10000
const nextId = (prefix: string) => `${prefix}${seq++}`

// ---------- 派生状态 ----------

export interface SlotInfo {
  code: string
  zone: Zone
  status: 'free' | 'occupied' | 'maintenance'
  plate?: string
  entryAt?: number
}

export function allSlots(): string[] {
  return zones.flatMap((z) =>
    Array.from({ length: z.slotCount }, (_, i) => `${z.prefix}${String(i + 1).padStart(2, '0')}`),
  )
}

function zoneSlots(zone: Zone): string[] {
  return Array.from({ length: zone.slotCount }, (_, i) => `${zone.prefix}${String(i + 1).padStart(2, '0')}`)
}

export function isOccupied(code: string): boolean {
  return records.some((r) => r.slotCode === code && r.status === 'parking')
}

export function getSlot(code: string): SlotInfo {
  const zone = zones.find((z) => code.startsWith(z.prefix)) ?? zones[0]!
  const record = records.find((r) => r.slotCode === code && r.status === 'parking')
  const status: SlotInfo['status'] = maintenance.includes(code)
    ? 'maintenance'
    : record
      ? 'occupied'
      : 'free'
  return { code, zone, status, plate: record?.plate, entryAt: record?.entryAt }
}

export function parkingCount(): number {
  return records.reduce((n, r) => (r.status === 'parking' ? n + 1 : n), 0)
}

export function freeCount(): number {
  return allSlots().filter((c) => !isOccupied(c) && !maintenance.includes(c)).length
}

export function todayEntryCount(): number {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return records.filter((r) => r.entryAt >= start.getTime()).length
}

export function todayRevenue(): number {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return billing.filter((b) => b.paidAt >= start.getTime()).reduce((s, b) => s + b.amount, 0)
}

export function last7Days(): { label: string; start: number }[] {
  const days: { label: string; start: number }[] = []
  for (let d = 6; d >= 0; d--) {
    const date = new Date(Date.now() - d * DAY)
    date.setHours(0, 0, 0, 0)
    days.push({ label: `${date.getMonth() + 1}/${date.getDate()}`, start: date.getTime() })
  }
  return days
}

export interface TrafficPoint {
  label: string
  entries: number
  exits: number
  revenue: number
}

export function trafficSeries(): TrafficPoint[] {
  const days = last7Days()
  return days.map((day, idx) => {
    const end = idx < days.length - 1 ? days[idx + 1]!.start : Date.now() + DAY
    const entries = records.filter((r) => r.entryAt >= day.start && r.entryAt < end).length
    const exits = records.filter((r) => r.exitAt != null && r.exitAt >= day.start && r.exitAt < end).length
    const revenue = billing
      .filter((b) => b.paidAt >= day.start && b.paidAt < end)
      .reduce((s, b) => s + b.amount, 0)
    return { label: day.label, entries, exits, revenue }
  })
}

// ---------- 计费 ----------

export function calcFee(entryAt: number, exitAt: number): number {
  const hours = Math.max(1, Math.ceil((exitAt - entryAt) / HOUR))
  return hours * 5
}

// ---------- 业务操作 ----------

export async function createEntry(plate: string): Promise<ParkingRecord> {
  await wait(450)
  const free = allSlots().find((c) => !isOccupied(c) && !maintenance.includes(c))
  if (!free) throw new Error('NO_FREE_SLOT')
  const record: ParkingRecord = {
    id: nextId('R'),
    plate,
    slotCode: free,
    entryAt: Date.now(),
    status: 'parking',
  }
  records.unshift(record)
  return record
}

export async function settleExit(
  recordId: string,
  method: PaymentMethod = '微信',
): Promise<{ fee: number }> {
  await wait(550)
  const record = records.find((r) => r.id === recordId && r.status === 'parking')
  if (!record) throw new Error('NOT_FOUND')
  const exitAt = Date.now()
  const fee = calcFee(record.entryAt, exitAt)
  record.exitAt = exitAt
  record.fee = fee
  record.status = 'completed'
  billing.unshift({
    id: nextId('B'),
    plate: record.plate,
    slotCode: record.slotCode,
    entryAt: record.entryAt,
    exitAt,
    amount: fee,
    method,
    paidAt: exitAt,
    status: 'paid',
  })
  return { fee }
}

export async function addZone(input: {
  name: string
  prefix: string
  floor: string
  slotCount: number
}): Promise<Zone> {
  await wait(400)
  const prefix = input.prefix.trim().toUpperCase()
  if (!/^[A-Z]$/.test(prefix)) throw new Error('BAD_PREFIX')
  if (zones.some((z) => z.prefix === prefix)) throw new Error('PREFIX_EXISTS')
  const zone: Zone = {
    id: `z-${prefix.toLowerCase()}`,
    name: input.name.trim(),
    prefix,
    floor: input.floor.trim(),
    slotCount: input.slotCount,
  }
  zones.push(zone)
  return zone
}

export async function removeZone(zoneId: string): Promise<void> {
  await wait(400)
  const idx = zones.findIndex((z) => z.id === zoneId)
  if (idx < 0) return
  const zone = zones[idx]!
  if (zoneSlots(zone).some(isOccupied)) throw new Error('ZONE_BUSY')
  zones.splice(idx, 1)
}

export function setMaintenance(code: string, on: boolean): void {
  if (on) {
    if (!maintenance.includes(code)) maintenance.push(code)
  } else {
    const i = maintenance.indexOf(code)
    if (i >= 0) maintenance.splice(i, 1)
  }
}

// ---------- 种子数据（确定性伪随机，保证每次刷新一致） ----------

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seed() {
  const rnd = mulberry32(20261024)
  const now = Date.now()
  const slots = allSlots()

  const PLATE_PREFIX = '京沪粤苏浙川皖鲁豫冀鄂湘赣桂闽陕'
  const PLATE_LETTER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const PLATE_TAIL = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  const pick = (arr: string) => arr[Math.floor(rnd() * arr.length)] ?? arr[0]!
  const randomPlate = () =>
    `${pick(PLATE_PREFIX)}${pick(PLATE_LETTER)}${Array.from({ length: 5 }, () => pick(PLATE_TAIL)).join('')}`

  let rid = 1

  // 历史完成记录（近 7 天，用于车辆/收费/报表）
  for (let d = 6; d >= 0; d--) {
    const base = new Date(now - d * DAY)
    base.setHours(8, 0, 0, 0)
    const count = 6 + Math.floor(rnd() * 8)
    for (let i = 0; i < count; i++) {
      const entryAt = base.getTime() + Math.floor(rnd() * 12 * HOUR)
      const exitAt = entryAt + (40 + Math.floor(rnd() * 220)) * 60000
      if (exitAt > now - 5 * 60000) continue
      records.push({
        id: `R${String(rid++).padStart(4, '0')}`,
        plate: randomPlate(),
        slotCode: slots[Math.floor(rnd() * slots.length)]!,
        entryAt,
        exitAt,
        fee: Math.max(5, Math.ceil((exitAt - entryAt) / HOUR) * 5),
        status: 'completed',
      })
    }
  }

  // 当前在场车辆（保证车位不重复、避开维护位）
  const parked: Array<[string, number]> = [
    ['京A12345', 34],
    ['沪B88888', 72],
    ['粤C66666', 6],
    ['苏D00001', 128],
    ['浙E52013', 41],
    ['京F99999', 15],
    ['川G13579', 55],
    ['皖H24680', 90],
    ['鲁J11223', 22],
    ['豫K33445', 64],
  ]
  const used = new Set<string>()
  for (const [plate, mins] of parked) {
    let code = slots[Math.floor(rnd() * slots.length)]!
    while (used.has(code) || maintenance.includes(code)) {
      code = slots[Math.floor(rnd() * slots.length)]!
    }
    used.add(code)
    records.push({
      id: `R${String(rid++).padStart(4, '0')}`,
      plate,
      slotCode: code,
      entryAt: now - mins * 60000,
      status: 'parking',
    })
  }

  // 账单记录（与历史完成记录一一对应）
  const methods: PaymentMethod[] = ['微信', '支付宝', 'ETC', '现金', '余额']
  let bid = 1
  for (const r of records) {
    if (r.status !== 'completed' || r.exitAt == null || r.fee == null) continue
    billing.push({
      id: `B${String(bid++).padStart(4, '0')}`,
      plate: r.plate,
      slotCode: r.slotCode,
      entryAt: r.entryAt,
      exitAt: r.exitAt,
      amount: r.fee,
      method: methods[Math.floor(rnd() * methods.length)]!,
      paidAt: r.exitAt,
      status: 'paid',
    })
  }
}

seed()
