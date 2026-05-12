// Módulo Business — onboarding y administración multi-tenant.
export { default as routes } from './routes'
export { useBusinessStore } from './stores/businessStore'
export * as businessService from './services/business.service'
export type {
  BusinessRecord,
  BusinessCreatePayload,
  BusinessUpdatePayload,
} from './types/business.types'
