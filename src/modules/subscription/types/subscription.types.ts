// Tipos del dominio Subscription para futuro billing y manejo de planes.

export interface Plan {
  id: string
  name: string
  tier: 'free' | 'starter' | 'pro' | 'enterprise'
  price_monthly: number
  price_yearly: number
  features: string[]
}

export interface SubscriptionInfo {
  plan: Plan
  status: 'active' | 'trial' | 'past_due' | 'cancelled'
  current_period_end: string
  cancel_at_period_end: boolean
}

export interface ChangePlanPayload {
  plan_id: string
  billing_period: 'monthly' | 'yearly'
}
