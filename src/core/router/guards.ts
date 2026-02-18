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

  if (to.meta.role) {
    const allowed = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]
    const role = (auth.user?.role ?? '').toLowerCase()
    if (role && !allowed.includes(role)) {
      return next('/dashboard')
    }
  }

  if (to.path === '/login' && auth.token) {
    return next('/dashboard')
  }

  next()
}
