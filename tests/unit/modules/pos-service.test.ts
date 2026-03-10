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

describe('POS Service', () => {
  let api: any

  beforeEach(async () => {
    vi.clearAllMocks()
    api = (await import('@core/api/client')).default
  })

  it('fetchOpenOrders returns orders from data.data', async () => {
    const orders = [
      { id: 1, status: 'open', items: [] },
      { id: 2, status: 'open', items: [] },
    ]
    api.get.mockResolvedValue({ data: { data: orders } })

    const { fetchOpenOrders } = await import(
      '@modules/pos/services/pos.service'
    )
    const result = await fetchOpenOrders()

    expect(api.get).toHaveBeenCalledWith('/orders/open')
    expect(result).toEqual(orders)
  })

  it('fetchOpenOrders returns orders from data when data.data is undefined', async () => {
    const orders = [{ id: 1, status: 'open', items: [] }]
    api.get.mockResolvedValue({ data: orders })

    const { fetchOpenOrders } = await import(
      '@modules/pos/services/pos.service'
    )
    const result = await fetchOpenOrders()

    expect(result).toEqual(orders)
  })

  it('createOrder sends POST /orders and returns new order', async () => {
    const newOrder = { id: 3, status: 'open', items: [] }
    api.post.mockResolvedValue({ data: { data: newOrder } })

    const { createOrder } = await import(
      '@modules/pos/services/pos.service'
    )
    const result = await createOrder()

    expect(api.post).toHaveBeenCalledWith('/orders')
    expect(result).toEqual(newOrder)
  })

  it('addItem sends POST with product_id and quantity', async () => {
    api.post.mockResolvedValue({ data: {} })

    const { addItem } = await import('@modules/pos/services/pos.service')
    await addItem(5, { product_id: 10, quantity: 3 })

    expect(api.post).toHaveBeenCalledWith('/orders/5/add-item', {
      product_id: 10,
      quantity: 3,
    })
  })

  it('removeItem sends DELETE with orderId and itemId', async () => {
    api.delete.mockResolvedValue({ data: {} })

    const { removeItem } = await import('@modules/pos/services/pos.service')
    await removeItem(5, 12)

    expect(api.delete).toHaveBeenCalledWith('/orders/5/remove-item/12')
  })

  it('closeOrder sends POST with payment payload', async () => {
    api.post.mockResolvedValue({ data: {} })

    const { closeOrder } = await import('@modules/pos/services/pos.service')
    await closeOrder(5, { payment_method: 'cash', client_id: 1 })

    expect(api.post).toHaveBeenCalledWith('/orders/5/close', {
      payment_method: 'cash',
      client_id: 1,
    })
  })

  it('cancelOrder sends POST with cancel reason', async () => {
    api.post.mockResolvedValue({ data: {} })

    const { cancelOrder } = await import('@modules/pos/services/pos.service')
    await cancelOrder(5, 'Cliente cambio de opinion')

    expect(api.post).toHaveBeenCalledWith('/orders/5/cancel', {
      cancel_reason: 'Cliente cambio de opinion',
    })
  })

  it('cancelOrder sends POST without body when no reason provided', async () => {
    api.post.mockResolvedValue({ data: {} })

    const { cancelOrder } = await import('@modules/pos/services/pos.service')
    await cancelOrder(5)

    expect(api.post).toHaveBeenCalledWith('/orders/5/cancel', undefined)
  })
})
