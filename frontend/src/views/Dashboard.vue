<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <section class="page-head">
      <div>
        <h1>停车管理控制台</h1>
        <p class="page-sub">实时掌握车位与车辆进出情况</p>
      </div>
      <div class="page-badge">
        <span class="live-dot" aria-hidden="true"></span>
        <span>系统运行中</span>
      </div>
    </section>

    <!-- KPI 统计卡片 -->
    <section class="kpi-grid" aria-label="车位概览">
      <article v-for="s in statCards" :key="s.key" class="stat-card">
        <div class="stat-icon" :class="`stat-icon--${s.key}`" aria-hidden="true">
          <svg
            v-if="s.key === 'total'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.6" />
            <rect x="14" y="3" width="7" height="7" rx="1.6" />
            <rect x="3" y="14" width="7" height="7" rx="1.6" />
            <rect x="14" y="14" width="7" height="7" rx="1.6" />
          </svg>
          <svg
            v-else-if="s.key === 'free'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="3.5" />
            <path d="m8.4 12.1 2.4 2.5 5-5.2" />
          </svg>
          <svg
            v-else-if="s.key === 'occupied'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M7 16.5v-2.2c0-.5.3-.9.8-1l1.4-.2 1.5-2.9c.3-.6.9-1 1.6-1h.4c.7 0 1.3.4 1.6 1l1.5 2.9 1.4.2c.5.1.8.5.8 1v2.2" />
            <circle cx="9" cy="16.5" r="1.5" />
            <circle cx="15" cy="16.5" r="1.5" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">{{ s.label }}</span>
          <strong class="stat-value">{{ s.value }}</strong>
          <span class="stat-hint">{{ s.hint }}</span>
        </div>
      </article>
    </section>

    <!-- 中部：车位状态 + 进出控制台 -->
    <section class="mid-grid">
      <!-- 实时车位状态 -->
      <section class="panel slot-panel">
        <header class="panel-head">
          <div>
            <h2>实时车位状态</h2>
            <p class="panel-sub">共 {{ totalSlots }} 个车位 · 已占用 {{ occupiedCount }}</p>
          </div>
          <div class="legend">
            <span class="legend-item"><i class="dot dot--free" aria-hidden="true"></i>空闲</span>
            <span class="legend-item"><i class="dot dot--occupied" aria-hidden="true"></i>已占用</span>
            <span class="legend-item"><i class="dot dot--maintenance" aria-hidden="true"></i>维护中</span>
          </div>
        </header>

        <!-- 占用率 -->
        <div class="meter">
          <div class="meter-head">
            <span>车位占用率</span>
            <strong class="num" :style="{ color: occupancyColor }">{{ occupancyRate }}%</strong>
          </div>
          <div
            class="meter-track"
            role="progressbar"
            :aria-valuenow="occupancyRate"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="meter-fill"
              :style="{ width: occupancyRate + '%', background: occupancyColor }"
            ></div>
          </div>
        </div>

        <!-- 分区分组的车位网格 -->
        <div class="zones">
          <div v-for="board in zoneBoards" :key="board.zone.id" class="zone">
            <div class="zone-head">
              <span class="zone-name">{{ board.zone.name }} <span class="zone-floor">{{ board.zone.floor }}层</span></span>
              <span class="zone-count">{{ zoneFreeCount(board.slots) }} 空闲 / {{ board.slots.length }} 位</span>
            </div>
            <div class="slot-grid">
              <div
                v-for="slot in board.slots"
                :key="slot.code"
                class="slot"
                :class="{
                  'is-occupied': slot.status === 'occupied',
                  'is-maintenance': slot.status === 'maintenance',
                }"
                :title="slotTitle(slot)"
              >
                <span class="slot-code num">{{ slot.code }}</span>
                <span class="slot-state">{{ slotStateLabel(slot) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 车辆进出控制台 -->
      <section class="panel entry-panel">
        <header class="panel-head">
          <div>
            <h2>车辆进出控制台</h2>
            <p class="panel-sub">登记入场车辆，自动分配空闲车位</p>
          </div>
        </header>

        <form class="entry-form" @submit.prevent="handleEntry">
          <label class="entry-label" for="plate-input">车牌号码</label>
          <div class="plate-row">
            <el-input
              id="plate-input"
              v-model="plate"
              class="plate-input"
              placeholder="如：京A88888"
              size="large"
              clearable
            />
            <el-button type="primary" native-type="submit" class="entry-btn" :loading="entryLoading">
              确认入场
            </el-button>
          </div>
        </form>
        <p class="entry-tip">入场即开始计时，出场按 {{ settings.hourlyRate }} 元 / 小时结算</p>

        <div class="recent">
          <div class="recent-head">
            <span>最近出场</span>
            <span v-if="recentExits.length" class="recent-sum">合计 ¥{{ recentExitsTotal }}</span>
          </div>
          <ul v-if="recentExits.length" class="recent-list">
            <li v-for="r in recentExits" :key="r.id" class="recent-item">
              <span class="plate-badge num">{{ r.plate }}</span>
              <span class="recent-meta">{{ formatTime(r.exitAt) }}</span>
              <span class="recent-fee num">¥{{ formatMoney(r.amount) }}</span>
            </li>
          </ul>
          <p v-else class="recent-empty">暂无出场记录</p>
        </div>
      </section>
    </section>

    <!-- 场内车辆实时监控 -->
    <section class="panel">
      <header class="panel-head">
        <div>
          <h2>场内车辆实时监控</h2>
          <p class="panel-sub">当前在场 {{ parkingVehicles.length }} 辆</p>
        </div>
      </header>

      <div v-if="parkingVehicles.length" class="vehicle-table">
        <div class="vehicle-row vehicle-row--head" aria-hidden="true">
          <span>车牌号</span>
          <span>车位</span>
          <span>入场时间</span>
          <span>停放时长</span>
          <span>状态</span>
          <span></span>
        </div>
        <div v-for="v in parkingVehicles" :key="v.id" class="vehicle-row">
          <span class="vehicle-plate"><span class="plate-badge num">{{ v.plate }}</span></span>
          <span class="vehicle-cell num">{{ v.slotCode }}</span>
          <span class="vehicle-cell num">{{ formatTime(v.entryAt) }}</span>
          <span class="vehicle-cell num">{{ formatDuration(v.entryAt, now) }}</span>
          <span class="vehicle-cell"><i class="dot dot--occupied" aria-hidden="true"></i>停放中</span>
          <span class="vehicle-actions">
            <el-button size="small" class="exit-btn" :loading="exitingId === v.id" @click="handleExit(v)">
              出场结算
            </el-button>
          </span>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M8 18.5V5.5h5.2a4 4 0 0 1 0 8H8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <p>暂无在场车辆</p>
        <span>在上方登记车牌号即可入场</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  billing,
  createEntry,
  freeCount,
  getSlot,
  parkingCount,
  records,
  settleExit,
  todayEntryCount,
  zones,
  allSlots,
  type SlotInfo,
} from '@/api/parking'
import type { Zone } from '@/api/types'
import { settings } from '@/api/settings'
import { formatDuration, formatMoney, formatTime, isValidPlate, normalizePlate } from '@/utils/format'

interface ParkingVehicle {
  id: string
  plate: string
  slotCode: string
  entryAt: number
}

const plate = ref('')
const entryLoading = ref(false)
const exitingId = ref('')
const now = ref(Date.now())

const timer = window.setInterval(() => {
  now.value = Date.now()
}, 1000)

onUnmounted(() => window.clearInterval(timer))

function zoneCodes(zone: Zone): string[] {
  return Array.from({ length: zone.slotCount }, (_, i) => `${zone.prefix}${String(i + 1).padStart(2, '0')}`)
}

const zoneBoards = computed(() =>
  zones.map((zone) => ({
    zone,
    slots: zoneCodes(zone).map((code) => getSlot(code)),
  })),
)

const totalSlots = computed(() => allSlots().length)
const occupiedCount = computed(() => parkingCount())
const freeSlots = computed(() => freeCount())
const occupancyRate = computed(() =>
  totalSlots.value ? Math.round((occupiedCount.value / totalSlots.value) * 100) : 0,
)

const parkingVehicles = computed<ParkingVehicle[]>(() =>
  records
    .filter((r) => r.status === 'parking')
    .map((r) => ({ id: r.id, plate: r.plate, slotCode: r.slotCode, entryAt: r.entryAt }))
    .sort((a, b) => b.entryAt - a.entryAt),
)

const recentExits = computed(() => billing.slice(0, 5))
const recentExitsTotal = computed(() =>
  billing.slice(0, 5).reduce((sum, r) => sum + r.amount, 0),
)

const statCards = computed(() => [
  { key: 'total', label: '总车位', value: String(totalSlots.value), hint: '场内全部车位' },
  { key: 'free', label: '空闲车位', value: String(freeSlots.value), hint: '可立即分配' },
  {
    key: 'occupied',
    label: '已占用',
    value: String(occupiedCount.value),
    hint: `占用率 ${occupancyRate.value}%`,
  },
  { key: 'today', label: '今日入场', value: String(todayEntryCount()), hint: '累计入场次数' },
])

const occupancyColor = computed(() => {
  const r = occupancyRate.value
  if (r >= 90) return '#d03b3b'
  if (r >= 70) return '#d97706'
  return '#1c64f2'
})

function zoneFreeCount(slots: SlotInfo[]): number {
  return slots.filter((s) => s.status === 'free').length
}

function slotStateLabel(slot: SlotInfo): string {
  if (slot.status === 'maintenance') return '维护中'
  if (slot.status === 'occupied') return '已占用'
  return '空闲'
}

function slotTitle(slot: SlotInfo): string {
  if (slot.status === 'occupied') return `${slot.code} · ${slot.plate}`
  if (slot.status === 'maintenance') return `${slot.code} · 维护中`
  return `${slot.code} · 空闲`
}

async function handleEntry() {
  if (entryLoading.value) return
  const p = normalizePlate(plate.value)
  if (!p) {
    ElMessage.warning('请输入车牌号')
    return
  }
  if (!isValidPlate(p)) {
    ElMessage.warning('车牌号格式不正确，例如：京A88888')
    return
  }

  entryLoading.value = true
  try {
    const record = await createEntry(p)
    plate.value = ''
    ElMessage.success(`车辆 ${record.plate} 已入场，分配车位 ${record.slotCode}`)
  } catch {
    ElMessage.error('暂无可用车位')
  } finally {
    entryLoading.value = false
  }
}

async function handleExit(v: ParkingVehicle) {
  if (exitingId.value) return
  exitingId.value = v.id
  try {
    const { fee } = await settleExit(v.id)
    ElNotification({
      title: '出场结算完成',
      message: `${v.plate} · 停车费 ¥${fee}`,
      type: 'success',
    })
  } catch {
    ElMessage.error('结算失败，请稍后重试')
  } finally {
    exitingId.value = ''
  }
}
</script>

<style scoped>
.dashboard {
  --dash-primary: #1c64f2;
  --dash-primary-dark: #0a3f9e;
  --dash-primary-light: #4b8bff;
  --dash-ink: #0f1f3d;
  --dash-ink-soft: #64748b;
  --dash-ink-muted: #94a3b8;
  --dash-border: #e6edf7;
  --dash-good: #16a34a;
  --dash-good-bg: #e9f8ee;
  --dash-good-border: #c4ead0;

  color: var(--dash-ink);
}

.num {
  font-variant-numeric: tabular-nums;
}

/* ---------- 页面标题 ---------- */

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22px;
}

