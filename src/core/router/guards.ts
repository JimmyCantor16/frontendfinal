import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@modules/auth/store/auth.store'

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
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
}
