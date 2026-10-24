import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import LotsView from '../views/LotsView.vue'
import VehiclesView from '../views/VehiclesView.vue'
import BillingView from '../views/BillingView.vue'
import MembersView from '../views/MembersView.vue'
import ReportsView from '../views/ReportsView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: AuthView,
    },
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
          meta: { title: '数据概览' },
        },
        {
          path: 'lots',
          name: 'lots',
          component: LotsView,
          meta: { title: '车位管理' },
        },
        {
          path: 'vehicles',
          name: 'vehicles',
          component: VehiclesView,
          meta: { title: '车辆记录' },
        },
        {
          path: 'billing',
          name: 'billing',
          component: BillingView,
          meta: { title: '收费记录' },
        },
        {
          path: 'members',
          name: 'members',
          component: MembersView,
          meta: { title: '会员管理' },
        },
        {
          path: 'reports',
          name: 'reports',
          component: ReportsView,
          meta: { title: '统计报表' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
          meta: { title: '系统设置' },
        },
      ],
    },
  ],
})

export default router
