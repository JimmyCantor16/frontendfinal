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

describe('planService', () => {
  let api: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }

  beforeEach(async () => {
    vi.clearAllMocks()
    api = (await import('@core/api/client')).default as unknown as typeof api
  })

  it('list() returns normalized plans from data.data', async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            name: 'Pro',
            slug: 'pro',
            price_cents: 1999,
            currency: 'usd',
            interval: 'month',
            stripe_price_id: 'price_123',
            features: ['Feature A', 'Feature B'],
            active: true,
          },
        ],
      },
    })

    const { list } = await import('@modules/subscription/services/planService')
    const plans = await list()

    expect(api.get).toHaveBeenCalledWith('/plans')
    expect(plans).toHaveLength(1)
    expect(plans[0]).toMatchObject({
      id: 1,
      name: 'Pro',
      slug: 'pro',
      price_cents: 1999,
      currency: 'usd',
      stripe_price_id: 'price_123',
      features: ['Feature A', 'Feature B'],
      active: true,
    })
  })

  it('list() falls back to data when data.data absent', async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 2,
          name: 'Free',
          slug: 'free',
          price_cents: 0,
          currency: 'usd',
          interval: 'month',
          stripe_price_id: '',
          features: [],
          active: true,
        },
      ],
    })

    const { list } = await import('@modules/subscription/services/planService')
    const plans = await list()

    expect(plans).toHaveLength(1)
    expect(plans[0].name).toBe('Free')
  })

  it('list() parses features when delivered as JSON string', async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 3,
            name: 'Starter',
            slug: 'starter',
            price_cents: 999,
            currency: 'USD',
            interval: 'month',
            stripe_price_id: 'price_999',
            features: '["F1","F2","F3"]',
            active: true,
          },
        ],
      },
    })

    const { list } = await import('@modules/subscription/services/planService')
    const plans = await list()

    expect(plans[0].features).toEqual(['F1', 'F2', 'F3'])
  })

  it('list() returns empty array when payload is not an array', async () => {
    api.get.mockResolvedValue({ data: { data: null } })

    const { list } = await import('@modules/subscription/services/planService')
    const plans = await list()

    expect(plans).toEqual([])
  })

  it('get() fetches single plan by id', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          id: 5,
          name: 'Enterprise',
          slug: 'enterprise',
          price_cents: 9999,
          currency: 'usd',
          interval: 'year',
          stripe_price_id: 'price_ent',
          features: ['Everything'],
          active: true,
        },
      },
    })

    const { get } = await import('@modules/subscription/services/planService')
    const plan = await get(5)

    expect(api.get).toHaveBeenCalledWith('/plans/5')
    expect(plan.id).toBe(5)
    expect(plan.name).toBe('Enterprise')
  })

  it('list() propagates API errors', async () => {
    api.get.mockRejectedValue(new Error('Network down'))

    const { list } = await import('@modules/subscription/services/planService')
    await expect(list()).rejects.toThrow('Network down')
  })
})
