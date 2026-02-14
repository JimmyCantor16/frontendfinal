import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    role?: string
    layout?: 'default' | 'auth'
    fullscreen?: boolean
  }
}
import { authGuard } from './guards'

import authRoutes from '@modules/auth/routes'
import dashboardRoutes from '@modules/dashboard/routes'
import catalogRoutes from '@modules/catalog/routes'
import inventoryRoutes from '@modules/inventory/routes'
import purchasesRoutes from '@modules/purchases/routes'
import invoicesRoutes from '@modules/invoices/routes'
import posRoutes from '@modules/pos/routes'
import adminRoutes from '@modules/admin/routes'
import cashRegisterRoutes from '@modules/cash-register/routes'
import reportsRoutes from '@modules/reports/routes'
import settingsRoutes from '@modules/settings/routes'

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...catalogRoutes,
  ...inventoryRoutes,
  ...purchasesRoutes,
  ...invoicesRoutes,
  ...posRoutes,
  ...adminRoutes,
  ...cashRegisterRoutes,
  ...reportsRoutes,
  ...settingsRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(authGuard)

export default router
