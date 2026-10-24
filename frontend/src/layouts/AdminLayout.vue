<template>
  <div class="admin">
    <!-- 侧边导航 -->
    <aside class="sidebar">
      <div class="side-brand">
        <div class="side-mark" aria-hidden="true">
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
        <div class="side-name">
          <strong>智能停车场</strong>
          <span>SMART PARKING</span>
        </div>
      </div>

      <nav class="side-nav" aria-label="主导航">
        <p class="nav-group">运营管理</p>
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="nav-item"
          :class="{ 'is-active': isActive(item.name) }"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path v-for="(d, i) in item.icon" :key="i" :d="d" />
          </svg>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="side-foot">
        <div class="side-status"><span class="status-dot" aria-hidden="true"></span>系统运行正常</div>
        <span class="side-version">v0.1.0</span>
      </div>
    </aside>

    <!-- 主区域 -->
    <div class="main">
      <header class="topbar">
        <div class="crumb">
          <span class="crumb-root">智能停车场</span>
          <span class="crumb-sep" aria-hidden="true">/</span>
          <span class="crumb-cur">{{ currentTitle }}</span>
        </div>

        <div class="topbar-right">
          <div class="datetime">
            <span class="date">{{ todayLabel }}</span>
            <span class="time num">{{ timeLabel }}</span>
          </div>
          <div class="user">
            <span class="avatar" aria-hidden="true">管</span>
            <span class="user-name">管理员</span>
          </div>
          <button type="button" class="logout" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                d="M14 8.5 17.5 12 14 15.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M17.5 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            退出登录
          </button>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

interface NavItem {
  name: string
  label: string
  icon: string[]
}

const navItems: NavItem[] = [
  {
    name: 'dashboard',
    label: '数据概览',
    icon: ['M3.5 3.5h7v7h-7z', 'M13.5 3.5h7v7h-7z', 'M3.5 13.5h7v7h-7z', 'M13.5 13.5h7v7h-7z'],
  },
  {
    name: 'lots',
    label: '车位管理',
    icon: ['M8 18.5V5.5h5.2a4 4 0 0 1 0 8H8'],
  },
  {
    name: 'vehicles',
    label: '车辆记录',
    icon: [
      'M5 17H3.5v-3.5l1.8-4.7A2 2 0 0 1 7.2 7.5h9.6a2 2 0 0 1 1.9 1.3l1.8 4.7V17H19',
      'M5 13.5h14',
      'M7.2 17.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8z',
      'M16.8 17.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8z',
    ],
  },
  {
    name: 'billing',
    label: '收费记录',
    icon: ['M5 3.5h14v17H5z', 'M8.5 8h7', 'M8.5 12h7', 'M8.5 16h4'],
  },
  {
    name: 'members',
    label: '会员管理',
    icon: [
      'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'M2.5 20v-1.5a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5V20',
      'M16 3.6a4 4 0 0 1 0 7.5',
      'M21.5 20v-1.5a5 5 0 0 0-3.6-4.8',
    ],
  },
  {
    name: 'reports',
    label: '统计报表',
    icon: ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  },
  {
    name: 'settings',
    label: '系统设置',
    icon: [
      'M4 21v-7',
      'M4 10V3',
      'M12 21v-9',
      'M12 8V3',
      'M20 21v-5',
      'M20 12V3',
      'M1 14h6',
      'M9 8h6',
      'M17 16h6',
    ],
  },
]

const route = useRoute()
const router = useRouter()

const currentTitle = computed(() => (route.meta.title as string) ?? '')
const isActive = (name: string) => route.name === name

const now = ref(Date.now())
const timer = window.setInterval(() => {
  now.value = Date.now()
}, 1000)

onUnmounted(() => window.clearInterval(timer))

