import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/pages/dashboard/DashboardPage.vue'),
      meta: {
        title: 'Dashboard',
        layout: 'admin',
        permissions: ['dashboard.read'],
      },
    },
  ],
})
