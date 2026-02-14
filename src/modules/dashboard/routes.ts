import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
