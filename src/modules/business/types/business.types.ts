// Tipos del dominio Business para futura lógica de onboarding y multi-tenant.
// Por ahora la interfaz principal Business está en core/types/models.ts.
// Este archivo crecerá con: BusinessCreatePayload, BusinessInvitation, BusinessMember, etc.

export interface BusinessCreatePayload {
  name: string
  slug?: string
  address?: string
  phone?: string
  email?: string
  nit?: string
}
