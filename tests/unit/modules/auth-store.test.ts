import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock auth service
vi.mock('@modules/auth/services/auth.service', () => ({
  login: vi.fn().mockResolvedValue({
    access_token: 'test-token-abc',
    user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
    business: { id: 1, name: 'TestBiz', subscription_status: 'active' },
  }),
  fetchMe: vi.fn().mockResolvedValue({
    id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin',
    business: { id: 1, name: 'TestBiz', subscription_status: 'active' },
  }),
}))

// Mock inactivity
vi.mock('@core/plugins/inactivity', () => ({
  initInactivityControl: vi.fn(),
  clearInactivityControl: vi.fn(),
}))

// Mock api client for logout
vi.mock('@core/api/client', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should start with null state when localStorage is empty', async () => {
    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.business).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('should login and store token, user, business', async () => {
    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    await store.login({
      email: 'admin@test.com',
      password: 'password',
      recaptcha_token: 'token',
    })

    expect(store.token).toBe('test-token-abc')
    expect(store.user?.name).toBe('Admin')
    expect(store.user?.role).toBe('admin')
    expect(store.business?.name).toBe('TestBiz')
    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token-abc')
  })

  it('should clear only auth data on logout', async () => {
    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    // Login first
    await store.login({
      email: 'admin@test.com',
      password: 'password',
      recaptcha_token: 'token',
    })

    await store.logout()

    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    expect(localStorage.removeItem).toHaveBeenCalledWith('business')
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.business).toBeNull()
  })

  it('should call backend POST /logout on logout', async () => {
    const api = (await import('@core/api/client')).default
    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    await store.login({
      email: 'admin@test.com',
      password: 'password',
      recaptcha_token: 'token',
    })

    await store.logout()

    expect(api.post).toHaveBeenCalledWith('/logout')
  })

  it('should compute businessId correctly', async () => {
    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    expect(store.businessId).toBeNull()

    await store.login({
      email: 'admin@test.com',
      password: 'password',
      recaptcha_token: 'token',
    })

    expect(store.businessId).toBe(1)
  })
})
