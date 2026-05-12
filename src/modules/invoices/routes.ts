import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/invoices',
    name: 'invoices',
    component: () => import('./views/InvoiceListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/invoices/:id',
    name: 'invoice-detail',
    component: () => import('./views/InvoiceDetailView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/invoices/:id/print',
    name: 'invoice-print',
    component: () => import('./views/InvoicePrintView.vue'),
    meta: { requiresAuth: true, fullscreen: true },
  },
]

export default routes
