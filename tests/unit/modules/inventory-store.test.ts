import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockFetchProducts = vi.fn()

vi.mock('@modules/inventory/services/product.service', () => ({
  fetchProducts: () => mockFetchProducts(),
}))

// The inventory store uses api.get directly for categories
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

vi.mock('@core/utils/notify', () => ({
  notifyApiError: vi.fn(),
}))

describe('Inventory Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should load products successfully', async () => {
    const products = [
      { id: 1, name: 'Producto A', stock: 10, sale_price: 100 },
      { id: 2, name: 'Producto B', stock: 5, sale_price: 200 },
    ]
    mockFetchProducts.mockResolvedValue(products)

    const { useInventoryStore } = await import('@modules/inventory/store/inventory.store')
    const store = useInventoryStore()

    await store.loadProducts()

    expect(store.products).toEqual(products)
  })

  it('should show error notification on products load failure', async () => {
    mockFetchProducts.mockRejectedValue(new Error('API error'))

    const { useInventoryStore } = await import('@modules/inventory/store/inventory.store')
    const { notifyApiError } = await import('@core/utils/notify')
    const store = useInventoryStore()

    await store.loadProducts()

    expect(notifyApiError).toHaveBeenCalled()
    expect(store.products).toEqual([])
  })

  it('should load categories via api.get', async () => {
    const api = (await import('@core/api/client')).default
    const categories = [{ id: 1, name: 'Categoría A' }]
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { data: categories } })

    const { useInventoryStore } = await import('@modules/inventory/store/inventory.store')
    const store = useInventoryStore()

    await store.loadCategories()

    expect(api.get).toHaveBeenCalledWith('/categories')
    expect(store.categories).toEqual(categories)
  })

  it('should load all data (products + categories)', async () => {
    const api = (await import('@core/api/client')).default
    mockFetchProducts.mockResolvedValue([{ id: 1, name: 'P1', stock: 5 }])
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { data: [{ id: 1, name: 'C1' }] } })

    const { useInventoryStore } = await import('@modules/inventory/store/inventory.store')
    const store = useInventoryStore()

    await store.loadAll()

    expect(store.products).toHaveLength(1)
    expect(store.categories).toHaveLength(1)
  })
})
