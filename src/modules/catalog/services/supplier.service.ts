import api from '@core/api/client'
import type { Supplier } from '@core/types/models'

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get('/suppliers')
  return data.data ?? data
}
