<template>
  <div class="lots-page">
    <div class="page-head">
      <div>
        <h1>车位管理</h1>
        <p class="page-sub">查看各分区车位状态，维护异常车位</p>
      </div>
      <div class="page-head__actions">
        <el-button type="primary" @click="openAddZone">新增分区</el-button>
      </div>
    </div>

    <!-- 概览统计 -->
    <section class="stat-tiles">
      <div class="stat-tile">
        <span class="stat-tile__label">总车位</span>
        <strong class="stat-tile__value num">{{ totalSlots }}</strong>
        <span class="stat-tile__hint">场内全部车位</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">空闲车位</span>
        <strong class="stat-tile__value num">{{ freeSlots }}</strong>
        <span class="stat-tile__hint">可立即分配</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">已占用</span>
        <strong class="stat-tile__value num">{{ occupied }}</strong>
        <span class="stat-tile__hint">占用率 {{ occupancyRate }}%</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">维护中</span>
        <strong class="stat-tile__value num">{{ maintenanceCount }}</strong>
        <span class="stat-tile__hint">暂停使用车位</span>
      </div>
    </section>

    <!-- 图例 -->
    <div class="legend" aria-hidden="true">
      <span class="legend-item"><i class="dot dot--free"></i>空闲</span>
      <span class="legend-item"><i class="dot dot--occupied"></i>已占用</span>
      <span class="legend-item"><i class="dot dot--maintenance"></i>维护中</span>
      <span class="legend-tip">点击车位可查看详情或切换维护状态</span>
    </div>

    <!-- 分区 -->
    <section v-for="zone in zones" :key="zone.id" class="panel">
      <header class="panel-head">
        <div>
          <h2>{{ zone.name }} <span class="floor">· {{ zone.floor }}层</span></h2>
          <p class="panel-sub">
            {{ zoneFreeCount(zone) }} 空闲 / {{ zone.slotCount }} 位 · 维护 {{ zoneMaintenanceCount(zone) }} 位
          </p>
        </div>
        <div class="panel-head__actions">
          <el-button text type="danger" size="small" @click="handleRemoveZone(zone)">删除分区</el-button>
        </div>
      </header>
      <div class="lot-grid">
        <button
          v-for="slot in zoneSlots(zone)"
          :key="slot.code"
          type="button"
          class="lot"
          :class="lotClass(slot)"
          @click="openSlot(slot)"
        >
          <span class="lot-code num">{{ slot.code }}</span>
          <span class="lot-state">{{ slotStateLabel(slot) }}</span>
        </button>
      </div>
    </section>

    <!-- 车位详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="activeSlot ? `车位 ${activeSlot.code}` : ''"
      width="400px"
    >
      <div v-if="activeSlot" class="slot-detail">
        <div class="slot-detail__row">
          <span>所属分区</span>
          <strong>{{ activeSlot.zone.name }} · {{ activeSlot.zone.floor }}层</strong>
        </div>
        <div class="slot-detail__row">
          <span>当前状态</span>
          <span class="tag" :class="statusTagClass(activeSlot.status)">{{ slotStateLabel(activeSlot) }}</span>
        </div>
        <template v-if="activeSlot.status === 'occupied'">
          <div class="slot-detail__row">
            <span>停放车辆</span>
            <strong class="plate-badge">{{ activeSlot.plate }}</strong>
          </div>
          <div class="slot-detail__row">
            <span>入场时间</span>
            <strong class="num">{{ formatTime(activeSlot.entryAt ?? Date.now()) }}</strong>
          </div>
          <div class="slot-detail__row">
            <span>停放时长</span>
            <strong class="num">{{ formatDuration(activeSlot.entryAt ?? Date.now()) }}</strong>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
          v-if="activeSlot?.status === 'occupied'"
          type="primary"
          :loading="settleLoading"
          @click="settleActive"
        >
          结算出场
        </el-button>
        <el-button
          v-else-if="activeSlot?.status === 'maintenance'"
          type="primary"
          @click="toggleMaintenance"
        >
          恢复开放
        </el-button>
        <el-button v-else type="warning" @click="toggleMaintenance">设为维护</el-button>
      </template>
    </el-dialog>

    <!-- 新增分区弹窗 -->
    <el-dialog v-model="addZoneVisible" title="新增分区" width="440px">
      <el-form
        ref="addZoneFormRef"
        :model="addZoneForm"
        :rules="addZoneRules"
        label-position="top"
        @submit.prevent="handleAddZone"
      >
        <el-form-item label="分区名称" prop="name">
          <el-input v-model="addZoneForm.name" placeholder="如：E 区" maxlength="10" clearable />
        </el-form-item>
        <el-form-item label="车位前缀（单个字母）" prop="prefix">
          <el-input
            v-model="addZoneForm.prefix"
            placeholder="如：E"
            maxlength="1"
            @input="addZoneForm.prefix = addZoneForm.prefix.toUpperCase()"
          />
        </el-form-item>
        <el-form-item label="所在楼层" prop="floor">
          <el-select v-model="addZoneForm.floor" style="width: 100%">
            <el-option label="B1 层" value="B1" />
            <el-option label="B2 层" value="B2" />
            <el-option label="B3 层" value="B3" />
            <el-option label="地面" value="地面" />
          </el-select>
        </el-form-item>
        <el-form-item label="车位数量" prop="slotCount">
          <el-input-number v-model="addZoneForm.slotCount" :min="1" :max="60" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addZoneVisible = false">取消</el-button>
        <el-button type="primary" :loading="addZoneLoading" @click="handleAddZone">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addZone,
  allSlots,
  freeCount,
  getSlot,
  maintenance,
  parkingCount,
  records,
  removeZone,
  setMaintenance,
  settleExit,
  zones,
  type SlotInfo,
} from '@/api/parking'
import type { Zone } from '@/api/types'
import { formatDuration, formatTime } from '@/utils/format'