.page-head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.page-sub {
  margin-top: 6px;
  color: var(--dash-ink-soft);
  font-size: 13px;
}

.page-badge {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 7px 13px;
  color: var(--dash-good);
  font-size: 12px;
  font-weight: 500;
  background: var(--dash-good-bg);
  border: 1px solid var(--dash-good-border);
  border-radius: 999px;
}

.live-dot {
  position: relative;
  display: inline-block;
  width: 7px;
  height: 7px;
  background: var(--dash-good);
  border-radius: 50%;
}

.live-dot::after {
  position: absolute;
  inset: -3px;
  content: '';
  border: 1px solid rgba(22, 163, 74, 0.4);
  border-radius: 50%;
  animation: live-pulse 2.2s ease-out infinite;
}

/* ---------- KPI 卡片 ---------- */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.stat-card {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border: 1px solid var(--dash-border);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(15, 31, 61, 0.04);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 31, 61, 0.08);
}

.stat-icon {
  display: grid;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 13px;
  place-items: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon--total {
  color: #6250d6;
  background: #f0edfb;
}

.stat-icon--free {
  color: var(--dash-good);
  background: var(--dash-good-bg);
}

.stat-icon--occupied {
  color: var(--dash-primary);
  background: #eef3fb;
}

.stat-icon--today {
  color: #d97706;
  background: #fdf2e2;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.stat-label {
  color: var(--dash-ink-soft);
  font-size: 13px;
}

.stat-value {
  font-size: 27px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.stat-hint {
  color: var(--dash-ink-muted);
  font-size: 11px;
}

/* ---------- 面板 ---------- */

.mid-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.95fr);
  gap: 18px;
  margin-bottom: 18px;
}

