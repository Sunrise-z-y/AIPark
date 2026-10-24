<template>
  <div class="vehicles-page">
    <div class="page-head">
      <div>
        <h1>车辆记录</h1>
        <p class="page-sub">查询车辆出入记录，处理在场车辆出场</p>
      </div>
    </div>

    <!-- 概览统计 -->
    <section class="stat-tiles">
      <div class="stat-tile">
        <span class="stat-tile__label">今日入场</span>
        <strong class="stat-tile__value num">{{ todayEntries }}</strong>
        <span class="stat-tile__hint">累计入场次数</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">今日出场</span>
        <strong class="stat-tile__value num">{{ todayExits }}</strong>
        <span class="stat-tile__hint">累计出场次数</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">当前在场</span>
        <strong class="stat-tile__value num">{{ currentParking }}</strong>
        <span class="stat-tile__hint">未出场车辆</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">累计记录</span>
        <strong class="stat-tile__value num">{{ totalRecords }}</strong>
        <span class="stat-tile__hint">全部出入记录</span>
      </div>
    </section>

    <section class="panel">
      <!-- 筛选 -->
      <div class="toolbar">
        <div class="seg" role="group" aria-label="状态筛选">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            type="button"
            class="seg-btn"
            :class="{ 'is-active': statusFilter === opt.value }"
            @click="statusFilter = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
        <el-input
          v-model="keyword"
          class="search"
          placeholder="搜索车牌号，如：京A"
          clearable
        >
          <template #prefix>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.7" />
              <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </template>
        </el-input>
        <div class="spacer"></div>
        <span class="toolbar-sum">共 {{ filtered.length }} 条</span>
      </div>

      <!-- 表格 -->
      <div class="tbl">
        <div class="trow trow--head trow--veh" aria-hidden="true">
          <span>车牌号</span>
          <span>车位</span>
          <span>入场时间</span>
          <span>出场时间</span>
          <span>停放时长</span>
          <span>费用</span>
          <span>状态</span>
          <span></span>
        </div>
        <div v-for="r in paged" :key="r.id" class="trow trow--veh">
          <span><span class="plate-badge">{{ r.plate }}</span></span>
          <span class="num">{{ r.slotCode }}</span>
          <span class="num">{{ formatDateTime(r.entryAt) }}</span>
          <span class="num">{{ r.exitAt ? formatDateTime(r.exitAt) : '—' }}</span>
          <span class="num">{{ r.exitAt ? formatDuration(r.entryAt, r.exitAt) : formatDuration(r.entryAt, now) }}</span>
          <span class="num tcell--strong">{{ r.fee != null ? toMoney(r.fee) : '—' }}</span>
          <span>
            <span class="tag" :class="r.status === 'parking' ? 'tag--info' : 'tag--success'">
              {{ r.status === 'parking' ? '停放中' : '已出场' }}
            </span>
          </span>
          <span class="cell-actions">
            <el-button
              v-if="r.status === 'parking'"
              size="small"
              class="settle-btn"
              :loading="settlingId === r.id"
              @click="handleSettle(r)"
            >
              结算出场
            </el-button>
          </span>
        </div>
      </div>

      <div v-if="!paged.length" class="empty">
        <p>暂无匹配记录</p>
        <span>调整筛选条件后重试</span>
      </div>

      <!-- 分页 -->
      <div v-if="filtered.length > pageSize" class="pager">
        <span class="pager__sum">第 {{ page }} / {{ totalPages }} 页</span>
        <el-pagination
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
import { computed, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { parkingCount, records, settleExit, todayEntryCount } from '@/api/parking'
import type { ParkingRecord } from '@/api/types'
import { formatDateTime, formatDuration, normalizePlate, toMoney } from '@/utils/format'

type StatusFilter = 'all' | 'parking' | 'completed'

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: '全部', value: 'all' },
  { label: '在场', value: 'parking' },
  { label: '已出场', value: 'completed' },
]

const statusFilter = ref<StatusFilter>('all')
const keyword = ref('')
const page = ref(1)
const pageSize = 8
const settlingId = ref('')
const now = ref(Date.now())

const timer = window.setInterval(() => {
  now.value = Date.now()
}, 1000)

onUnmounted(() => window.clearInterval(timer))

watch([keyword, statusFilter], () => {
  page.value = 1
})

const filtered = computed(() => {
  const kw = normalizePlate(keyword.value)
  return records
    .filter((r) => statusFilter.value === 'all' || r.status === statusFilter.value)
    .filter((r) => !kw || r.plate.includes(kw))
    .sort((a, b) => b.entryAt - a.entryAt)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

const todayExits = computed(() => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return records.filter((r) => r.exitAt != null && r.exitAt >= start.getTime()).length
})

const todayEntries = computed(() => todayEntryCount())
const currentParking = computed(() => parkingCount())
const totalRecords = computed(() => records.length)

async function handleSettle(r: ParkingRecord) {
  if (settlingId.value) return
  settlingId.value = r.id
  try {
    const { fee } = await settleExit(r.id)
    ElMessage.success(`${r.plate} 已结算出场，停车费 ¥${fee}`)
  } catch {
    ElMessage.error('结算失败，请稍后重试')
  } finally {
    settlingId.value = ''
  }
}
</script>

<style scoped>
.search {
  width: 220px;
}

.search :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.search svg {
  width: 16px;
  height: 16px;
}

.toolbar-sum {
  color: var(--ap-ink-muted);
  font-size: 12px;
}

.trow--veh {
  grid-template-columns: minmax(120px, 1.3fr) 80px 150px 150px 110px 90px 90px 96px;
}

.cell-actions {
  text-align: right;
}

.settle-btn.el-button {
  color: var(--ap-primary);
  background: #eef3fb;
  border: 0;
  border-radius: 8px;
}

.settle-btn.el-button:hover {
  color: #ffffff;
  background: var(--ap-primary);
}
</style>
