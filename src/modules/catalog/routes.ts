import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/categories',
    name: 'categories',
    component: () => import('./views/CategoryListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/suppliers',
    name: 'suppliers',
    component: () => import('./views/SupplierListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/clients',
    name: 'clients',
    component: () => import('./views/ClientListView.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
