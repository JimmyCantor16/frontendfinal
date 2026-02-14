import api from '@core/api/client'
import type { Client } from '@core/types/models'

export async function fetchClients(): Promise<Client[]> {
  const { data } = await api.get('/clients')
  return data.data ?? data
}
