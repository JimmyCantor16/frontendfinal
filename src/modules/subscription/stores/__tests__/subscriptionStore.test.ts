import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockPlanList = vi.fn()
const mockSubCurrent = vi.fn()
const mockSubCheckout = vi.fn()
const mockSubCancel = vi.fn()
const mockSubResume = vi.fn()

vi.mock('@modules/subscription/services/planService', () => ({
  list: () => mockPlanList(),
  get: vi.fn(),
}))

vi.mock('@modules/subscription/services/subscriptionService', () => ({
  current: () => mockSubCurrent(),
  checkout: (planId: number | string) => mockSubCheckout(planId),
  cancel: () => mockSubCancel(),
  resume: () => mockSubResume(),
}))

vi.mock('@core/utils/notify', () => ({
  notifyApiError: vi.fn(),
}))

describe('subscriptionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchPlans() loads plans into state', async () => {
    const plans = [
      { id: 1, name: 'Pro', slug: 'pro', price_cents: 1000, currency: 'usd', interval: 'month', stripe_price_id: 'p1', features: [], active: true },
    ]
    mockPlanList.mockResolvedValue(plans)

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const store = useSubscriptionStore()

    const result = await store.fetchPlans()

    expect(result).toEqual(plans)
    expect(store.plans).toEqual(plans)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchPlans() handles errors gracefully', async () => {
    mockPlanList.mockRejectedValue(new Error('Plans down'))

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const { notifyApiError } = await import('@core/utils/notify')
    const store = useSubscriptionStore()

    const result = await store.fetchPlans()

    expect(result).toEqual([])
    expect(store.plans).toEqual([])
    expect(store.error).toBeTruthy()
    expect(notifyApiError).toHaveBeenCalled()
  })

  it('fetchCurrent() loads current subscription', async () => {
    const sub = { id: 1, plan_id: 2, status: 'active' }
    mockSubCurrent.mockResolvedValue(sub)

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const store = useSubscriptionStore()

    const result = await store.fetchCurrent()

    expect(result).toEqual(sub)
    expect(store.currentSubscription).toEqual(sub)
    expect(store.currentPlanId).toBe(2)
    expect(store.hasActiveSubscription).toBe(true)
  })

  it('fetchCurrent() treats 404 as no subscription, not an error', async () => {
    const err = { response: { status: 404 } }
    mockSubCurrent.mockRejectedValue(err)

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const { notifyApiError } = await import('@core/utils/notify')
    const store = useSubscriptionStore()

    const result = await store.fetchCurrent()

    expect(result).toBeNull()
    expect(store.currentSubscription).toBeNull()
    expect(store.error).toBeNull()
    expect(notifyApiError).not.toHaveBeenCalled()
  })

  it('startCheckout() returns checkout url on success', async () => {
    mockSubCheckout.mockResolvedValue({ checkout_url: 'https://stripe.test/x' })

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const store = useSubscriptionStore()

    const url = await store.startCheckout(5)

    expect(mockSubCheckout).toHaveBeenCalledWith(5)
    expect(url).toBe('https://stripe.test/x')
  })

  it('startCheckout() returns null on error and records error message', async () => {
    mockSubCheckout.mockRejectedValue({ response: { data: { message: 'No payment method' } } })

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const store = useSubscriptionStore()

    const url = await store.startCheckout(5)

    expect(url).toBeNull()
    expect(store.error).toBe('No payment method')
  })

  it('cancel() updates subscription on success', async () => {
    mockSubCancel.mockResolvedValue({ id: 1, status: 'canceled', ends_at: '2026-06-01' })

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const store = useSubscriptionStore()

    const ok = await store.cancel()

    expect(ok).toBe(true)
    expect(store.currentSubscription?.status).toBe('canceled')
  })

  it('resume() updates subscription on success', async () => {
    mockSubResume.mockResolvedValue({ id: 1, status: 'active' })

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const store = useSubscriptionStore()

    const ok = await store.resume()

    expect(ok).toBe(true)
    expect(store.currentSubscription?.status).toBe('active')
    expect(store.hasActiveSubscription).toBe(true)
  })

  it('cancel() returns false and notifies on failure', async () => {
    mockSubCancel.mockRejectedValue(new Error('cancel failed'))

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const { notifyApiError } = await import('@core/utils/notify')
    const store = useSubscriptionStore()

    const ok = await store.cancel()

    expect(ok).toBe(false)
    expect(notifyApiError).toHaveBeenCalled()
  })

  it('reset() clears all state', async () => {
    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const store = useSubscriptionStore()
    store.plans = [{ id: 1, name: 'X', slug: 'x', price_cents: 0, currency: 'usd', interval: 'month', stripe_price_id: '', features: [], active: true }]
    store.currentSubscription = { id: 1, status: 'active' }
    store.error = 'boom'

    store.reset()

    expect(store.plans).toEqual([])
    expect(store.currentSubscription).toBeNull()
    expect(store.error).toBeNull()
  })

  it('currentPlanId() reads from plan.id when nested plan provided', async () => {
    mockSubCurrent.mockResolvedValue({
      id: 1,
      status: 'active',
      plan: { id: 42, name: 'Mega', slug: 'mega', price_cents: 100, currency: 'usd', interval: 'month', stripe_price_id: 'p', features: [], active: true },
    })

    const { useSubscriptionStore } = await import('@modules/subscription/stores/subscriptionStore')
    const store = useSubscriptionStore()

    await store.fetchCurrent()

    expect(store.currentPlanId).toBe(42)
  })
})
