<template>
  <div class="reports-page">
    <div class="page-head">
      <div>
        <h1>统计报表</h1>
        <p class="page-sub">营收与车流趋势、支付与会员结构分析</p>
      </div>
    </div>

    <!-- 概览统计 -->
    <section class="stat-tiles">
      <div class="stat-tile">
        <span class="stat-tile__label">今日营收</span>
        <strong class="stat-tile__value num">¥{{ formatMoney(todayRevenue()) }}</strong>
        <span class="stat-tile__hint">截至当前</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">近 7 日营收</span>
        <strong class="stat-tile__value num">¥{{ formatMoney(revenue7d) }}</strong>
        <span class="stat-tile__hint">一周累计</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">近 7 日入场</span>
        <strong class="stat-tile__value num">{{ entries7d }}</strong>
        <span class="stat-tile__hint">累计入场车次</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">近 7 日出场</span>
        <strong class="stat-tile__value num">{{ exits7d }}</strong>
        <span class="stat-tile__hint">累计出场车次</span>
      </div>
    </section>

    <!-- 营收趋势 -->
    <section class="panel">
      <header class="panel-head">
        <div>
          <h2>近 7 日营收</h2>
          <p class="panel-sub">按出场结算日统计 · 单位：元</p>
        </div>
      </header>
      <div class="chart-bars">
        <div v-for="d in series" :key="d.label" class="bar-col">
          <span class="bar-value num">¥{{ d.revenue }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ height: barHeight(d.revenue, maxRevenue) }"
              :title="`${d.label} 营收 ¥${d.revenue}`"
            ></div>
          </div>
          <span class="bar-label">{{ d.label }}</span>
        </div>
      </div>
    </section>

    <!-- 车流趋势 -->
    <section class="panel">
      <header class="panel-head">
        <div>
          <h2>近 7 日车流</h2>
          <p class="panel-sub">入场与出场车次对比 · 单位：辆</p>
        </div>
        <div class="chart-legend">
          <span class="legend-item"><i class="swatch swatch--entry"></i>入场</span>
          <span class="legend-item"><i class="swatch swatch--exit"></i>出场</span>
        </div>
      </header>
      <div class="chart-bars">
        <div v-for="d in series" :key="d.label" class="bar-col">
          <span class="bar-value num">{{ d.entries + d.exits }}</span>
          <div class="bar-group">
            <div class="bar-track bar-track--sm">
              <div
                class="bar-fill bar-fill--entry"
                :style="{ height: barHeight(d.entries, maxTraffic) }"
                :title="`${d.label} 入场 ${d.entries} 辆`"
              ></div>
            </div>
            <div class="bar-track bar-track--sm">
              <div
                class="bar-fill bar-fill--exit"
                :style="{ height: barHeight(d.exits, maxTraffic) }"
                :title="`${d.label} 出场 ${d.exits} 辆`"
              ></div>
            </div>
          </div>
          <span class="bar-label">{{ d.label }}</span>
        </div>
      </div>
    </section>

    <!-- 结构分布 -->
    <div class="grid-2">
      <section class="panel">
        <header class="panel-head">
          <div>
            <h2>支付方式分布</h2>
            <p class="panel-sub">按营收金额统计</p>
          </div>
        </header>
        <ul class="dist">
          <li v-for="m in methodDist" :key="m.name" class="dist-row">
            <div class="dist-head">
              <span class="dist-name">{{ m.name }}</span>
              <span class="dist-val num">¥{{ formatMoney(m.amount) }} · {{ methodPct(m.amount) }}%</span>
            </div>
            <div class="dist-track">
              <div class="dist-fill" :style="{ width: pct(m.amount, maxMethodAmount) }"></div>
            </div>
          </li>
        </ul>
      </section>

      <section class="panel">
        <header class="panel-head">
          <div>
            <h2>会员等级分布</h2>
            <p class="panel-sub">按会员数量统计</p>
          </div>
        </header>
        <ul class="dist">
          <li v-for="l in levelDist" :key="l.name" class="dist-row">
            <div class="dist-head">
              <span class="dist-name">{{ l.name }}</span>
              <span class="dist-val num">{{ l.count }} 人 · {{ countPct(l.count) }}%</span>
            </div>
            <div class="dist-track">
              <div class="dist-fill dist-fill--alt" :style="{ width: pct(l.count, maxLevelCount) }"></div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { billing, todayRevenue, trafficSeries } from '@/api/parking'
