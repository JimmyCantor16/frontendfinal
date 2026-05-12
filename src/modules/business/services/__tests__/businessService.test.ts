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

describe('Business Service', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let api: any

  beforeEach(async () => {
    vi.clearAllMocks()
    api = (await import('@core/api/client')).default
  })

  it('fetchBusinesses retorna la lista desde data.data', async () => {
    const items = [
      { id: 1, name: 'Bar Uno', owner_user_id: 1 },
      { id: 2, name: 'Bar Dos', owner_user_id: 1 },
    ]
    api.get.mockResolvedValue({ data: { data: items } })

    const { fetchBusinesses } = await import('@modules/business/services/business.service')
    const result = await fetchBusinesses()

    expect(api.get).toHaveBeenCalledWith('/businesses')
    expect(result).toEqual(items)
  })

  it('fetchBusinesses retorna array vacío si la respuesta no es lista', async () => {
    api.get.mockResolvedValue({ data: { data: null } })

    const { fetchBusinesses } = await import('@modules/business/services/business.service')
    const result = await fetchBusinesses()

    expect(result).toEqual([])
  })

  it('fetchBusiness llama a GET /businesses/{id}', async () => {
    const biz = { id: 42, name: 'Bar 42' }
    api.get.mockResolvedValue({ data: { data: biz } })

    const { fetchBusiness } = await import('@modules/business/services/business.service')
    const result = await fetchBusiness(42)

    expect(api.get).toHaveBeenCalledWith('/businesses/42')
    expect(result).toEqual(biz)
  })

  it('createBusiness hace POST /businesses con el payload', async () => {
    const payload = { name: 'Nuevo', tax_id: '900123', email: 'a@b.co' }
    const created = { id: 10, ...payload, owner_user_id: 1 }
    api.post.mockResolvedValue({ data: { data: created } })

    const { createBusiness } = await import('@modules/business/services/business.service')
    const result = await createBusiness(payload)

    expect(api.post).toHaveBeenCalledWith('/businesses', payload)
    expect(result).toEqual(created)
  })

  it('updateBusiness hace PUT /businesses/{id} con el payload', async () => {
    const updated = { id: 5, name: 'Renombrado' }
    api.put.mockResolvedValue({ data: { data: updated } })

    const { updateBusiness } = await import('@modules/business/services/business.service')
    const result = await updateBusiness(5, { name: 'Renombrado' })

    expect(api.put).toHaveBeenCalledWith('/businesses/5', { name: 'Renombrado' })
    expect(result).toEqual(updated)
  })

  it('deleteBusiness hace DELETE /businesses/{id}', async () => {
    api.delete.mockResolvedValue({ data: { ok: true } })

    const { deleteBusiness } = await import('@modules/business/services/business.service')
    await deleteBusiness(7)

    expect(api.delete).toHaveBeenCalledWith('/businesses/7')
  })

  it('switchBusiness hace POST /businesses/{id}/switch', async () => {
    const res = { business: { id: 3, name: 'Activo' }, current_business_id: 3 }
    api.post.mockResolvedValue({ data: { data: res } })

    const { switchBusiness } = await import('@modules/business/services/business.service')
    const result = await switchBusiness(3)

    expect(api.post).toHaveBeenCalledWith('/businesses/3/switch')
    expect(result).toEqual(res)
  })

  it('propaga errores de red', async () => {
    api.get.mockRejectedValue(new Error('Network Error'))

    const { fetchBusinesses } = await import('@modules/business/services/business.service')

    await expect(fetchBusinesses()).rejects.toThrow('Network Error')
  })
})
