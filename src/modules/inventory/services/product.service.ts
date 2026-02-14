import api from '@core/api/client'
import type { Product } from '@core/types/models'

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/products')
  return data.data ?? data
}
