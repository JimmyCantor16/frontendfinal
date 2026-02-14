// Servicio del dominio Subscription — stub para futuro billing.
// Endpoints futuros: GET /subscription, POST /subscription/change-plan, etc.

import api from '@core/api/client'
import type { SubscriptionInfo } from '../types/subscription.types'

export async function fetchSubscription(): Promise<SubscriptionInfo> {
  const { data } = await api.get('/subscription')
  return data.data ?? data
}
