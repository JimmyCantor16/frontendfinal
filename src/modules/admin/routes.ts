import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/users',
    name: 'users',
    component: () => import('./views/UserListView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
]

export default routes
