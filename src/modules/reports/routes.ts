import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/reports/daily',
    name: 'daily-report',
    component: () => import('./views/DailyReportView.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
