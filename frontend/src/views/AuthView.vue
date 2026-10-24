<template>
  <div class="auth-page">
    <section class="brand-panel" aria-label="智能停车场介绍">
      <span class="brand-decor brand-decor--orbit" aria-hidden="true"></span>
      <span class="brand-decor brand-decor--glow" aria-hidden="true"></span>

      <header class="brand-top">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M8 18.5V5.5h5.2a4 4 0 0 1 0 8H8"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="brand-name">
          <strong>智能停车场</strong>
          <span>SMART PARKING</span>
        </div>
      </header>

      <div class="brand-content">
        <p class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>智慧出行 · 从停车开始</p>
        <h1>让停车更智能<br /><span>让出行更从容</span></h1>
        <p class="brand-description">实时车位、智能调度、无感支付，为每一次出行预留从容。</p>

        <div class="parking-board" aria-hidden="true">
          <div class="board-head">
            <span class="board-title"><span class="live-dot"></span>实时车位</span>
            <span class="board-live">LIVE</span>
          </div>
          <div class="slot-grid">
            <div
              v-for="slot in parkingSlots"
              :key="slot.code"
              class="slot"
              :class="{ 'is-occupied': slot.occupied }"
            >
              <span class="slot-code">{{ slot.code }}</span>
              <span class="slot-state">{{ slot.occupied ? '已占用' : '空闲' }}</span>
            </div>
          </div>
          <div class="board-foot">
            <span>B2 层 · 东区入口</span>
            <span>自动识别车辆</span>
          </div>
        </div>

        <div class="brand-stats">
          <div class="stat">
            <strong>128</strong>
            <span>空闲车位</span>
          </div>
          <div class="stat">
            <strong>24</strong>
            <span>充电车位</span>
          </div>
          <div class="stat">
            <strong>99.9<span class="stat-unit">%</span></strong>
            <span>系统在线率</span>
          </div>
        </div>
      </div>

      <footer class="brand-footer">
        <span>7 × 24 小时稳定运行</span>
        <span class="dot-separator" aria-hidden="true"></span>
        <span>智慧停车管理平台</span>
      </footer>
    </section>

    <main class="form-panel">
      <div class="form-wrap">
        <div class="mobile-brand">
          <div class="brand-mark brand-mark--solid" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M8 18.5V5.5h5.2a4 4 0 0 1 0 8H8"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="brand-name">
            <strong>智能停车场</strong>
            <span>SMART PARKING</span>
          </div>
        </div>

        <div class="mode-switch" role="group" aria-label="选择登录或注册">
          <span
            class="mode-thumb"
            :class="{ 'is-register': mode === 'register' }"
            aria-hidden="true"
          ></span>
          <button
            type="button"
            class="mode-button"
            :class="{ 'is-active': mode === 'login' }"
            :aria-pressed="mode === 'login'"
            @click="switchMode('login')"
          >
            登录
          </button>
          <button
            type="button"
            class="mode-button"
            :class="{ 'is-active': mode === 'register' }"
            :aria-pressed="mode === 'register'"
            @click="switchMode('register')"
          >
            注册
          </button>
        </div>

        <Transition name="form-fade" mode="out-in">
          <section v-if="mode === 'login'" key="login" class="form-section">
            <header class="form-heading">
              <p class="form-kicker">WELCOME BACK</p>
              <h2>欢迎回来</h2>
              <p>登录账号，继续管理您的停车业务</p>
            </header>

            <el-form
              ref="loginFormRef"
              class="auth-form"
              :model="loginForm"
              :rules="loginRules"
              label-position="top"
              size="large"
              @submit.prevent="handleLogin"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  autocomplete="username"
                  clearable
                >
                  <template #prefix>
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.7" />
                      <path
                        d="M5 20c.5-3.2 3.4-5.4 7-5.4s6.5 2.2 7 5.4"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                      />
                    </svg>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入登录密码"
                  autocomplete="current-password"
                  show-password
                >
                  <template #prefix>
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10.5"
                        rx="2.5"
                        stroke="currentColor"
                        stroke-width="1.7"
                      />
                      <path
                        d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                      />
                      <circle cx="12" cy="15.2" r="1.1" fill="currentColor" />
                    </svg>
                  </template>
                </el-input>
              </el-form-item>

              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                <button type="button" class="text-link" @click="handleForgotPassword">
                  忘记密码？
                </button>
              </div>

              <el-button
                class="submit-button"
                type="primary"
                native-type="submit"
                :loading="loginLoading"
              >
                {{ loginLoading ? '正在登录…' : '登 录' }}
              </el-button>
            </el-form>

            <p class="form-switch">
              还没有账号？
              <button type="button" class="inline-link" @click="switchMode('register')">
                立即注册
              </button>
            </p>
          </section>

          <section v-else key="register" class="form-section">
            <header class="form-heading">
              <p class="form-kicker">CREATE ACCOUNT</p>
              <h2>创建账号</h2>
              <p>填写相关信息，开启智慧停车新体验</p>
            </header>

            <el-form
              ref="registerFormRef"
              class="auth-form auth-form--register"
              :model="registerForm"
              :rules="registerRules"
              label-position="top"
              size="large"
              @submit.prevent="handleRegister"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="registerForm.username"
                  placeholder="3–20 位中文、字母、数字或下划线"
                  autocomplete="username"
                  maxlength="20"
                  clearable
                >
                  <template #prefix>
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.7" />
                      <path
                        d="M5 20c.5-3.2 3.4-5.4 7-5.4s6.5 2.2 7 5.4"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                      />
                    </svg>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="registerForm.phone"
                  placeholder="请输入 11 位手机号"
                  autocomplete="tel"
                  maxlength="11"
                  clearable
                >
                  <template #prefix>
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect
                        x="7"
                        y="2.8"
                        width="10"
                        height="18.4"
                        rx="2.4"
                        stroke="currentColor"
                        stroke-width="1.7"
                      />
                      <path
                        d="M10.8 5.4h2.4"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                      />
                      <circle cx="12" cy="18.2" r="0.9" fill="currentColor" />
                    </svg>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="6–20 位，需包含字母和数字"
                  autocomplete="new-password"
                  show-password
                  @input="revalidateConfirmPassword"
                >
                  <template #prefix>
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10.5"
                        rx="2.5"
                        stroke="currentColor"
                        stroke-width="1.7"
                      />
                      <path
                        d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                      />
                      <circle cx="12" cy="15.2" r="1.1" fill="currentColor" />
                    </svg>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  autocomplete="new-password"
                  show-password
                >
                  <template #prefix>
                    <svg class="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10.5"
                        rx="2.5"
                        stroke="currentColor"
                        stroke-width="1.7"
                      />
                      <path
                        d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                      />
                      <path
                        d="m9.5 15.2 1.7 1.7 3.4-3.4"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </template>
                </el-input>
              </el-form-item>

              <el-button
                class="submit-button"
                type="primary"
                native-type="submit"
                :loading="registerLoading"
              >
                {{ registerLoading ? '正在创建…' : '创建账号' }}
              </el-button>
            </el-form>

            <p class="form-switch">
              已有账号？
              <button type="button" class="inline-link" @click="switchMode('login')">返回登录</button>
            </p>
          </section>
        </Transition>

        <p class="legal">
          登录或注册即表示您同意
          <button type="button" class="inline-link" @click="showAgreement('用户协议')">《用户协议》</button>
          与
          <button type="button" class="inline-link" @click="showAgreement('隐私政策')">《隐私政策》</button>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import { login, register } from '@/api/auth'

