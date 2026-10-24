/** 日期、金额、车牌等格式化与校验工具。 */

const pad = (n: number) => String(n).padStart(2, '0')

/** 13:45 */
export function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 10月24日 13:45 */
export function formatDateTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 2026-10-24 */
export function formatFullDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 停放时长：x 分钟 / x 小时 y 分 */
export function formatDuration(entryAt: number, exitAt: number = Date.now()): string {
  const totalMin = Math.max(0, Math.floor((exitAt - entryAt) / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m} 分钟`
  return `${h} 小时 ${m} 分`
}

/** 金额：12.00 */
export function formatMoney(n: number): string {
  return n.toFixed(2)
}

/** 人民币：¥12.00 */
export function toMoney(n: number): string {
  return `¥${n.toFixed(2)}`
}

/** 中国大陆民用/新能源车牌（简化校验） */
const PLATE_RE =
  /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{5,6}$/

export function isValidPlate(v: string): boolean {
  return PLATE_RE.test(v)
}

export function normalizePlate(v: string): string {
  return v.trim().toUpperCase()
}
