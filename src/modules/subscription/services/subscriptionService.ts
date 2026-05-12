import api from '@core/api/client'
import type { Subscription, CheckoutResponse } from '../types/subscription.types'

export async function current(): Promise<Subscription | null> {
  const { data } = await api.get('/subscriptions/current')
  // Handle Laravel-style wrappers: { data: <payload> } or bare payload.
  // When `data.data` is explicitly null, treat that as "no subscription".
  const hasWrapper = data && typeof data === 'object' && 'data' in data
  const payload = hasWrapper ? data.data : data
  if (payload === null || payload === undefined) return null
  if (typeof payload === 'object' && !Array.isArray(payload) && Object.keys(payload).length === 0) {
    return null
  }
  return payload as Subscription
}

export async function checkout(planId: number | string): Promise<CheckoutResponse> {
  const { data } = await api.post('/subscriptions/checkout', { plan_id: planId })
  const payload = data?.data ?? data
  return { checkout_url: String(payload.checkout_url ?? '') }
}

export async function cancel(): Promise<Subscription | null> {
  const { data } = await api.post('/subscriptions/cancel')
  const payload = data?.data ?? data
  return (payload ?? null) as Subscription | null
}

export async function resume(): Promise<Subscription | null> {
  const { data } = await api.post('/subscriptions/resume')
  const payload = data?.data ?? data
  return (payload ?? null) as Subscription | null
}

export default { current, checkout, cancel, resume }