.panel {
  padding: 22px;
  margin-bottom: 18px;
  background: #ffffff;
  border: 1px solid var(--dash-border);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(15, 31, 61, 0.04);
}

.mid-grid .panel {
  margin-bottom: 0;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.panel-sub {
  margin-top: 4px;
  color: var(--dash-ink-muted);
  font-size: 12px;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: var(--dash-ink-soft);
  font-size: 12px;
}

.dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 3px;
}

.dot--free {
  background: var(--dash-good);
}

.dot--occupied {
  background: var(--dash-primary);
}

.dot--maintenance {
  background: #94a3b8;
}

/* 占用率 meter */

.meter {
  padding: 14px 16px;
  margin-bottom: 20px;
  background: #f8fbff;
  border: 1px solid #e4edfc;
  border-radius: 12px;
}

.meter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--dash-ink-soft);
  font-size: 12px;
}

.meter-head strong {
  font-size: 16px;
  font-weight: 700;
}

.meter-track {
  height: 8px;
  overflow: hidden;
  background: #e4edfc;
  border-radius: 999px;
}

.meter-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
    background-color 0.3s ease;
}

/* 车位网格 */

.zones {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.zone-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.zone-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--dash-ink);
}

.zone-floor {
  margin-left: 4px;
  color: var(--dash-ink-muted);
  font-size: 11px;
  font-weight: 500;
}