const todayLabel = computed(() => {
  const d = new Date(now.value)
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${week}`
})

const timeLabel = computed(() => new Date(now.value).toLocaleTimeString('zh-CN', { hour12: false }))

function handleLogout() {
  ElMessage.success('已退出登录')
  router.push({ name: 'login' })
}
</script>

<style scoped>
.admin {
  --side-bg-from: #0a2a5e;
  --side-bg-to: #0c47ad;
  --ink: #0f1f3d;
  --ink-soft: #64748b;
  --ink-muted: #94a3b8;
  --border: #e6edf7;
  --primary: #1c64f2;

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--ink);
  font-family:
    'PingFang SC',
    'Microsoft YaHei',
    'Hiragino Sans GB',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.num {
  font-variant-numeric: tabular-nums;
}

/* ---------- 侧边栏 ---------- */

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex: 0 0 232px;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  padding: 20px 14px;
  overflow: hidden;
  color: #ffffff;
  background:
    radial-gradient(circle at 20% 0%, rgba(96, 165, 250, 0.24), transparent 42%),
    linear-gradient(180deg, var(--side-bg-from) 0%, var(--side-bg-to) 100%);
}

.side-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 2px 10px 20px;
}

.side-mark {
  display: grid;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 11px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
  place-items: center;
}

.side-mark svg {
  width: 22px;
  height: 22px;
}

.side-name {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.side-name strong {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.side-name span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.2em;
}

.side-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
}

.nav-group {
  padding: 0 12px;
  margin: 0 0 6px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  letter-spacing: 0.1em;
}

.nav-item {
  position: relative;
  display: flex;
  gap: 12px;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 14px;
  font-weight: 500;
  border-radius: 11px;
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.nav-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.nav-item.is-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.nav-item.is-active::before {
  position: absolute;
  left: -14px;
  width: 3px;
  height: 22px;
  content: '';
  background: #8ef0c8;
  border-radius: 0 3px 3px 0;
}

.nav-icon {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
}

.nav-label {
  white-space: nowrap;
}

.side-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px 2px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.side-status {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #8ef0c8;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(142, 240, 200, 0.15);
}

.side-version {
  letter-spacing: 0.04em;
}

/* ---------- 主区域 ---------- */

.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  background:
    radial-gradient(circle at 100% 0%, rgba(28, 100, 242, 0.06), transparent 30%),
    linear-gradient(180deg, #f4f8ff 0%, #eef3fb 100%);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 28px;
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.crumb {
  display: flex;
  gap: 9px;
  align-items: center;
  font-size: 14px;
}

.crumb-root {
  color: var(--ink-muted);
}

.crumb-sep {
  color: #c3cedd;
}

.crumb-cur {
  color: var(--ink);
  font-weight: 600;
}

.topbar-right {
  display: flex;
  gap: 22px;
  align-items: center;
}

.datetime {
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: right;
}

.datetime .date {
  color: var(--ink-soft);
  font-size: 12px;
}

.datetime .time {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.user {
  display: flex;
  gap: 9px;
  align-items: center;
  padding-left: 22px;
  border-left: 1px solid var(--border);
}

.avatar {
  display: grid;
  width: 34px;
  height: 34px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(145deg, #0a3f9e, #1c64f2);
  border-radius: 50%;
  place-items: center;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
}

.logout {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 34px;
  padding: 0 14px;
  color: var(--ink-soft);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 9px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.logout svg {
  width: 16px;
  height: 16px;
}

.logout:hover {
  color: var(--primary);
  border-color: #c4d5ee;
  background: #f6faff;
}

.content {
  width: 100%;
  max-width: 1280px;
  padding: 26px 28px 40px;
  margin: 0 auto;
}

/* ---------- 响应式 ---------- */

@media (max-width: 1024px) {
  .sidebar {
    flex-basis: 72px;
    padding: 20px 10px;
  }

  .side-name,
  .nav-label,
  .nav-group,
  .side-status,
  .side-version {
    display: none;
  }

  .side-brand {
    justify-content: center;
    padding: 2px 0 20px;
  }

  .nav-item {
    justify-content: center;
    padding: 0;
  }

  .nav-item.is-active::before {
    left: -10px;
  }

  .side-foot {
    justify-content: center;
  }
}

@media (max-width: 720px) {
  .topbar {
    padding: 0 16px;
  }

  .datetime,
  .user-name {
    display: none;
  }

  .content {
    padding: 20px 16px 32px;
  }
}
</style>
