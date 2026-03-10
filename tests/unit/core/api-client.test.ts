import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
  return {
    default: {
      create: vi.fn(() => instance),
    },
  }
})

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should create axios instance with correct base config', async () => {
    const { default: axiosDefault } = await import('axios')
    // Re-import to trigger module execution
    vi.resetModules()
    await import('@core/api/client')

    expect(axiosDefault.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:8000/api',
        timeout: 30000,
        headers: { Accept: 'application/json' },
      })
    )
  })

  it('should register request and response interceptors', async () => {
    vi.resetModules()
    const mod = await import('@core/api/client')
    const api = mod.default
    expect(api.interceptors.request.use).toHaveBeenCalled()
    expect(api.interceptors.response.use).toHaveBeenCalled()
  })
})
