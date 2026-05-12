import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockFetchBusinesses = vi.fn()
const mockCreateBusiness = vi.fn()
const mockUpdateBusiness = vi.fn()
const mockDeleteBusiness = vi.fn()
const mockSwitchBusiness = vi.fn()

vi.mock('@modules/business/services/business.service', () => ({
  fetchBusinesses: (...args: unknown[]) => mockFetchBusinesses(...args),
  fetchBusiness: vi.fn(),
  createBusiness: (...args: unknown[]) => mockCreateBusiness(...args),
  updateBusiness: (...args: unknown[]) => mockUpdateBusiness(...args),
  deleteBusiness: (...args: unknown[]) => mockDeleteBusiness(...args),
  switchBusiness: (...args: unknown[]) => mockSwitchBusiness(...args),
}))

// auth.store toca localStorage al hidratar — no necesitamos su lógica para estas pruebas.
vi.mock('@modules/auth/store/auth.store', () => ({
  useAuthStore: () => ({ business: null }),
}))

describe('Business Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('fetchAll carga la lista y autoselecciona el primero si no hay current', async () => {
    const items = [
      { id: 1, name: 'A', owner_user_id: 1 },
      { id: 2, name: 'B', owner_user_id: 1 },
    ]
    mockFetchBusinesses.mockResolvedValue(items)

    const { useBusinessStore } = await import('@modules/business/stores/businessStore')
    const store = useBusinessStore()

    await store.fetchAll()

    expect(store.businesses).toEqual(items)
    expect(store.currentBusiness?.id).toBe(1)
    expect(store.hasBusinesses).toBe(true)
    expect(store.error).toBeNull()
  })

  it('fetchAll captura error en store.error sin lanzar', async () => {
    mockFetchBusinesses.mockRejectedValue({
      response: { data: { message: 'boom' } },
    })

    const { useBusinessStore } = await import('@modules/business/stores/businessStore')
    const store = useBusinessStore()

    await store.fetchAll()

    expect(store.businesses).toEqual([])
    expect(store.error).toBe('boom')
  })

  it('create agrega el nuevo negocio y lo establece como current si era el primero', async () => {
    const created = { id: 10, name: 'Nuevo', owner_user_id: 1 }
    mockCreateBusiness.mockResolvedValue(created)

    const { useBusinessStore } = await import('@modules/business/stores/businessStore')
    const store = useBusinessStore()

    const result = await store.create({ name: 'Nuevo' })

    expect(result).toEqual(created)
    expect(store.businesses).toContainEqual(created)
    expect(store.currentBusiness?.id).toBe(10)
  })

  it('update aplica los cambios en la lista y mantiene current sincronizado', async () => {
    const initial = { id: 1, name: 'Viejo', owner_user_id: 1 }
    mockFetchBusinesses.mockResolvedValue([initial])
    mockUpdateBusiness.mockResolvedValue({ id: 1, name: 'Nuevo', owner_user_id: 1 })

    const { useBusinessStore } = await import('@modules/business/stores/businessStore')
    const store = useBusinessStore()
    await store.fetchAll()

    await store.update(1, { name: 'Nuevo' })

    expect(store.businesses[0].name).toBe('Nuevo')
    expect(store.currentBusiness?.name).toBe('Nuevo')
  })

  it('remove elimina de la lista y reasigna current si era el activo', async () => {
    const items = [
      { id: 1, name: 'A', owner_user_id: 1 },
      { id: 2, name: 'B', owner_user_id: 1 },
    ]
    mockFetchBusinesses.mockResolvedValue(items)
    mockDeleteBusiness.mockResolvedValue(undefined)

    const { useBusinessStore } = await import('@modules/business/stores/businessStore')
    const store = useBusinessStore()
    await store.fetchAll()
    // current quedó en id=1 por autoselección.

    const ok = await store.remove(1)

    expect(ok).toBe(true)
    expect(store.businesses.map((b) => b.id)).toEqual([2])
    expect(store.currentBusiness?.id).toBe(2)
  })

  it('switchTo cambia el current y persiste en localStorage', async () => {
    const items = [
      { id: 1, name: 'A', owner_user_id: 1 },
      { id: 2, name: 'B', owner_user_id: 1 },
    ]
    mockFetchBusinesses.mockResolvedValue(items)
    mockSwitchBusiness.mockResolvedValue({
      business: items[1],
      current_business_id: 2,
    })

    const { useBusinessStore } = await import('@modules/business/stores/businessStore')
    const store = useBusinessStore()
    await store.fetchAll()

    const ok = await store.switchTo(2)

    expect(ok).toBe(true)
    expect(store.currentBusiness?.id).toBe(2)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'business',
      JSON.stringify(items[1])
    )
  })

  it('reset deja el store en estado inicial', async () => {
    const { useBusinessStore } = await import('@modules/business/stores/businessStore')
    const store = useBusinessStore()
    store.businesses.push({ id: 99, name: 'X' } as never)

    store.reset()

    expect(store.businesses).toEqual([])
    expect(store.currentBusiness).toBeNull()
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })
})
