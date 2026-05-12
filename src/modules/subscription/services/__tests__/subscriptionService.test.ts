import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

describe('subscriptionService', () => {
  let api: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }

  beforeEach(async () => {
    vi.clearAllMocks()
    api = (await import('@core/api/client')).default as unknown as typeof api
  })

  it('current() returns subscription from data.data', async () => {
    const subscription = {
      id: 1,
      plan_id: 2,
      status: 'active',
      current_period_end: '2026-06-01',
    }
    api.get.mockResolvedValue({ data: { data: subscription } })

    const { current } = await import('@modules/subscription/services/subscriptionService')
    const result = await current()

    expect(api.get).toHaveBeenCalledWith('/subscriptions/current')
    expect(result).toEqual(subscription)
  })

  it('current() returns null when payload is empty object', async () => {
    api.get.mockResolvedValue({ data: { data: {} } })

    const { current } = await import('@modules/subscription/services/subscriptionService')
    const result = await current()

    expect(result).toBeNull()
  })

  it('current() returns null when payload is null', async () => {
    api.get.mockResolvedValue({ data: { data: null } })

    const { current } = await import('@modules/subscription/services/subscriptionService')
    const result = await current()

    expect(result).toBeNull()
  })

  it('checkout() posts plan_id and returns checkout_url', async () => {
    api.post.mockResolvedValue({
      data: { data: { checkout_url: 'https://checkout.stripe.com/abc' } },
    })

    const { checkout } = await import('@modules/subscription/services/subscriptionService')
    const result = await checkout(7)

    expect(api.post).toHaveBeenCalledWith('/subscriptions/checkout', { plan_id: 7 })
    expect(result.checkout_url).toBe('https://checkout.stripe.com/abc')
  })

  it('checkout() falls back to data when data.data absent', async () => {
    api.post.mockResolvedValue({
      data: { checkout_url: 'https://checkout.stripe.com/xyz' },
    })

    const { checkout } = await import('@modules/subscription/services/subscriptionService')
    const result = await checkout('plan-slug')

    expect(result.checkout_url).toBe('https://checkout.stripe.com/xyz')
  })

  it('cancel() posts to /subscriptions/cancel and returns updated subscription', async () => {
    const updated = { id: 1, status: 'canceled', ends_at: '2026-06-01' }
    api.post.mockResolvedValue({ data: { data: updated } })

    const { cancel } = await import('@modules/subscription/services/subscriptionService')
    const result = await cancel()

    expect(api.post).toHaveBeenCalledWith('/subscriptions/cancel')
    expect(result).toEqual(updated)
  })

  it('resume() posts to /subscriptions/resume and returns updated subscription', async () => {
    const updated = { id: 1, status: 'active' }
    api.post.mockResolvedValue({ data: { data: updated } })

    const { resume } = await import('@modules/subscription/services/subscriptionService')
    const result = await resume()

    expect(api.post).toHaveBeenCalledWith('/subscriptions/resume')
    expect(result).toEqual(updated)
  })

  it('current() propagates API errors', async () => {
    api.get.mockRejectedValue(new Error('boom'))

    const { current } = await import('@modules/subscription/services/subscriptionService')
    await expect(current()).rejects.toThrow('boom')
  })
})
