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

describe('Catalog Services', () => {
  let api: any

  beforeEach(async () => {
    vi.clearAllMocks()
    api = (await import('@core/api/client')).default
  })

  describe('CategoryService', () => {
    it('fetchCategories returns array from data.data', async () => {
      const categories = [
        { id: 1, name: 'Bebidas' },
        { id: 2, name: 'Snacks' },
      ]
      api.get.mockResolvedValue({ data: { data: categories } })

      const { fetchCategories } = await import(
        '@modules/catalog/services/category.service'
      )
      const result = await fetchCategories()

      expect(api.get).toHaveBeenCalledWith('/categories')
      expect(result).toEqual(categories)
    })

    it('fetchCategories returns array from data when data.data is undefined', async () => {
      const categories = [{ id: 1, name: 'Bebidas' }]
      api.get.mockResolvedValue({ data: categories })

      const { fetchCategories } = await import(
        '@modules/catalog/services/category.service'
      )
      const result = await fetchCategories()

      expect(result).toEqual(categories)
    })
  })

  describe('ClientService', () => {
    it('fetchClients returns array from data.data', async () => {
      const clients = [
        { id: 1, name: 'Juan', email: 'juan@test.com' },
        { id: 2, name: 'Maria', email: 'maria@test.com' },
      ]
      api.get.mockResolvedValue({ data: { data: clients } })

      const { fetchClients } = await import(
        '@modules/catalog/services/client.service'
      )
      const result = await fetchClients()

      expect(api.get).toHaveBeenCalledWith('/clients')
      expect(result).toEqual(clients)
    })

    it('fetchClients returns array from data when data.data is undefined', async () => {
      const clients = [{ id: 1, name: 'Juan' }]
      api.get.mockResolvedValue({ data: clients })

      const { fetchClients } = await import(
        '@modules/catalog/services/client.service'
      )
      const result = await fetchClients()

      expect(result).toEqual(clients)
    })
  })

  describe('SupplierService', () => {
    it('fetchSuppliers returns array from data.data', async () => {
      const suppliers = [
        { id: 1, name: 'Proveedor A' },
        { id: 2, name: 'Proveedor B' },
      ]
      api.get.mockResolvedValue({ data: { data: suppliers } })

      const { fetchSuppliers } = await import(
        '@modules/catalog/services/supplier.service'
      )
      const result = await fetchSuppliers()

      expect(api.get).toHaveBeenCalledWith('/suppliers')
      expect(result).toEqual(suppliers)
    })

    it('fetchSuppliers returns array from data when data.data is undefined', async () => {
      const suppliers = [{ id: 1, name: 'Proveedor A' }]
      api.get.mockResolvedValue({ data: suppliers })

      const { fetchSuppliers } = await import(
        '@modules/catalog/services/supplier.service'
      )
      const result = await fetchSuppliers()

      expect(result).toEqual(suppliers)
    })
  })
})