import { members } from '@/api/members'
import type { MemberLevel, PaymentMethod } from '@/api/types'
import { formatMoney } from '@/utils/format'

const series = computed(() => trafficSeries())

const revenue7d = computed(() => series.value.reduce((s, d) => s + d.revenue, 0))
const entries7d = computed(() => series.value.reduce((s, d) => s + d.entries, 0))
const exits7d = computed(() => series.value.reduce((s, d) => s + d.exits, 0))

const maxRevenue = computed(() => Math.max(1, ...series.value.map((d) => d.revenue)))
const maxTraffic = computed(() =>
  Math.max(1, ...series.value.flatMap((d) => [d.entries, d.exits])),
)

const methods: PaymentMethod[] = ['微信', '支付宝', 'ETC', '现金', '余额']
const methodDist = computed(() =>
  methods
    .map((name) => {
      const list = billing.filter((b) => b.method === name)
      return { name, amount: list.reduce((s, b) => s + b.amount, 0), count: list.length }
    })
    .sort((a, b) => b.amount - a.amount),
)
const maxMethodAmount = computed(() => Math.max(1, ...methodDist.value.map((m) => m.amount)))
const totalMethodAmount = computed(() => methodDist.value.reduce((s, m) => s + m.amount, 0))

const levels: MemberLevel[] = ['普通会员', '月卡会员', '年卡会员', 'VIP会员']
const levelDist = computed(() =>
  levels.map((name) => ({ name, count: members.filter((m) => m.level === name).length })),
)
const maxLevelCount = computed(() => Math.max(1, ...levelDist.value.map((l) => l.count)))
const totalLevelCount = computed(() => levelDist.value.reduce((s, l) => s + l.count, 0))

function barHeight(v: number, max: number): string {
  if (v <= 0) return '0%'
  return `${Math.max(3, Math.round((v / max) * 100))}%`
}

function pct(v: number, max: number): string {
  return `${Math.max(2, Math.round((v / max) * 100))}%`
}

function methodPct(amount: number): string {
  return totalMethodAmount.value ? ((amount / totalMethodAmount.value) * 100).toFixed(1) : '0.0'
}

function countPct(count: number): string {
  return totalLevelCount.value ? ((count / totalLevelCount.value) * 100).toFixed(1) : '0.0'
}
</script>

<style scoped>
/* ---------- 柱状图 ---------- */

.chart-bars {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  height: 240px;
  padding: 8px 6px 0;
}

.bar-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  min-width: 0;
}

.bar-value {
  margin-bottom: 8px;
  color: var(--ap-ink-muted);
  font-size: 11px;
  line-height: 1;
}

.bar-track {
  display: flex;
  align-items: flex-end;
  width: 100%;
  max-width: 42px;
  height: 180px;
  overflow: hidden;
  background: #eef3fb;
  border-radius: 8px;
}

.bar-group {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  height: 180px;
}

.bar-track--sm {
  width: 16px;
  height: 180px;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--ap-primary-light), var(--ap-primary));
  border-radius: 8px;
  transition: height 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.bar-fill--entry {
  background: linear-gradient(180deg, #4b8bff, #1c64f2);
}

.bar-fill--exit {
  background: linear-gradient(180deg, #4ade80, #16a34a);
}

.bar-label {
  margin-top: 10px;
  color: var(--ap-ink-muted);
  font-size: 11px;
  white-space: nowrap;
}

/* ---------- 图例 ---------- */

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: var(--ap-ink-soft);
  font-size: 12px;
}

.swatch {
  width: 9px;
  height: 9px;
  border-radius: 3px;
}

.swatch--entry {
  background: var(--ap-primary);
}

.swatch--exit {
  background: var(--ap-good);
}

/* ---------- 分布条 ---------- */

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.dist {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.dist-row {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.dist-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dist-name {
  color: var(--ap-ink);
  font-size: 13px;
  font-weight: 500;
}

.dist-val {
  color: var(--ap-ink-soft);
  font-size: 12px;
}

.dist-track {
  height: 8px;
  overflow: hidden;
  background: #eef3fb;
  border-radius: 999px;
}

.dist-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ap-primary), var(--ap-primary-light));
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.dist-fill--alt {
  background: linear-gradient(90deg, #0a3f9e, #4b8bff);
}

@media (max-width: 900px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .chart-bars {
    gap: 8px;
  }

  .bar-value {
    font-size: 10px;
  }

  .bar-track--sm {
    width: 13px;
  }
}
</style>
