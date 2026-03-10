import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockFetchMe = vi.fn()

vi.mock('@modules/auth/services/auth.service', () => ({
  login: vi.fn().mockResolvedValue({
    access_token: 'test-token-abc',
    user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
    business: { id: 1, name: 'TestBiz', subscription_status: 'active' },
  }),
  fetchMe: mockFetchMe,
}))

vi.mock('@core/plugins/inactivity', () => ({
  initInactivityControl: vi.fn(),
  clearInactivityControl: vi.fn(),
}))

vi.mock('@core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

describe('Auth Store - validateToken', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('returns false when no token is present', async () => {
    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    const result = await store.validateToken()

    expect(result).toBe(false)
    expect(mockFetchMe).not.toHaveBeenCalled()
  })

  it('calls fetchUser and returns true on success', async () => {
    localStorage.setItem('token', 'existing-token')

    mockFetchMe.mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin',
      business: { id: 1, name: 'TestBiz', subscription_status: 'active' },
    })

    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    const result = await store.validateToken()

    expect(result).toBe(true)
    expect(mockFetchMe).toHaveBeenCalled()
    expect(store.user).not.toBeNull()
    expect(store.user?.name).toBe('Admin')
    expect(store.token).toBe('existing-token')
  })

  it('maintains business state after successful validation', async () => {
    localStorage.setItem('token', 'existing-token')

    mockFetchMe.mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin',
      business: { id: 1, name: 'TestBiz', subscription_status: 'active' },
    })

    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    await store.validateToken()

    expect(store.business?.name).toBe('TestBiz')
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'business',
      JSON.stringify({ id: 1, name: 'TestBiz', subscription_status: 'active' })
    )
  })

  it('clears auth state and returns false on fetchUser failure', async () => {
    localStorage.setItem('token', 'expired-token')

    mockFetchMe.mockRejectedValue(new Error('Unauthenticated'))

    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const store = useAuthStore()

    const result = await store.validateToken()

    expect(result).toBe(false)
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.business).toBeNull()
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    expect(localStorage.removeItem).toHaveBeenCalledWith('business')
  })
})
