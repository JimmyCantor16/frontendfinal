import api from '@core/api/client'
import type { User } from '@core/types/models'

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get('/users')
  return data.data ?? data
}
