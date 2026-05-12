import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/plans',
    name: 'plans',
    component: () => import('./views/PlansView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/subscription',
    name: 'subscription',
    component: () => import('./views/SubscriptionView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/subscription/success',
    name: 'subscription-success',
    component: () => import('./views/CheckoutSuccessView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/subscription/cancel',
    name: 'subscription-cancel',
    component: () => import('./views/CheckoutCancelView.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
