import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/purchase-orders',
    name: 'purchase-orders',
    component: () => import('./views/PurchaseOrderListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/purchase-orders/:id',
    name: 'purchase-order-detail',
    component: () => import('./views/PurchaseOrderDetailView.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