const dialogVisible = ref(false)
const activeSlot = ref<SlotInfo | null>(null)
const settleLoading = ref(false)

const addZoneVisible = ref(false)
const addZoneFormRef = ref<FormInstance>()
const addZoneLoading = ref(false)
const addZoneForm = reactive({
  name: '',
  prefix: '',
  floor: 'B1',
  slotCount: 10,
})

const addZoneRules: FormRules = {
  name: [{ required: true, message: '请输入分区名称', trigger: 'blur' }],
  prefix: [
    { required: true, message: '请输入车位前缀', trigger: 'blur' },
    { pattern: /^[A-Z]$/, message: '仅支持单个大写字母', trigger: 'blur' },
  ],
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  slotCount: [{ required: true, message: '请设置车位数量', trigger: 'blur' }],
}

const totalSlots = computed(() => allSlots().length)
const freeSlots = computed(() => freeCount())
const occupied = computed(() => parkingCount())
const maintenanceCount = computed(() => maintenance.length)
const occupancyRate = computed(() =>
  totalSlots.value ? Math.round((occupied.value / totalSlots.value) * 100) : 0,
)

function zoneSlots(zone: Zone): SlotInfo[] {
  return Array.from({ length: zone.slotCount }, (_, i) =>
    getSlot(`${zone.prefix}${String(i + 1).padStart(2, '0')}`),
  )
}

function zoneFreeCount(zone: Zone): number {
  return zoneSlots(zone).filter((s) => s.status === 'free').length
}

function zoneMaintenanceCount(zone: Zone): number {
  return zoneSlots(zone).filter((s) => s.status === 'maintenance').length
}

function lotClass(slot: SlotInfo) {
  return {
    'is-occupied': slot.status === 'occupied',
    'is-maintenance': slot.status === 'maintenance',
  }
}

function slotStateLabel(slot: SlotInfo): string {
  if (slot.status === 'maintenance') return '维护中'
  if (slot.status === 'occupied') return '已占用'
  return '空闲'
}

function statusTagClass(status: SlotInfo['status']): string {
  if (status === 'occupied') return 'tag--info'
  if (status === 'maintenance') return 'tag--muted'
  return 'tag--success'
}