type AuthMode = 'login' | 'register'

interface ParkingSlot {
  code: string
  occupied: boolean
}

const router = useRouter()

const mode = ref<AuthMode>('login')
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: true,
})

const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const parkingSlots: ParkingSlot[] = [
  { code: 'A01', occupied: true },
  { code: 'A02', occupied: false },
  { code: 'A03', occupied: false },
  { code: 'A04', occupied: true },
  { code: 'B01', occupied: false },
  { code: 'B02', occupied: true },
  { code: 'B03', occupied: false },
  { code: 'B04', occupied: false },
]

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const validateConfirmPassword: FormItemRule['validator'] = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3–20 位', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_一-龥]+$/,
      message: '仅支持中文、字母、数字和下划线',
      trigger: 'blur',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6–20 位', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
      message: '密码需同时包含字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

const switchMode = (next: AuthMode) => {
  if (mode.value === next) return

  if (next === 'register' && !registerForm.username) {
    registerForm.username = loginForm.username.trim()
  }

  mode.value = next
  void nextTick(() => {
    if (next === 'login') {
      loginFormRef.value?.clearValidate()
    } else {
      registerFormRef.value?.clearValidate()
    }
  })
}

const revalidateConfirmPassword = () => {
  if (registerForm.confirmPassword) {
    registerFormRef.value?.validateField('confirmPassword').catch(() => false)
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value || loginLoading.value) return

  const isValid = await loginFormRef.value.validate().catch(() => false)
  if (!isValid) return

  loginLoading.value = true
  try {
    loginForm.username = loginForm.username.trim()
    const user = await login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember,
    })
    ElMessage.success(`欢迎回来，${user.username}`)
    await router.push({ name: 'dashboard' })
  } catch {
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value || registerLoading.value) return

  const isValid = await registerFormRef.value.validate().catch(() => false)
  if (!isValid) return

  registerLoading.value = true
  try {
    const user = await register({
      username: registerForm.username.trim(),
      phone: registerForm.phone.trim(),
      password: registerForm.password,
    })

    ElMessage.success('注册成功，请使用新账号登录')
    loginForm.username = user.username
    loginForm.password = ''
    Object.assign(registerForm, {
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
    })
    mode.value = 'login'

    void nextTick(() => {
      loginFormRef.value?.clearValidate()
    })
  } catch {
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    registerLoading.value = false
  }
}

