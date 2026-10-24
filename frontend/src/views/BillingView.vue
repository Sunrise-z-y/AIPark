<template>
  <div class="billing-page">
    <div class="page-head">
      <div>
        <h1>收费记录</h1>
        <p class="page-sub">查询停车收费明细与营收情况</p>
      </div>
    </div>

    <!-- 概览统计 -->
    <section class="stat-tiles">
      <div class="stat-tile">
        <span class="stat-tile__label">今日营收</span>
        <strong class="stat-tile__value num">¥{{ formatMoney(todayRevenue()) }}</strong>
        <span class="stat-tile__hint">当日累计收入</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">近 7 日营收</span>
        <strong class="stat-tile__value num">¥{{ formatMoney(revenue7d) }}</strong>
        <span class="stat-tile__hint">一周累计收入</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">总订单</span>
        <strong class="stat-tile__value num">{{ totalOrders }}</strong>
        <span class="stat-tile__hint">累计收费订单</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">平均客单价</span>
        <strong class="stat-tile__value num">¥{{ formatMoney(avgOrder) }}</strong>
        <span class="stat-tile__hint">单笔平均金额</span>
      </div>
    </section>

    <section class="panel">
      <!-- 筛选 -->
      <div class="toolbar">
        <div class="seg" role="group" aria-label="时间范围">
          <button
            v-for="opt in rangeOptions"
            :key="opt.value"
            type="button"
            class="seg-btn"
            :class="{ 'is-active': range === opt.value }"
            @click="range = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
        <el-select v-model="method" class="method-select" placeholder="支付方式">
          <el-option label="全部方式" value="all" />
          <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
        </el-select>
        <el-input v-model="keyword" class="search" placeholder="搜索车牌号" clearable>
          <template #prefix>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.7" />
              <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </template>
        </el-input>
      </div>

      <!-- 表格 -->
      <div class="tbl">
        <div class="trow trow--head trow--bill" aria-hidden="true">
          <span>车牌号</span>
          <span>车位</span>
          <span>入场时间</span>
          <span>出场时间</span>
          <span>停放时长</span>
          <span>金额</span>
          <span>支付方式</span>
          <span>状态</span>
        </div>
        <div v-for="b in paged" :key="b.id" class="trow trow--bill">
          <span><span class="plate-badge">{{ b.plate }}</span></span>
          <span class="num">{{ b.slotCode }}</span>
          <span class="num">{{ formatDateTime(b.entryAt) }}</span>
          <span class="num">{{ formatDateTime(b.exitAt) }}</span>
          <span class="num">{{ formatDuration(b.entryAt, b.exitAt) }}</span>
          <span class="num tcell--strong">{{ toMoney(b.amount) }}</span>
          <span><span class="tag tag--muted">{{ b.method }}</span></span>
          <span>
            <span class="tag" :class="b.status === 'paid' ? 'tag--success' : 'tag--danger'">
              {{ b.status === 'paid' ? '已支付' : '已退款' }}
            </span>
          </span>
        </div>
      </div>

      <div v-if="!paged.length" class="empty">
        <p>暂无收费记录</p>
        <span>调整筛选条件后重试</span>
      </div>

      <!-- 汇总 + 分页 -->
      <div class="footer">
        <div class="footer-sum">
          当前筛选 <strong class="num">{{ filtered.length }}</strong> 单 · 合计
          <strong class="num">{{ toMoney(filteredTotal) }}</strong>
        </div>
        <el-pagination
          v-if="filtered.length > pageSize"
          v-model:current-page="page"
          :page-size="pageSize"
          :total="filtered.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { billing, todayRevenue } from '@/api/parking'
import type { PaymentMethod } from '@/api/types'
import { formatDateTime, formatDuration, formatMoney, normalizePlate, toMoney } from '@/utils/format'

const DAY = 24 * 3600000

type Range = 'today' | '7d' | '30d' | 'all'

const rangeOptions: Array<{ label: string; value: Range }> = [
  { label: '今日', value: 'today' },
  { label: '近 7 日', value: '7d' },
  { label: '近 30 日', value: '30d' },
  { label: '全部', value: 'all' },
]

const methods: PaymentMethod[] = ['微信', '支付宝', 'ETC', '现金', '余额']

const range = ref<Range>('all')
const method = ref<'all' | PaymentMethod>('all')
const keyword = ref('')
const page = ref(1)
const pageSize = 8

watch([range, method, keyword], () => {
  page.value = 1
})

function rangeStart(r: Range): number | null {
  if (r === 'today') {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  if (r === '7d') return Date.now() - 7 * DAY
  if (r === '30d') return Date.now() - 30 * DAY
  return null
}

const filtered = computed(() => {
  const start = rangeStart(range.value)
  const kw = normalizePlate(keyword.value)
  return billing
    .filter((b) => !start || b.paidAt >= start)
    .filter((b) => method.value === 'all' || b.method === method.value)
    .filter((b) => !kw || b.plate.includes(kw))
    .sort((a, b) => b.paidAt - a.paidAt)
})

const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const filteredTotal = computed(() => filtered.value.reduce((s, b) => s + b.amount, 0))

const totalOrders = computed(() => billing.length)
const revenue7d = computed(() =>
  billing.filter((b) => b.paidAt >= Date.now() - 7 * DAY).reduce((s, b) => s + b.amount, 0),
)
const totalRevenue = computed(() => billing.reduce((s, b) => s + b.amount, 0))
const avgOrder = computed(() => (billing.length ? totalRevenue.value / billing.length : 0))
</script>

<style scoped>
.method-select {
  width: 130px;
}

.search {
  width: 200px;
}

.search :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.search svg {
  width: 16px;
  height: 16px;
}

.trow--bill {
  grid-template-columns: minmax(120px, 1.3fr) 70px 150px 150px 110px 100px 90px 80px;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid #f0f4fb;
}

.footer-sum {
  color: var(--ap-ink-muted);
  font-size: 13px;
}

.footer-sum strong {
  color: var(--ap-primary);
  font-weight: 600;
}
</style>