function openSlot(slot: SlotInfo) {
  activeSlot.value = slot
  dialogVisible.value = true
}

function toggleMaintenance() {
  const slot = activeSlot.value
  if (!slot) return
  if (slot.status === 'maintenance') {
    setMaintenance(slot.code, false)
    ElMessage.success(`车位 ${slot.code} 已恢复开放`)
  } else {
    setMaintenance(slot.code, true)
    ElMessage.success(`车位 ${slot.code} 已设为维护`)
  }
  dialogVisible.value = false
}

async function settleActive() {
  const slot = activeSlot.value
  if (!slot || settleLoading.value) return
  const record = records.find((r) => r.slotCode === slot.code && r.status === 'parking')
  if (!record) {
    ElMessage.error('未找到停放记录')
    return
  }
  settleLoading.value = true
  try {
    const { fee } = await settleExit(record.id)
    dialogVisible.value = false
    ElMessage.success(`${slot.plate} 已结算出场，停车费 ¥${fee}`)
  } catch {
    ElMessage.error('结算失败，请稍后重试')
  } finally {
    settleLoading.value = false
  }
}

function openAddZone() {
  addZoneForm.name = ''
  addZoneForm.prefix = ''
  addZoneForm.floor = 'B1'
  addZoneForm.slotCount = 10
  addZoneVisible.value = true
}

async function handleAddZone() {
  if (!addZoneFormRef.value || addZoneLoading.value) return
  const valid = await addZoneFormRef.value.validate().catch(() => false)
  if (!valid) return

  addZoneLoading.value = true
  try {
    const zone = await addZone({ ...addZoneForm })
    addZoneVisible.value = false
    ElMessage.success(`分区 ${zone.name} 已创建，共 ${zone.slotCount} 个车位`)
  } catch (err) {
    ElMessage.error(err instanceof Error && err.message === 'PREFIX_EXISTS' ? '该前缀已被占用' : '创建失败，请检查输入')
  } finally {
    addZoneLoading.value = false
  }
}

async function handleRemoveZone(zone: Zone) {
  try {
    await ElMessageBox.confirm(`确定删除「${zone.name}」？该分区车位将一并移除。`, '删除分区', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await removeZone(zone.id)
    ElMessage.success(`分区 ${zone.name} 已删除`)
  } catch {
    ElMessage.error('该分区仍有车辆停放，无法删除')
  }
}
</script>

<style scoped>
.floor {
  color: var(--ap-ink-muted);
  font-size: 13px;
  font-weight: 500;
}

/* 图例 */

.legend {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 0 4px;
  margin-bottom: 18px;
  font-size: 12px;
  color: var(--ap-ink-soft);
}

.legend-item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.legend-tip {
  margin-left: auto;
  color: var(--ap-ink-muted);
}

.dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 3px;
}

.dot--free {
  background: var(--ap-good);
}

.dot--occupied {
  background: var(--ap-primary);
}

.dot--maintenance {
  background: #94a3b8;
}

/* 车位网格 */

.lot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 8px;
}

.lot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: space-between;
  height: 52px;
  padding: 8px 10px;
  color: var(--ap-good);
  font: inherit;
  text-align: left;
  background: #e9f8ee;
  border: 1px solid #c4ead0;
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.lot:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 31, 61, 0.08);
}

.lot.is-occupied {
  color: var(--ap-primary);
  background: #eef3fb;
  border-color: #d7e4f7;
}

.lot.is-maintenance {
  color: var(--ap-ink-muted);
  background: #f1f4f9;
  border-color: #e3e8f0;
}

.lot-code {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.lot-state {
  font-size: 10px;
  line-height: 1;
}

.lot.is-occupied .lot-state {
  color: var(--ap-ink-soft);
}

.lot.is-maintenance .lot-state {
  color: var(--ap-ink-muted);
}

/* 车位详情 */

.slot-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.slot-detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.slot-detail__row > span:first-child {
  color: var(--ap-ink-muted);
}

.slot-detail__row strong {
  color: var(--ap-ink);
  font-weight: 600;
}
</style>