const handleForgotPassword = () => {
  ElMessage.info('请联系停车场管理员重置密码')
}

const showAgreement = (name: string) => {
  ElMessage.info(`${name}内容将在正式版本中提供`)
}
</script>

<style scoped>
.auth-page {
  --auth-primary: #1c64f2;
  --auth-primary-dark: #0a3f9e;
  --auth-primary-light: #4b8bff;
  --auth-text: #0f1f3d;
  --auth-text-soft: #64748b;
  --auth-border: #dbe6fb;
  --auth-field-bg: #f8fbff;

  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--auth-text);
  background: #ffffff;
  font-family:
    'PingFang SC',
    'Microsoft YaHei',
    'Hiragino Sans GB',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

/* ---------- 左侧品牌区 ---------- */

.brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 44px clamp(40px, 5vw, 76px) 36px;
  overflow: hidden;
  color: #ffffff;
  background:
    radial-gradient(circle at 82% 16%, rgba(112, 173, 255, 0.42), transparent 34%),
    radial-gradient(circle at 10% 86%, rgba(47, 123, 255, 0.38), transparent 36%),
    linear-gradient(145deg, #082f74 0%, #0a3f9e 38%, #1c64f2 100%);
}

.brand-panel::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  content: '';
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, #000 10%, transparent 88%);
}

.brand-decor {
  position: absolute;
  z-index: 0;
  display: block;
  pointer-events: none;
  border-radius: 50%;
}

.brand-decor--orbit {
  top: -210px;
  right: -250px;
  width: 620px;
  height: 620px;
  border: 1px solid rgba(255, 255, 255, 0.13);
}

.brand-decor--orbit::before,
.brand-decor--orbit::after {
  position: absolute;
  content: '';
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: inherit;
}

.brand-decor--orbit::before {
  inset: 62px;
}

.brand-decor--orbit::after {
  inset: 132px;
}

.brand-decor--glow {
  right: -70px;
  bottom: -130px;
  width: 430px;
  height: 430px;
  background: rgba(96, 165, 250, 0.28);
  filter: blur(100px);
}

.brand-top,
.brand-content,
.brand-footer {
  position: relative;
  z-index: 1;
}

.brand-top {
  display: flex;
  gap: 14px;
  align-items: center;
  animation: rise-in 0.55s both;
}

.brand-mark {
  display: grid;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 13px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
  place-items: center;
}

.brand-mark svg {
  width: 25px;
  height: 25px;
}

.brand-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name strong {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.055em;
}

.brand-name span {
  color: rgba(255, 255, 255, 0.58);
  font-size: 9px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.24em;
}

.brand-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 540px;
  padding: 34px 0 26px;
  margin: 0 auto;
}

.eyebrow {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-bottom: 18px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  animation: rise-in 0.6s 0.04s both;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  background: #8ef0c8;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(142, 240, 200, 0.12);
}

.brand-content h1 {
  margin: 0;
  font-size: clamp(38px, 4.05vw, 56px);
  font-weight: 700;
  line-height: 1.22;
  letter-spacing: -0.02em;
  animation: rise-in 0.65s 0.08s both;
}

