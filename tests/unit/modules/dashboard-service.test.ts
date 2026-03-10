import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

describe('Dashboard Service', () => {
  let api: any

  beforeEach(async () => {
    vi.clearAllMocks()
    api = (await import('@core/api/client')).default
  })

  it('fetchDashboard returns stats from data.data', async () => {
    const stats = {
      ventas_hoy: 350000,
      ventas_mes: 5000000,
      facturas_hoy: 12,
      productos_stock_bajo: [
        { id: 1, name: 'Producto A', stock: 2 },
      ],
    }
    api.get.mockResolvedValue({ data: { data: stats } })

    const { fetchDashboard } = await import(
      '@modules/dashboard/services/dashboard.service'
    )
    const result = await fetchDashboard()

    expect(api.get).toHaveBeenCalledWith('/dashboard')
    expect(result).toEqual(stats)
  })

  it('fetchDashboard returns stats from data when data.data is undefined', async () => {
    const stats = {
      ventas_hoy: 100000,
      ventas_mes: 2000000,
      facturas_hoy: 5,
      productos_stock_bajo: [],
    }
    api.get.mockResolvedValue({ data: stats })

    const { fetchDashboard } = await import(
      '@modules/dashboard/services/dashboard.service'
    )
    const result = await fetchDashboard()

    expect(result).toEqual(stats)
  })

  it('fetchDashboard propagates API errors', async () => {
    api.get.mockRejectedValue(new Error('Unauthorized'))

    const { fetchDashboard } = await import(
      '@modules/dashboard/services/dashboard.service'
    )

    await expect(fetchDashboard()).rejects.toThrow('Unauthorized')
  })
})
