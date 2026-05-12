// Tipos del dominio Business para onboarding y multi-tenant.
// La interfaz `Business` (lectura) vive en `@core/types/models`.
// Este archivo aporta los payloads de escritura y la respuesta de `switch`.

import type { Business } from '@core/types/models'

export interface BusinessRecord extends Business {
  // Campos adicionales del backend Jamz expuestos por /api/businesses.
  tax_id?: string | null
  owner_user_id?: number
}

export interface BusinessCreatePayload {
  name: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  logo_url?: string
}

export type BusinessUpdatePayload = Partial<BusinessCreatePayload>

export interface BusinessSwitchResponse {
  business: BusinessRecord
  current_business_id: number
}
