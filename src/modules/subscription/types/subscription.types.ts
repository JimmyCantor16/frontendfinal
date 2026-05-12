// Tipos del dominio Subscription — alineados con backend Laravel + Stripe Cashier.

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'unpaid'

export type BillingInterval = 'day' | 'week' | 'month' | 'year'

export interface Plan {
  id: number | string
  name: string
  slug: string
  price_cents: number
  currency: string
  interval: BillingInterval | string
  stripe_price_id: string
  features: string[]
  active: boolean
}

export interface Subscription {
  id: number | string
  plan_id?: number | string
  plan?: Plan
  status: SubscriptionStatus | string
  current_period_end?: string | null
  trial_ends_at?: string | null
  ends_at?: string | null
  cancel_at_period_end?: boolean
  stripe_id?: string
  stripe_status?: string
  stripe_price?: string
}

export interface CheckoutResponse {
  checkout_url: string
}

export interface CheckoutPayload {
  plan_id: number | string
}
