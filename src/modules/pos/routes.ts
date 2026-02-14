import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/pos',
    name: 'pos',
    component: () => import('./views/PosView.vue'),
    meta: { requiresAuth: true, fullscreen: true },
  },
]

export default routes
