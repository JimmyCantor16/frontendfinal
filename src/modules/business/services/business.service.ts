// Servicio del dominio Business — multi-tenant CRUD + switch contra el backend Jamz.
// Endpoints expuestos por el backend Laravel:
//   GET    /businesses          -> lista los negocios del usuario autenticado
//   POST   /businesses          -> onboarding (crea negocio, owner = usuario actual)
//   GET    /businesses/{id}     -> detalle
//   PUT    /businesses/{id}     -> actualización (solo owner)
//   DELETE /businesses/{id}     -> soft delete (solo owner)
//   POST   /businesses/{id}/switch -> cambia current_business_id del usuario

import api from '@core/api/client'
import type {
  BusinessRecord,
  BusinessCreatePayload,
  BusinessUpdatePayload,
  BusinessSwitchResponse,
} from '../types/business.types'

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return ((payload as Record<string, unknown>).data ?? payload) as T
  }
  return payload as T
}

export async function fetchBusinesses(): Promise<BusinessRecord[]> {
  const { data } = await api.get('/businesses')
  const list = unwrap<BusinessRecord[] | BusinessRecord>(data)
  return Array.isArray(list) ? list : []
}

export async function fetchBusiness(id: number): Promise<BusinessRecord> {
  const { data } = await api.get(`/businesses/${id}`)
  return unwrap<BusinessRecord>(data)
}

export async function createBusiness(payload: BusinessCreatePayload): Promise<BusinessRecord> {
  const { data } = await api.post('/businesses', payload)
  return unwrap<BusinessRecord>(data)
}

export async function updateBusiness(
  id: number,
  payload: BusinessUpdatePayload
): Promise<BusinessRecord> {
  const { data } = await api.put(`/businesses/${id}`, payload)
  return unwrap<BusinessRecord>(data)
}

export async function deleteBusiness(id: number): Promise<void> {
  await api.delete(`/businesses/${id}`)
}

export async function switchBusiness(id: number): Promise<BusinessSwitchResponse> {
  const { data } = await api.post(`/businesses/${id}/switch`)
  // El backend puede devolver { data: { business, current_business_id } } o el objeto plano.
  return unwrap<BusinessSwitchResponse>(data)
}
