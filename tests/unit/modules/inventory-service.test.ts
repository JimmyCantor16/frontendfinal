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

describe('Product Service', () => {
  let api: any

  beforeEach(async () => {
    vi.clearAllMocks()
    api = (await import('@core/api/client')).default
  })

  it('fetchProducts returns product array from data.data', async () => {
    const products = [
      { id: 1, name: 'Coca-Cola', price: 2500, stock: 50 },
      { id: 2, name: 'Pepsi', price: 2300, stock: 30 },
    ]
    api.get.mockResolvedValue({ data: { data: products } })

    const { fetchProducts } = await import(
      '@modules/inventory/services/product.service'
    )
    const result = await fetchProducts()

    expect(api.get).toHaveBeenCalledWith('/products')
    expect(result).toEqual(products)
  })

  it('fetchProducts returns product array from data when data.data is undefined', async () => {
    const products = [{ id: 1, name: 'Coca-Cola', price: 2500, stock: 50 }]
    api.get.mockResolvedValue({ data: products })

    const { fetchProducts } = await import(
      '@modules/inventory/services/product.service'
    )
    const result = await fetchProducts()

    expect(result).toEqual(products)
  })

  it('fetchProducts propagates API errors', async () => {
    api.get.mockRejectedValue(new Error('Network Error'))

    const { fetchProducts } = await import(
      '@modules/inventory/services/product.service'
    )

    await expect(fetchProducts()).rejects.toThrow('Network Error')
  })
})
