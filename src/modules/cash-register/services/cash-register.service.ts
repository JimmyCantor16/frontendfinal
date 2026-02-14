import api from '@core/api/client'
import type { CashRegister } from '@core/types/models'
import type { OpenCashRegisterPayload, CloseCashRegisterPayload } from '../types/cash-register.types'

export async function fetchCurrentCashRegister(): Promise<CashRegister | null> {
  try {
    const { data } = await api.get('/cash-registers/current')
    return data.data ?? data ?? null
  } catch (err: unknown) {
    if ((err as any)?.response?.status === 404) return null
    throw err
  }
}

export async function openCashRegister(payload: OpenCashRegisterPayload): Promise<CashRegister> {
  const { data } = await api.post('/cash-registers/open', payload)
  return data.data ?? data
}

export async function closeCashRegister(id: number, payload: CloseCashRegisterPayload): Promise<CashRegister> {
  const { data } = await api.post(`/cash-registers/${id}/close`, payload)
  return data.data ?? data
}
