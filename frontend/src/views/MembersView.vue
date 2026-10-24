<template>
  <div class="members-page">
    <div class="page-head">
      <div>
        <h1>会员管理</h1>
        <p class="page-sub">管理停车场会员信息与权益等级</p>
      </div>
      <div class="page-head__actions">
        <el-button type="primary" @click="openAdd">新增会员</el-button>
      </div>
    </div>

    <!-- 概览统计 -->
    <section class="stat-tiles">
      <div class="stat-tile">
        <span class="stat-tile__label">会员总数</span>
        <strong class="stat-tile__value num">{{ totalMembers }}</strong>
        <span class="stat-tile__hint">全部注册会员</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">月卡会员</span>
        <strong class="stat-tile__value num">{{ countByLevel('月卡会员') }}</strong>
        <span class="stat-tile__hint">按月续费</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">年卡会员</span>
        <strong class="stat-tile__value num">{{ countByLevel('年卡会员') }}</strong>
        <span class="stat-tile__hint">按年续费</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile__label">VIP 会员</span>
        <strong class="stat-tile__value num">{{ countByLevel('VIP会员') }}</strong>
        <span class="stat-tile__hint">尊享权益</span>
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
        <el-select v-model="levelFilter" class="level-select" placeholder="会员等级">
          <el-option label="全部等级" value="all" />
          <el-option v-for="l in levels" :key="l" :label="l" :value="l" />
        </el-select>
        <el-input v-model="keyword" class="search" placeholder="搜索姓名 / 手机号 / 车牌" clearable>
          <template #prefix>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.7" />
              <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </template>
        </el-input>
        <div class="spacer"></div>
        <span class="toolbar-sum">共 {{ filtered.length }} 人</span>
      </div>

      <!-- 表格 -->
      <div class="tbl">
        <div class="trow trow--head trow--member" aria-hidden="true">
          <span>会员</span>
          <span>手机号</span>
          <span>车牌号</span>
          <span>等级</span>
          <span>余额</span>
          <span>加入时间</span>
          <span>状态</span>
          <span></span>
        </div>
        <div v-for="m in paged" :key="m.id" class="trow trow--member">
          <span class="member">
            <span class="member-avatar" aria-hidden="true">{{ m.username.charAt(0) }}</span>
            <span class="member-name">{{ m.username }}</span>
          </span>
          <span class="num">{{ m.phone }}</span>
          <span><span class="plate-badge">{{ m.plate }}</span></span>
          <span><span class="tag" :class="levelTag(m.level)">{{ m.level }}</span></span>
          <span class="num tcell--strong">¥{{ formatMoney(m.balance) }}</span>
          <span class="num">{{ formatFullDate(m.joinedAt) }}</span>
          <span>
            <span class="tag" :class="m.status === 'active' ? 'tag--success' : 'tag--muted'">
              {{ m.status === 'active' ? '正常' : '已冻结' }}
            </span>
          </span>
          <span class="cell-actions">
            <el-button text size="small" type="primary" @click="openEdit(m)">编辑</el-button>
            <el-button text size="small" @click="handleToggle(m)">{{ m.status === 'active' ? '冻结' : '解冻' }}</el-button>
            <el-button text size="small" type="danger" @click="handleRemove(m)">删除</el-button>
          </span>
        </div>
      </div>

      <div v-if="!paged.length" class="empty">
        <p>暂无会员</p>
        <span>点击右上角「新增会员」添加</span>
      </div>

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

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑会员' : '新增会员'" width="440px">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSave"
      >
        <el-form-item label="姓名" prop="username">
          <el-input v-model="form.username" placeholder="请输入姓名" maxlength="20" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入 11 位手机号" maxlength="11" clearable />
        </el-form-item>
        <el-form-item label="车牌号" prop="plate">
          <el-input
            v-model="form.plate"
            placeholder="如：京A88888"
            @input="form.plate = form.plate.toUpperCase()"
            clearable
          />
        </el-form-item>
        <el-form-item label="会员等级" prop="level">
          <el-select v-model="form.level" style="width: 100%">
            <el-option v-for="l in levels" :key="l" :label="l" :value="l" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ editingId ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import { addMember, members, removeMember, toggleMemberStatus, updateMember } from '@/api/members'
