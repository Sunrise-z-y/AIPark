/**
 * 会员数据层（当前为前端演示实现）。
 *
 * 接入真实后端时，保留导出类型与函数签名，替换函数体即可。
 */

import { reactive } from 'vue'
import type { Member, MemberLevel } from './types'

const DAY = 24 * 3600000

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function seedMembers(): Member[] {
  const now = Date.now()
  const rows: Array<[string, string, string, MemberLevel, number, number, boolean]> = [
    ['张伟', '13800001111', '京A12345', '月卡会员', 320, 90, false],
    ['李娜', '13900002222', '沪B88888', '年卡会员', 1200, 210, false],
    ['王强', '13700003333', '粤C66666', 'VIP会员', 560, 40, false],
    ['刘洋', '13600004444', '苏D00001', '普通会员', 45, 12, false],
    ['陈静', '13500005555', '浙E52013', '月卡会员', 280, 65, false],
    ['杨帆', '13400006666', '京F99999', '年卡会员', 960, 300, false],
    ['赵敏', '13300007777', '川G13579', '普通会员', 20, 5, false],
    ['孙磊', '13200008888', '皖H24680', '月卡会员', 410, 150, false],
    ['周婷', '13100009999', '鲁J11223', 'VIP会员', 800, 180, false],
    ['吴昊', '13000000000', '豫K33445', '普通会员', 88, 25, true],
    ['郑爽', '18800001111', '冀L55667', '月卡会员', 200, 78, false],
    ['冯雪', '18700002222', '鄂M77889', '普通会员', 15, 8, false],
  ]
  return rows.map(([username, phone, plate, level, balance, daysAgo, frozen], i) => ({
    id: `M${String(i + 1).padStart(4, '0')}`,
    username,
    phone,
    plate,
    level,
    balance,
    joinedAt: now - daysAgo * DAY,
    status: frozen ? 'frozen' : 'active',
  }))
}

export const members = reactive<Member[]>(seedMembers())

let seq = 100
const nextId = () => `M${seq++}`

export interface MemberInput {
  username: string
  phone: string
  plate: string
  level: MemberLevel
}

export async function addMember(input: MemberInput): Promise<Member> {
  await wait(400)
  const member: Member = {
    id: nextId(),
    username: input.username.trim(),
    phone: input.phone.trim(),
    plate: input.plate.trim().toUpperCase(),
    level: input.level,
    balance: 0,
    joinedAt: Date.now(),
    status: 'active',
  }
  members.unshift(member)
  return member
}

export async function updateMember(
  id: string,
  patch: Partial<Pick<Member, 'username' | 'phone' | 'plate' | 'level'>>,
): Promise<void> {
  await wait(400)
  const member = members.find((m) => m.id === id)
  if (!member) throw new Error('NOT_FOUND')
  Object.assign(member, patch)
}

export async function toggleMemberStatus(id: string): Promise<void> {
  await wait(300)
  const member = members.find((m) => m.id === id)
  if (!member) throw new Error('NOT_FOUND')
  member.status = member.status === 'active' ? 'frozen' : 'active'
}

export async function removeMember(id: string): Promise<void> {
  await wait(300)
  const idx = members.findIndex((m) => m.id === id)
  if (idx >= 0) members.splice(idx, 1)
}