.brand-content h1 span {
  color: #c4dcff;
}

.brand-description {
  max-width: 430px;
  margin-top: 18px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 14px;
  line-height: 1.85;
  animation: rise-in 0.65s 0.12s both;
}

.parking-board {
  width: min(100%, 470px);
  padding: 18px;
  margin-top: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 22px;
  box-shadow:
    0 24px 56px rgba(2, 19, 54, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: rise-in 0.7s 0.16s both;
}

.board-head,
.board-foot {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.board-head {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.board-title {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-weight: 500;
}

.live-dot {
  position: relative;
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #8ef0c8;
  border-radius: 50%;
}

.live-dot::after {
  position: absolute;
  inset: -4px;
  content: '';
  border: 1px solid rgba(142, 240, 200, 0.45);
  border-radius: 50%;
  animation: live-pulse 2.2s ease-out infinite;
}

.board-live {
  color: #8ef0c8;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 14px 0;
}

.slot {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
  height: 54px;
  padding: 8px 9px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.slot.is-occupied {
  background: rgba(3, 26, 66, 0.3);
  border-color: rgba(255, 255, 255, 0.08);
}

.slot-code {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.slot-state {
  color: #8ef0c8;
  font-size: 9px;
  line-height: 1;
}

.slot.is-occupied .slot-code {
  color: rgba(255, 255, 255, 0.48);
}

.slot.is-occupied .slot-state {
  color: rgba(255, 255, 255, 0.38);
}

.board-foot {
  padding-top: 12px;
  color: rgba(255, 255, 255, 0.46);
  font-size: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-stats {
  display: flex;
  gap: clamp(22px, 4vw, 44px);
  margin-top: 26px;
  animation: rise-in 0.7s 0.2s both;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat strong {
  font-size: 23px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.stat span {
  color: rgba(255, 255, 255, 0.56);
  font-size: 11px;
}

.stat-unit {
  margin-left: 1px;
  font-size: 12px;
  font-weight: 500;
}

.brand-footer {
  display: flex;
  gap: 10px;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
  letter-spacing: 0.05em;
}

.dot-separator {
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 50%;
}

/* ---------- 右侧表单区 ---------- */

.form-panel {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
  height: 100dvh;
  padding: 36px clamp(32px, 5vw, 76px);
  overflow-y: auto;
  background:
    radial-gradient(circle at 94% 4%, rgba(28, 100, 242, 0.07), transparent 29%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.form-wrap {
  width: min(100%, 412px);
  padding: 18px 0;
  margin: auto 0;
  animation: rise-in 0.55s 0.08s both;
}

.mobile-brand {
  display: none;
  gap: 12px;
  align-items: center;
}

.brand-mark--solid {
  color: #ffffff;
  background: linear-gradient(145deg, var(--auth-primary), var(--auth-primary-light));
  border: 0;
  box-shadow: 0 10px 24px rgba(28, 100, 242, 0.22);
}

.mobile-brand .brand-name strong {
  color: var(--auth-text);
}

.mobile-brand .brand-name span {
  color: #8a99b0;
}

.mode-switch {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  margin-bottom: 34px;
  background: #eff5ff;
  border: 1px solid #e4edfc;
  border-radius: 14px;
}

.mode-thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #ffffff;
  border-radius: 10px;
  box-shadow:
    0 4px 14px rgba(28, 100, 242, 0.13),
    0 1px 2px rgba(15, 31, 61, 0.04);
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.mode-thumb.is-register {
  transform: translateX(100%);
}

.mode-button {
  position: relative;
  z-index: 1;
  height: 40px;
  padding: 0;
  color: var(--auth-text-soft);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.mode-button.is-active {
  color: var(--auth-primary);
  font-weight: 600;
}

.mode-button:focus-visible,
.text-link:focus-visible,
.inline-link:focus-visible {
  outline: 3px solid rgba(28, 100, 242, 0.3);
  outline-offset: 2px;
}

.form-heading {
  margin-bottom: 28px;
}

.form-kicker {
  margin-bottom: 7px;
  color: var(--auth-primary);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.form-heading h2 {
  margin: 0;
  color: var(--auth-text);
  font-size: 31px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.form-heading > p:last-child {
  margin-top: 9px;
  color: var(--auth-text-soft);
  font-size: 13px;
  line-height: 1.65;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.auth-form :deep(.el-form-item__label) {
  height: auto;
  padding-bottom: 8px;
  color: #344054;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.auth-form :deep(.el-input__wrapper) {
  min-height: 48px;
  padding: 1px 14px;
  background: var(--auth-field-bg);
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--auth-border) inset;
  transition:
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #b8d0fa inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  box-shadow:
    0 0 0 1px var(--auth-primary) inset,
    0 0 0 4px rgba(28, 100, 242, 0.09);
}

.auth-form :deep(.el-input__inner) {
  color: var(--auth-text);
  font-size: 14px;
}

.auth-form :deep(.el-input__inner::placeholder) {
  color: #9aa9bf;
}

.auth-form :deep(.el-input__prefix) {
  margin-right: 5px;
  color: #8291a8;
}

.field-icon {
  display: block;
  width: 18px;
  height: 18px;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -2px 0 24px;
}

.form-options :deep(.el-checkbox__label) {
  padding-left: 7px;
  color: var(--auth-text-soft);
  font-size: 13px;
}

.form-options :deep(.el-checkbox__inner) {
  border-color: #c4d5ee;
  border-radius: 4px;
}

.form-options :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--auth-primary);
  border-color: var(--auth-primary);
}

.text-link,
.inline-link {
  padding: 0;
  color: var(--auth-primary);
  font: inherit;
  font-size: 13px;
  background: none;
  border: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.text-link:hover,
.inline-link:hover {
  color: var(--auth-primary-dark);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.submit-button.el-button {
  width: 100%;
  height: 50px;
  margin-top: 0;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, var(--auth-primary) 0%, var(--auth-primary-light) 100%);
  border: 0;
  border-radius: 12px;
  box-shadow: 0 12px 26px rgba(28, 100, 242, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

.submit-button.el-button:hover,
.submit-button.el-button:focus {
  color: #ffffff;
  background: linear-gradient(135deg, #1559e3 0%, #3f81ff 100%);
  box-shadow: 0 15px 30px rgba(28, 100, 242, 0.31);
  transform: translateY(-1px);
}

.submit-button.el-button:active {
  box-shadow: 0 8px 18px rgba(28, 100, 242, 0.24);
  transform: translateY(0);
}

.auth-form--register :deep(.el-form-item) {
  margin-bottom: 18px;
}

.form-switch {
  margin-top: 24px;
  color: var(--auth-text-soft);
  font-size: 13px;
  text-align: center;
}

.form-switch .inline-link {
  font-weight: 600;
}

.legal {
  margin-top: 30px;
  color: #9aa9bf;
  font-size: 11px;
  line-height: 1.8;
  text-align: center;
}

.legal .inline-link {
  font-size: inherit;
}

/* ---------- 动效 ---------- */

.form-fade-enter-active,
.form-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.form-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.form-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

@media (max-width: 1120px) {
  .brand-panel {
    padding-right: 40px;
    padding-left: 40px;
  }

  .brand-content h1 {
    font-size: clamp(36px, 4.25vw, 47px);
  }

  .brand-description {
    max-width: 390px;
  }
}

@media (max-width: 880px) {
  .auth-page {
    display: block;
  }

  .brand-panel {
    display: none;
  }

  .form-panel {
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    padding: 30px 24px;
    background:
      radial-gradient(circle at 100% 0%, rgba(28, 100, 242, 0.1), transparent 34%),
      linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
  }

  .form-wrap {
    padding: 8px 0 24px;
  }

  .mobile-brand {
    display: flex;
    margin-bottom: 30px;
  }

  .mode-switch {
    margin-bottom: 30px;
  }
}

@media (max-width: 480px) {
  .form-panel {
    padding: 24px 18px;
  }

  .form-heading {
    margin-bottom: 24px;
  }

  .form-heading h2 {
    font-size: 28px;
  }

  .auth-form :deep(.el-input__wrapper) {
    min-height: 46px;
  }

  .submit-button.el-button {
    height: 48px;
  }

  .legal {
    margin-top: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-top,
  .eyebrow,
  .brand-content h1,
  .brand-description,
  .parking-board,
  .brand-stats,
  .form-wrap {
    animation: none;
  }

  .live-dot::after {
    animation: none;
  }

  .mode-thumb,
  .form-fade-enter-active,
  .form-fade-leave-active,
  .submit-button.el-button {
    transition: none;
  }
}
</style>
