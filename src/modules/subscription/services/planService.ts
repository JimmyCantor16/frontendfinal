import api from '@core/api/client'
import type { Plan } from '../types/subscription.types'

export async function list(): Promise<Plan[]> {
  const { data } = await api.get('/plans')
  return normalizePlans(data.data ?? data)
}

export async function get(id: number | string): Promise<Plan> {
  const { data } = await api.get(`/plans/${id}`)
  return normalizePlan(data.data ?? data)
}

function normalizePlan(raw: unknown): Plan {
  const r = (raw ?? {}) as Record<string, unknown>
  let features: string[] = []
  const rawFeatures = r.features
  if (Array.isArray(rawFeatures)) {
    features = rawFeatures.map((f) => String(f))
  } else if (typeof rawFeatures === 'string') {
    try {
      const parsed = JSON.parse(rawFeatures)
      if (Array.isArray(parsed)) features = parsed.map((f) => String(f))
    } catch {
      // ignore — leave empty
    }
  }
  return {
    id: r.id as number | string,
    name: String(r.name ?? ''),
    slug: String(r.slug ?? ''),
    price_cents: Number(r.price_cents ?? 0),
    currency: String(r.currency ?? 'USD'),
    interval: String(r.interval ?? 'month'),
    stripe_price_id: String(r.stripe_price_id ?? ''),
    features,
    active: Boolean(r.active ?? true),
  }
}

function normalizePlans(raw: unknown): Plan[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizePlan)
}

export default { list, get }
