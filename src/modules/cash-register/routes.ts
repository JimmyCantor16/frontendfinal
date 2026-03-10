import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/cash-register',
    name: 'cash-register',
    component: () => import('./views/CashRegisterView.vue'),
    meta: { requiresAuth: true, role: ['admin', 'cajero'] },
  },
]

export default routes
