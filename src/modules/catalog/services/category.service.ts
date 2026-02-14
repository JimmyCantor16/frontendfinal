import api from '@core/api/client'
import type { Category } from '@core/types/models'

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return data.data ?? data
}
