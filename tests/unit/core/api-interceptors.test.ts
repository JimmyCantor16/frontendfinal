import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { InternalAxiosRequestConfig, AxiosHeaders } from 'axios'

// We need to test the interceptors registered in client.ts.
// We mock axios.create to capture the interceptor callbacks.

let requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
let responseErrorInterceptor: (err: unknown) => unknown

vi.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      request: {
        use: vi.fn((fn: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) => {
          requestInterceptor = fn
        }),
      },
      response: {
        use: vi.fn((_success: unknown, errFn: (err: unknown) => unknown) => {
          responseErrorInterceptor = errFn
        }),
      },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }

  return {
    default: {
      create: vi.fn(() => mockInstance),
    },
  }
})

describe('API Client Interceptors', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    localStorage.clear()
    window.location.href = ''

    // Re-import the module to trigger interceptor registration
    vi.resetModules()
    await import('@core/api/client')
  })

  describe('Request interceptor', () => {
    it('adds Bearer token from localStorage', () => {
      localStorage.setItem('token', 'my-test-token')

      const config = {
        headers: {} as unknown as AxiosHeaders,
      } as InternalAxiosRequestConfig

      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBe('Bearer my-test-token')
    })

    it('does not add Authorization header when no token', () => {
      const config = {
        headers: {} as unknown as AxiosHeaders,
      } as InternalAxiosRequestConfig

      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('adds X-Business-Id header from localStorage', () => {
      localStorage.setItem('business', JSON.stringify({ id: 42, name: 'Test Biz' }))

      const config = {
        headers: {} as unknown as AxiosHeaders,
      } as InternalAxiosRequestConfig

      const result = requestInterceptor(config)

      expect(result.headers['X-Business-Id']).toBe('42')
    })

    it('does not add X-Business-Id when no business in localStorage', () => {
      const config = {
        headers: {} as unknown as AxiosHeaders,
      } as InternalAxiosRequestConfig

      const result = requestInterceptor(config)

      expect(result.headers['X-Business-Id']).toBeUndefined()
    })

    it('handles invalid JSON in business localStorage gracefully', () => {
      localStorage.setItem('business', 'not-json')

      const config = {
        headers: {} as unknown as AxiosHeaders,
      } as InternalAxiosRequestConfig

      const result = requestInterceptor(config)

      // Should not throw, and should not set header
      expect(result.headers['X-Business-Id']).toBeUndefined()
    })

    it('does not add X-Business-Id when business has no id', () => {
      localStorage.setItem('business', JSON.stringify({ name: 'No ID Biz' }))

      const config = {
        headers: {} as unknown as AxiosHeaders,
      } as InternalAxiosRequestConfig

      const result = requestInterceptor(config)

      expect(result.headers['X-Business-Id']).toBeUndefined()
    })
  })

  describe('Response error interceptor', () => {
    it('handles 401 by removing auth data and redirecting to /login', async () => {
      localStorage.setItem('token', 'some-token')
      localStorage.setItem('user', '{"id":1}')
      localStorage.setItem('business', '{"id":1}')

      const error = { response: { status: 401 } }

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
      expect(localStorage.getItem('business')).toBeNull()
      expect(window.location.href).toBe('/login')
    })

    it('does not clear auth data for non-401 errors', async () => {
      localStorage.setItem('token', 'keep-me')

      const error = { response: { status: 500 } }

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)

      expect(localStorage.getItem('token')).toBe('keep-me')
    })

    it('rejects the error promise for any error', async () => {
      const error = { response: { status: 403 } }

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
    })
  })
})
