import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/products',
    name: 'products',
    component: () => import('./views/ProductListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory',
    name: 'inventory-movements',
    component: () => import('./views/InventoryMovementListView.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