.zone-count {
  font-size: 12px;
  color: var(--dash-ink-muted);
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.slot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: space-between;
  height: 52px;
  padding: 8px 10px;
  color: var(--dash-good);
  background: var(--dash-good-bg);
  border: 1px solid var(--dash-good-border);
  border-radius: 10px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.slot:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 31, 61, 0.08);
}

.slot.is-occupied {
  color: var(--dash-primary);
  background: #eef3fb;
  border-color: #d7e4f7;
}

.slot.is-maintenance {
  color: var(--dash-ink-muted);
  background: #f1f4f9;
  border-color: #e3e8f0;
}

.slot-code {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.slot-state {
  font-size: 10px;
  line-height: 1;
}

.slot.is-occupied .slot-state {
  color: var(--dash-ink-soft);
}

.slot.is-maintenance .slot-state {
  color: var(--dash-ink-muted);
}

/* ---------- 进出控制台 ---------- */

.entry-panel {
  display: flex;
  flex-direction: column;
}

.entry-form {
  margin-bottom: 6px;
}

.entry-label {
  display: block;
  margin-bottom: 8px;
  color: #344054;
  font-size: 13px;
  font-weight: 500;
}

.plate-row {
  display: flex;
  gap: 10px;
}

.plate-input {
  flex: 1;
}

.plate-input :deep(.el-input__wrapper) {
  min-height: 46px;
  background: #f8fbff;
  border-radius: 11px;
  box-shadow: 0 0 0 1px var(--dash-border) inset;
}

.plate-input :deep(.el-input__inner) {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--dash-ink);
}

