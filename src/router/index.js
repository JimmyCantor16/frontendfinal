import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import UserList from '@/components/UserList.vue'
import DashboardView from '@/components/DashboardView.vue'
import CategoryList from '@/components/CategoryList.vue'
import SupplierList from '@/components/SupplierList.vue'
import ClientList from '@/components/ClientList.vue'
import ProductList from '@/components/ProductList.vue'
import PurchaseOrderList from '@/components/PurchaseOrderList.vue'
import PurchaseOrderDetail from '@/components/PurchaseOrderDetail.vue'
import InvoiceList from '@/components/InvoiceList.vue'
import InvoiceDetail from '@/components/InvoiceDetail.vue'
import InventoryMovementList from '@/components/InventoryMovementList.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: LoginForm },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/categories', component: CategoryList, meta: { requiresAuth: true } },
  { path: '/suppliers', component: SupplierList, meta: { requiresAuth: true } },
  { path: '/clients', component: ClientList, meta: { requiresAuth: true } },
  { path: '/products', component: ProductList, meta: { requiresAuth: true } },
  { path: '/purchase-orders', component: PurchaseOrderList, meta: { requiresAuth: true } },
  { path: '/purchase-orders/:id', component: PurchaseOrderDetail, meta: { requiresAuth: true } },
  { path: '/invoices', component: InvoiceList, meta: { requiresAuth: true } },
  { path: '/invoices/:id', component: InvoiceDetail, meta: { requiresAuth: true } },
  { path: '/inventory', component: InventoryMovementList, meta: { requiresAuth: true } },
  {
    path: '/users',
    component: UserList,
    meta: { requiresAuth: true, role: 'admin' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    return next('/login')
  }

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    return next('/dashboard')
  }

  if (to.path === '/login' && auth.token) {
    return next('/dashboard')
  }

  next()
})

export default router
