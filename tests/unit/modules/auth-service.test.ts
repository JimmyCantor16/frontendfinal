import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

vi.mock('@core/types/models', async (importOriginal) => {
  const original = await importOriginal() as Record<string, unknown>
  return {
    ...original,
    normalizeUser: vi.fn((raw: Record<string, unknown>) => ({
      ...raw,
      role: raw.role || 'user',
    })),
  }
})

import api from '@core/api/client'
import { normalizeUser } from '@core/types/models'
import { login, fetchMe } from '@modules/auth/services/auth.service'

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('returns normalized user data on success', async () => {
      const mockResponse = {
        data: {
          access_token: 'abc123',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            roles: [{ id: 1, name: 'admin' }],
          },
          business: {
            id: 1,
            name: 'Test Business',
            subscription_status: 'active',
          },
        },
      }
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)
      vi.mocked(normalizeUser).mockReturnValueOnce({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      })

      const result = await login({
        email: 'test@example.com',
        password: 'password',
        recaptcha_token: 'token',
      })

      expect(api.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: 'password',
        recaptcha_token: 'token',
      })
      expect(normalizeUser).toHaveBeenCalled()
      expect(result.access_token).toBe('abc123')
      expect(result.user.role).toBe('admin')
    })

    it('handles API error', async () => {
      const error = new Error('Invalid credentials')
      vi.mocked(api.post).mockRejectedValueOnce(error)

      await expect(
        login({
          email: 'bad@example.com',
          password: 'wrong',
          recaptcha_token: 'token',
        })
      ).rejects.toThrow('Invalid credentials')
    })

    it('handles response without user object', async () => {
      const mockResponse = {
        data: {
          access_token: 'abc123',
          user: null,
          business: null,
        },
      }
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      const result = await login({
        email: 'test@example.com',
        password: 'password',
        recaptcha_token: 'token',
      })

      // normalizeUser should NOT be called when user is null
      expect(normalizeUser).not.toHaveBeenCalled()
      expect(result.access_token).toBe('abc123')
    })
  })

  describe('fetchMe', () => {
    it('returns normalized user from data.data', async () => {
      const rawUser = { id: 2, name: 'Me', email: 'me@test.com', role: 'cajero' }
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: rawUser } })
      vi.mocked(normalizeUser).mockReturnValueOnce({
        id: 2,
        name: 'Me',
        email: 'me@test.com',
        role: 'cajero',
      })

      const result = await fetchMe()

      expect(api.get).toHaveBeenCalledWith('/me')
      expect(normalizeUser).toHaveBeenCalledWith(rawUser)
      expect(result.role).toBe('cajero')
    })

    it('returns normalized user from data directly', async () => {
      const rawUser = { id: 3, name: 'Direct', email: 'd@test.com', role: 'user' }
      vi.mocked(api.get).mockResolvedValueOnce({ data: rawUser })
      vi.mocked(normalizeUser).mockReturnValueOnce({
        id: 3,
        name: 'Direct',
        email: 'd@test.com',
        role: 'user',
      })

      const result = await fetchMe()

      expect(normalizeUser).toHaveBeenCalledWith(rawUser)
      expect(result.id).toBe(3)
    })
  })
})
