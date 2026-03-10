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

describe('Cash Register Service', () => {
  let api: any

  beforeEach(async () => {
    vi.clearAllMocks()
    api = (await import('@core/api/client')).default
  })

  describe('fetchCurrentCashRegister', () => {
    it('returns the current register from data.data', async () => {
      const register = { id: 1, opening_amount: 50000, status: 'open' }
      api.get.mockResolvedValue({ data: { data: register } })

      const { fetchCurrentCashRegister } = await import(
        '@modules/cash-register/services/cash-register.service'
      )
      const result = await fetchCurrentCashRegister()

      expect(api.get).toHaveBeenCalledWith('/cash-registers/current')
      expect(result).toEqual(register)
    })

    it('returns null on 404 response', async () => {
      api.get.mockRejectedValue({ response: { status: 404 } })

      const { fetchCurrentCashRegister } = await import(
        '@modules/cash-register/services/cash-register.service'
      )
      const result = await fetchCurrentCashRegister()

      expect(result).toBeNull()
    })

    it('throws on non-404 errors', async () => {
      const error = { response: { status: 500 }, message: 'Server Error' }
      api.get.mockRejectedValue(error)

      const { fetchCurrentCashRegister } = await import(
        '@modules/cash-register/services/cash-register.service'
      )

      await expect(fetchCurrentCashRegister()).rejects.toEqual(error)
    })
  })

  describe('openCashRegister', () => {
    it('sends POST with opening_amount and returns register', async () => {
      const register = { id: 2, opening_amount: 100000, status: 'open' }
      api.post.mockResolvedValue({ data: { data: register } })

      const { openCashRegister } = await import(
        '@modules/cash-register/services/cash-register.service'
      )
      const result = await openCashRegister({ opening_amount: 100000 })

      expect(api.post).toHaveBeenCalledWith('/cash-registers/open', {
        opening_amount: 100000,
      })
      expect(result).toEqual(register)
    })
  })

  describe('closeCashRegister', () => {
    it('sends POST with closing_amount and notes, returns register', async () => {
      const register = {
        id: 2,
        opening_amount: 100000,
        closing_amount: 150000,
        status: 'closed',
      }
      api.post.mockResolvedValue({ data: { data: register } })

      const { closeCashRegister } = await import(
        '@modules/cash-register/services/cash-register.service'
      )
      const result = await closeCashRegister(2, {
        closing_amount: 150000,
        notes: 'Cierre normal',
      })

      expect(api.post).toHaveBeenCalledWith('/cash-registers/2/close', {
        closing_amount: 150000,
        notes: 'Cierre normal',
      })
      expect(result).toEqual(register)
    })
  })
})