.entry-btn.el-button {
  height: 46px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--dash-primary), var(--dash-primary-light));
  border: 0;
  border-radius: 11px;
  box-shadow: 0 8px 18px rgba(28, 100, 242, 0.22);
}

.entry-btn.el-button:hover,
.entry-btn.el-button:focus {
  background: linear-gradient(135deg, #1559e3, #3f81ff);
  box-shadow: 0 12px 24px rgba(28, 100, 242, 0.3);
  transform: translateY(-1px);
}

.entry-tip {
  margin: 0 0 20px;
  color: var(--dash-ink-muted);
  font-size: 11px;
}

.recent {
  padding-top: 18px;
  border-top: 1px solid var(--dash-border);
}

.recent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
}

.recent-sum {
  color: var(--dash-primary);
  font-weight: 700;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.recent-item {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.recent-meta {
  flex: 1;
  color: var(--dash-ink-muted);
  font-size: 12px;
  text-align: right;
}

.recent-fee {
  color: var(--dash-ink);
  font-size: 13px;
  font-weight: 600;
}

.recent-empty {
  margin: 0;
  color: var(--dash-ink-muted);
  font-size: 12px;
  text-align: center;
}

/* 车牌徽标 */

.plate-badge {
  display: inline-flex;
  padding: 3px 9px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--dash-primary), var(--dash-primary-light));
  border-radius: 6px;
}

/* ---------- 场内车辆列表 ---------- */

.vehicle-table {
  overflow-x: auto;
}

.vehicle-row {
  display: grid;
  grid-template-columns: minmax(120px, 1.4fr) 90px 120px 130px 110px 96px;
  gap: 12px;
  align-items: center;
  padding: 13px 6px;
  border-bottom: 1px solid #f0f4fb;
}

.vehicle-row:last-child {
  border-bottom: 0;
}

.vehicle-row--head {
  padding-top: 0;
  color: var(--dash-ink-muted);
  font-size: 12px;
}

.vehicle-cell {
  color: var(--dash-ink-soft);
  font-size: 13px;
}

.vehicle-cell .dot {
  margin-right: 6px;
  vertical-align: middle;
}

.exit-btn.el-button {
  color: var(--dash-primary);
  background: #eef3fb;
  border: 0;
  border-radius: 8px;
}

.exit-btn.el-button:hover {
  color: #ffffff;
  background: var(--dash-primary);
}

/* ---------- 空状态 ---------- */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 44px 0;
  color: var(--dash-ink-muted);
}

.empty-icon {
  display: grid;
  width: 60px;
  height: 60px;
  margin-bottom: 14px;
  color: #b7c4d9;
  background: #f4f8ff;
  border-radius: 50%;
  place-items: center;
}

.empty-icon svg {
  width: 30px;
  height: 30px;
}

.empty-state p {
  margin: 0;
  color: var(--dash-ink-soft);
  font-size: 14px;
  font-weight: 500;
}

.empty-state span {
  margin-top: 6px;
  font-size: 12px;
}

/* ---------- 动效 ---------- */

@keyframes live-pulse {
  0% {
    opacity: 0.8;
    transform: scale(0.7);
  }
  70%,
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

/* ---------- 响应式 ---------- */

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mid-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .slot-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .slot,
  .meter-fill,
  .entry-btn.el-button {
    transition: none;
  }

  .live-dot::after {
    animation: none;
  }
}
</style>
