<template>
  <div class="settings-page">
    <div class="page-head">
      <div>
        <h1>系统设置</h1>
        <p class="page-sub">配置停车场基础信息、收费标准与通知偏好</p>
      </div>
    </div>

    <section class="panel">
      <header class="panel-head">
        <div>
          <h2>停车场信息</h2>
          <p class="panel-sub">对外展示的停车场名称与地址</p>
        </div>
      </header>
      <div class="fields">
        <div class="field">
          <label class="field-label" for="set-name">停车场名称</label>
          <el-input id="set-name" v-model="settings.name" maxlength="40" placeholder="请输入停车场名称" />
        </div>
        <div class="field">
          <label class="field-label" for="set-address">停车场地址</label>
          <el-input id="set-address" v-model="settings.address" maxlength="80" placeholder="请输入详细地址" />
        </div>
      </div>
    </section>

    <section class="panel">
      <header class="panel-head">
        <div>
          <h2>收费标准</h2>
          <p class="panel-sub">用于出场结算的计费规则</p>
        </div>
      </header>
      <div class="fields">
        <div class="field">
          <label class="field-label" for="set-rate">每小时收费</label>
          <el-input-number
            id="set-rate"
            v-model="settings.hourlyRate"
            :min="1"
            :max="100"
            :step="1"
            controls-position="right"
          />
          <span class="field-unit">元 / 小时</span>
        </div>
        <div class="field">
          <label class="field-label" for="set-free">免费时长</label>
          <el-input-number
            id="set-free"
            v-model="settings.freeMinutes"
            :min="0"
            :max="120"
            :step="5"
            controls-position="right"
          />
          <span class="field-unit">分钟</span>
        </div>
        <div class="field">
          <label class="field-label" for="set-cap">单日封顶</label>
          <el-input-number
            id="set-cap"
            v-model="settings.dailyCap"
            :min="0"
            :max="500"
            :step="5"
            controls-position="right"
          />
          <span class="field-unit">元 / 24 小时</span>
        </div>
      </div>
    </section>

    <section class="panel">
      <header class="panel-head">
        <div>
          <h2>通知设置</h2>
          <p class="panel-sub">系统事件发生时向管理员推送提醒</p>
        </div>
      </header>
      <div class="fields">
        <div class="field">
          <label class="field-label">车辆入场通知</label>
          <div class="field-switch">
            <el-switch v-model="settings.notifyEntry" />
            <span class="switch-hint">有新车辆入场时提醒</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">车辆出场通知</label>
          <div class="field-switch">
            <el-switch v-model="settings.notifyExit" />
            <span class="switch-hint">车辆结算出场时提醒</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">车位满载提醒</label>
          <div class="field-switch">
            <el-switch v-model="settings.notifyFull" />
            <span class="switch-hint">车位即将满载时提醒</span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <header class="panel-head">
        <div>
          <h2>账号安全</h2>
          <p class="panel-sub">修改当前管理员登录密码</p>
        </div>
      </header>
      <el-form
        ref="pwdFormRef"
        :model="pwdForm"
        :rules="pwdRules"
        label-position="top"
        class="pwd-form"
        @submit.prevent="handleChangePassword"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="6–20 位，需包含字母和数字" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
        <el-button type="primary" class="pwd-submit" :loading="pwdSaving" @click="handleChangePassword">
          更新密码
        </el-button>
      </el-form>
    </section>

    <!-- 保存栏 -->
    <div class="save-bar">
      <p class="save-hint">修改即时生效，点击「保存设置」后持久化到本地。</p>
      <div class="save-actions">
        <el-button @click="handleReset">恢复默认</el-button>
        <el-button type="primary" @click="handleSave">保存设置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import { resetSettings, saveSettings, settings } from '@/api/settings'

const pwdFormRef = ref<FormInstance>()
const pwdSaving = ref(false)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirm: FormItemRule['validator'] = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
    return
  }
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6–20 位', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: '密码需同时包含字母和数字', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

function handleSave() {
  saveSettings()
  ElMessage.success('设置已保存')
}

function handleReset() {
  resetSettings()
  ElMessage.success('已恢复默认设置')
}

async function handleChangePassword() {
  if (!pwdFormRef.value || pwdSaving.value) return
  const valid = await pwdFormRef.value.validate().catch(() => false)
  if (!valid) return

  pwdSaving.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    ElMessage.success('密码已更新（演示环境）')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    pwdFormRef.value.clearValidate()
  } finally {
    pwdSaving.value = false
  }
}
</script>

<style scoped>
.fields {
  max-width: 640px;
}

.field {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.field:last-child {
  margin-bottom: 0;
}

.field-label {
  color: var(--ap-ink-soft);
  font-size: 13px;
  font-weight: 500;
}

.field-unit {
  color: var(--ap-ink-muted);
  font-size: 12px;
  white-space: nowrap;
}

.field-switch {
  display: flex;
  gap: 12px;
  align-items: center;
}

.switch-hint {
  color: var(--ap-ink-muted);
  font-size: 12px;
}

.pwd-form {
  max-width: 400px;
}

.pwd-submit.el-button {
  margin-top: 4px;
}

.save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 22px;
  background: #ffffff;
  border: 1px solid var(--ap-border);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(15, 31, 61, 0.04);
}

.save-hint {
  margin: 0;
  color: var(--ap-ink-muted);
  font-size: 12px;
}

.save-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 640px) {
  .field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .save-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
