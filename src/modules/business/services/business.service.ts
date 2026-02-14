// Servicio del dominio Business — stub para futuro onboarding/multi-tenant.
// Endpoints futuros: POST /businesses, GET /businesses/:id/members, etc.

import api from '@core/api/client'
import type { Business } from '@core/types/models'

export async function fetchBusiness(): Promise<Business> {
  const { data } = await api.get('/business')
  return data.data ?? data
}
