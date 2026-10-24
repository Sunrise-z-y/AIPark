/**
 * 停车管理系统共享领域类型。
 *
 * 页面与数据层之间统一使用这里的类型，接入真实后端时保持不变即可。
 */

/** 车位分区（物理布局，不含占用状态，占用由停车记录派生） */
export interface Zone {
  id: string
  name: string
  prefix: string
  floor: string
  slotCount: number
}

export type ParkingStatus = 'parking' | 'completed'

/** 一条停车记录：在场 = status 'parking'，已出场 = 'completed' */
export interface ParkingRecord {
  id: string
  plate: string
  slotCode: string
  entryAt: number
  exitAt?: number
  fee?: number
  status: ParkingStatus
}

export type PaymentMethod = '微信' | '支付宝' | 'ETC' | '现金' | '余额'

export interface BillingRecord {
  id: string
  plate: string
  slotCode: string
  entryAt: number
  exitAt: number
  amount: number
  method: PaymentMethod
  paidAt: number
  status: 'paid' | 'refunded'
}

export type MemberLevel = '普通会员' | '月卡会员' | '年卡会员' | 'VIP会员'

export interface Member {
  id: string
  username: string
  phone: string
  plate: string
  level: MemberLevel
  balance: number
  joinedAt: number
  status: 'active' | 'frozen'
}
