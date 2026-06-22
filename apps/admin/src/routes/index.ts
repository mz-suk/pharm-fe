import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@domains/dashboard').then((module) => module.DashboardPage),
    meta: {
      title: 'Dashboard',
      layout: 'admin',
      permissions: ['dashboard.read'],
    },
  },
]
