import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockFetchCurrent = vi.fn()
const mockOpen = vi.fn()
const mockClose = vi.fn()

vi.mock('@modules/cash-register/services/cash-register.service', () => ({
  fetchCurrentCashRegister: () => mockFetchCurrent(),
  openCashRegister: (data: unknown) => mockOpen(data),
  closeCashRegister: (id: number, data: unknown) => mockClose(id, data),
}))

vi.mock('@core/utils/notify', () => ({
  notifyApiError: vi.fn(),
  notifySuccess: vi.fn(),
}))

describe('Cash Register Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should start with null current register', async () => {
    const { useCashRegisterStore } = await import('@modules/cash-register/store/cash-register.store')
    const store = useCashRegisterStore()

    expect(store.current).toBeNull()
    expect(store.isOpen).toBe(false)
  })

  it('should load current register', async () => {
    const register = { id: 1, status: 'open', opening_amount: 50000 }
    mockFetchCurrent.mockResolvedValue(register)

    const { useCashRegisterStore } = await import('@modules/cash-register/store/cash-register.store')
    const store = useCashRegisterStore()

    await store.loadCurrent()

    expect(store.current).toEqual(register)
    expect(store.isOpen).toBe(true)
  })

  it('should handle null (no open register)', async () => {
    mockFetchCurrent.mockResolvedValue(null)

    const { useCashRegisterStore } = await import('@modules/cash-register/store/cash-register.store')
    const store = useCashRegisterStore()

    await store.loadCurrent()

    expect(store.current).toBeNull()
    expect(store.isOpen).toBe(false)
  })

  it('should open a cash register', async () => {
    const newRegister = { id: 2, status: 'open', opening_amount: 100000 }
    mockOpen.mockResolvedValue(newRegister)

    const { useCashRegisterStore } = await import('@modules/cash-register/store/cash-register.store')
    const store = useCashRegisterStore()

    await store.openRegister({ opening_amount: 100000 })

    expect(mockOpen).toHaveBeenCalledWith({ opening_amount: 100000 })
    expect(store.current).toEqual(newRegister)
  })

  it('should not close register if no current register exists', async () => {
    const { useCashRegisterStore } = await import('@modules/cash-register/store/cash-register.store')
    const store = useCashRegisterStore()

    await store.closeRegister({})

    expect(mockClose).not.toHaveBeenCalled()
  })
})
