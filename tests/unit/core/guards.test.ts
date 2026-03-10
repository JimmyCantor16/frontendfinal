import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock the auth store module
vi.mock('@modules/auth/store/auth.store', () => {
  let storeState = { token: null as string | null, user: null as { role: string } | null }
  return {
    useAuthStore: () => ({
      get token() { return storeState.token },
      get user() { return storeState.user },
    }),
    __setMockState: (state: typeof storeState) => { storeState = state },
  }
})

import { authGuard } from '@core/router/guards'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

function createRoute(overrides: Partial<RouteLocationNormalized> = {}): RouteLocationNormalized {
  return {
    path: '/',
    fullPath: '/',
    name: undefined,
    hash: '',
    query: {},
    params: {},
    matched: [],
    meta: {},
    redirectedFrom: undefined,
    ...overrides,
  } as RouteLocationNormalized
}

describe('Auth Guard', () => {
  let next: NavigationGuardNext

  beforeEach(() => {
    setActivePinia(createPinia())
    next = vi.fn()
  })

  it('should redirect to /login when route requires auth but no token', async () => {
    const { __setMockState } = await import('@modules/auth/store/auth.store') as any
    __setMockState({ token: null, user: null })

    const to = createRoute({ path: '/dashboard', meta: { requiresAuth: true } })
    const from = createRoute()
    authGuard(to, from, next)

    expect(next).toHaveBeenCalledWith('/login')
  })

  it('should allow access when route requires auth and token exists', async () => {
    const { __setMockState } = await import('@modules/auth/store/auth.store') as any
    __setMockState({ token: 'valid-token', user: { role: 'admin' } })

    const to = createRoute({ path: '/dashboard', meta: { requiresAuth: true } })
    const from = createRoute()
    authGuard(to, from, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('should redirect to /dashboard when accessing /login while authenticated', async () => {
    const { __setMockState } = await import('@modules/auth/store/auth.store') as any
    __setMockState({ token: 'valid-token', user: { role: 'admin' } })

    const to = createRoute({ path: '/login', meta: {} })
    const from = createRoute()
    authGuard(to, from, next)

    expect(next).toHaveBeenCalledWith('/dashboard')
  })

  it('should block user from admin-only route', async () => {
    const { __setMockState } = await import('@modules/auth/store/auth.store') as any
    __setMockState({ token: 'valid-token', user: { role: 'cajero' } })

    const to = createRoute({ path: '/users', meta: { requiresAuth: true, role: 'admin' } })
    const from = createRoute()
    authGuard(to, from, next)

    expect(next).toHaveBeenCalledWith('/dashboard')
  })

  it('should handle case-insensitive role matching', async () => {
    const { __setMockState } = await import('@modules/auth/store/auth.store') as any
    __setMockState({ token: 'valid-token', user: { role: 'Admin' } })

    const to = createRoute({ path: '/users', meta: { requiresAuth: true, role: 'admin' } })
    const from = createRoute()
    authGuard(to, from, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('should handle array of allowed roles', async () => {
    const { __setMockState } = await import('@modules/auth/store/auth.store') as any
    __setMockState({ token: 'valid-token', user: { role: 'cajero' } })

    const to = createRoute({ path: '/pos', meta: { requiresAuth: true, role: ['admin', 'cajero'] } })
    const from = createRoute()
    authGuard(to, from, next)

    expect(next).toHaveBeenCalledWith()
  })
})