import type { Member, MemberLevel } from '@/api/types'
import { formatFullDate, formatMoney, isValidPlate, normalizePlate } from '@/utils/format'

const levels: MemberLevel[] = ['普通会员', '月卡会员', '年卡会员', 'VIP会员']

const statusOptions: Array<{ label: string; value: 'all' | 'active' | 'frozen' }> = [
  { label: '全部', value: 'all' },
  { label: '正常', value: 'active' },
  { label: '已冻结', value: 'frozen' },
]

const statusFilter = ref<'all' | 'active' | 'frozen'>('all')
const levelFilter = ref<'all' | MemberLevel>('all')
const keyword = ref('')
const page = ref(1)
const pageSize = 8

const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const saving = ref(false)
const form = reactive({
  username: '',
  phone: '',
  plate: '',
  level: '普通会员' as MemberLevel,
})

watch([statusFilter, levelFilter, keyword], () => {
  page.value = 1
})

const filtered = computed(() => {
  const kw = keyword.value.trim()
  return members
    .filter((m) => statusFilter.value === 'all' || m.status === statusFilter.value)
    .filter((m) => levelFilter.value === 'all' || m.level === levelFilter.value)
    .filter(
      (m) => !kw || m.username.includes(kw) || m.phone.includes(kw) || m.plate.includes(kw),
    )
    .sort((a, b) => b.joinedAt - a.joinedAt)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

const totalMembers = computed(() => members.length)
function countByLevel(level: MemberLevel): number {
  return members.filter((m) => m.level === level).length
}

function levelTag(level: MemberLevel): string {
  if (level === '普通会员') return 'tag--muted'
  if (level === '月卡会员') return 'tag--info'
  if (level === '年卡会员') return 'tag--success'
  return 'tag--warning'
}

const validatePlate: FormItemRule['validator'] = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入车牌号'))
    return
  }
  if (!isValidPlate(normalizePlate(value))) {
    callback(new Error('车牌号格式不正确'))
    return
  }
  callback()
}

const rules: FormRules = {
  username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  plate: [{ validator: validatePlate, trigger: 'blur' }],
  level: [{ required: true, message: '请选择会员等级', trigger: 'change' }],
}

function resetForm() {
  form.username = ''
  form.phone = ''
  form.plate = ''
  form.level = '普通会员'
}

function openAdd() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(m: Member) {
  editingId.value = m.id
  form.username = m.username
  form.phone = m.phone
  form.plate = m.plate
  form.level = m.level
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value || saving.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      username: form.username.trim(),
      phone: form.phone.trim(),
      plate: normalizePlate(form.plate),
      level: form.level,
    }
    if (editingId.value) {
      await updateMember(editingId.value, payload)
      ElMessage.success('会员信息已更新')
    } else {
      await addMember(payload)
      ElMessage.success('会员已添加')
    }
    dialogVisible.value = false
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

async function handleToggle(m: Member) {
  try {
    await toggleMemberStatus(m.id)
    ElMessage.success(m.status === 'active' ? '会员已冻结' : '会员已解冻')
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

async function handleRemove(m: Member) {
  try {
    await ElMessageBox.confirm(`确定删除会员「${m.username}」？`, '删除会员', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await removeMember(m.id)
    ElMessage.success('会员已删除')
  } catch {
    ElMessage.error('删除失败，请稍后重试')
  }
}
</script>

<style scoped>
.level-select {
  width: 130px;
}

.search {
  width: 240px;
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

.trow--member {
  grid-template-columns: minmax(120px, 1.2fr) 130px 110px 110px 100px 120px 90px 170px;
}

.member {
  display: flex;
  gap: 10px;
  align-items: center;
}

.member-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(145deg, #0a3f9e, #1c64f2);
  border-radius: 50%;
  place-items: center;
}

.member-name {
  color: var(--ap-ink);
  font-weight: 600;
}

.cell-actions {
  text-align: right;
  white-space: nowrap;
}
</style>
