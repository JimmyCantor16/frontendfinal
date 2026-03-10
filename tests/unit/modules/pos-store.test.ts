import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock POS service
const mockFetchOpenOrders = vi.fn().mockResolvedValue([])
const mockCreateOrder = vi.fn().mockResolvedValue({ id: 1, order_number: 'ORD-001', status: 'open', items: [], total: 0 })
const mockAddItem = vi.fn().mockResolvedValue(undefined)
const mockRemoveItem = vi.fn().mockResolvedValue(undefined)
const mockCloseOrder = vi.fn().mockResolvedValue(undefined)
const mockCancelOrder = vi.fn().mockResolvedValue(undefined)

vi.mock('@modules/pos/services/pos.service', () => ({
  fetchOpenOrders: () => mockFetchOpenOrders(),
  createOrder: () => mockCreateOrder(),
  addItem: (...args: unknown[]) => mockAddItem(...args),
  removeItem: (...args: unknown[]) => mockRemoveItem(...args),
  closeOrder: (...args: unknown[]) => mockCloseOrder(...args),
  cancelOrder: (...args: unknown[]) => mockCancelOrder(...args),
}))

// Mock inventory store
vi.mock('@modules/inventory/store/inventory.store', () => ({
  useInventoryStore: () => ({
    loadProducts: vi.fn().mockResolvedValue(undefined),
    products: [],
    categories: [],
  }),
}))

// Mock cash register store
vi.mock('@modules/cash-register/store/cash-register.store', () => ({
  useCashRegisterStore: () => ({
    isOpen: true,
    loadCurrent: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock notify
vi.mock('@core/utils/notify', () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  notifyApiError: vi.fn(),
}))

describe('POS Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockFetchOpenOrders.mockResolvedValue([])
  })

  it('should start with empty state', async () => {
    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    expect(store.openOrders).toEqual([])
    expect(store.activeOrderId).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.creatingOrder).toBe(false)
    expect(store.lastClosedSale).toBeNull()
    expect(store.cartItems).toEqual([])
    expect(store.cartTotal).toBe(0)
  })

  it('should load open orders', async () => {
    const orders = [
      { id: 1, order_number: 'ORD-001', status: 'open', items: [], total: 0 },
      { id: 2, order_number: 'ORD-002', status: 'open', items: [], total: 0 },
    ]
    mockFetchOpenOrders.mockResolvedValue(orders)

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    await store.loadOpenOrders()

    expect(store.openOrders).toEqual(orders)
    expect(store.activeOrderId).toBe(1)
    expect(store.loading).toBe(false)
  })

  it('should handle loadOpenOrders error with notification', async () => {
    mockFetchOpenOrders.mockRejectedValue(new Error('Network error'))

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const { notifyError } = await import('@core/utils/notify')
    const store = usePosStore()

    await expect(store.loadOpenOrders()).rejects.toThrow('Network error')
    expect(notifyError).toHaveBeenCalledWith('Error', 'No se pudieron cargar las órdenes abiertas')
    expect(store.loading).toBe(false)
  })

  it('should create a new order', async () => {
    mockFetchOpenOrders.mockResolvedValue([
      { id: 1, order_number: 'ORD-001', status: 'open', items: [], total: 0 },
    ])

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    await store.createOrder()

    expect(mockCreateOrder).toHaveBeenCalled()
    expect(store.activeOrderId).toBe(1)
    expect(store.hasUsedPos).toBe(true)
    expect(store.creatingOrder).toBe(false)
  })

  it('should handle createOrder error with notification', async () => {
    mockCreateOrder.mockRejectedValueOnce(new Error('Server error'))

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const { notifyError } = await import('@core/utils/notify')
    const store = usePosStore()

    await expect(store.createOrder()).rejects.toThrow('Server error')
    expect(notifyError).toHaveBeenCalledWith('Error', 'No se pudo crear la orden')
    expect(store.creatingOrder).toBe(false)
  })

  it('should prevent duplicate order creation', async () => {
    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    // Simulate creatingOrder already true
    store.creatingOrder = true
    await store.createOrder()

    expect(mockCreateOrder).not.toHaveBeenCalled()
  })

  it('should reject addProduct when no active order', async () => {
    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const { notifyError } = await import('@core/utils/notify')
    const store = usePosStore()

    const product = { id: 1, name: 'Test', stock: 10, sale_price: 100 } as any
    await store.addProduct(product)

    expect(notifyError).toHaveBeenCalledWith('Sin orden', expect.any(String))
    expect(mockAddItem).not.toHaveBeenCalled()
  })

  it('should reject addProduct when product has no stock', async () => {
    mockFetchOpenOrders.mockResolvedValue([
      { id: 1, order_number: 'ORD-001', status: 'open', items: [], total: 0 },
    ])

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const { notifyError } = await import('@core/utils/notify')
    const store = usePosStore()

    await store.loadOpenOrders()

    const product = { id: 1, name: 'Sin Stock', stock: 0, sale_price: 100 } as any
    await store.addProduct(product)

    expect(notifyError).toHaveBeenCalledWith('Sin stock', expect.any(String))
    expect(mockAddItem).not.toHaveBeenCalled()
  })

  it('should throw error when closing order without open cash register', async () => {
    // Override cash register to be closed
    vi.doMock('@modules/cash-register/store/cash-register.store', () => ({
      useCashRegisterStore: () => ({ isOpen: false, loadCurrent: vi.fn() }),
    }))

    vi.resetModules()

    // Re-mock other dependencies
    vi.doMock('@modules/pos/services/pos.service', () => ({
      fetchOpenOrders: () => mockFetchOpenOrders(),
      createOrder: () => mockCreateOrder(),
      addItem: (...args: unknown[]) => mockAddItem(...args),
      removeItem: (...args: unknown[]) => mockRemoveItem(...args),
      closeOrder: (...args: unknown[]) => mockCloseOrder(...args),
      cancelOrder: (...args: unknown[]) => mockCancelOrder(...args),
    }))
    vi.doMock('@modules/inventory/store/inventory.store', () => ({
      useInventoryStore: () => ({ loadProducts: vi.fn(), products: [], categories: [] }),
    }))
    vi.doMock('@core/utils/notify', () => ({
      notifyError: vi.fn(),
      notifySuccess: vi.fn(),
      notifyApiError: vi.fn(),
    }))

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()
    store.activeOrderId = 1

    await expect(store.closeOrder('cash')).rejects.toThrow('No hay caja abierta')
    expect(mockCloseOrder).not.toHaveBeenCalled()
  })

  it('should compute cartTotal correctly with numbers', async () => {
    mockFetchOpenOrders.mockResolvedValue([
      {
        id: 1, order_number: 'ORD-001', status: 'open', total: 300,
        items: [
          { id: 1, order_id: 1, product_id: 1, quantity: 2, unit_price: 100, subtotal: 200 },
          { id: 2, order_id: 1, product_id: 2, quantity: 1, unit_price: 100, subtotal: 100 },
        ],
      },
    ])

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    await store.loadOpenOrders()

    expect(store.cartTotal).toBe(300)
  })

  it('should compute cartTotal correctly with string subtotals', async () => {
    mockFetchOpenOrders.mockResolvedValue([
      {
        id: 1, order_number: 'ORD-001', status: 'open', total: 500,
        items: [
          { id: 1, order_id: 1, product_id: 1, quantity: 1, unit_price: 250, subtotal: '250.00' },
          { id: 2, order_id: 1, product_id: 2, quantity: 1, unit_price: 250, subtotal: '250,00' },
        ],
      },
    ])

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    await store.loadOpenOrders()

    expect(store.cartTotal).toBe(500)
  })

  it('should compute orderTabs from open orders', async () => {
    mockFetchOpenOrders.mockResolvedValue([
      { id: 1, order_number: 'ORD-001', status: 'open', items: [], total: 0 },
      { id: 2, order_number: 'ORD-002', status: 'open', items: [], total: 0 },
    ])

    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    await store.loadOpenOrders()

    expect(store.orderTabs).toHaveLength(2)
    expect(store.orderTabs[0]).toEqual({ id: 1, label: 'ORD-001', active: true })
    expect(store.orderTabs[1]).toEqual({ id: 2, label: 'ORD-002', active: false })
  })

  it('should switch active order with selectOrder', async () => {
    mockFetchOpenOrders.mockResolvedValue([
      { id: 3, order_number: 'ORD-003', status: 'open', items: [] },
      { id: 5, order_number: 'ORD-005', status: 'open', items: [] },
    ])
    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    await store.loadOpenOrders()
    store.selectOrder(5)
    expect(store.activeOrderId).toBe(5)

    // Should not change if orderId doesn't exist
    store.selectOrder(999)
    expect(store.activeOrderId).toBe(5)
  })

  it('should reset all state with $fullReset', async () => {
    const { usePosStore } = await import('@modules/pos/store/pos.store')
    const store = usePosStore()

    store.hasUsedPos = true
    store.activeOrderId = 5
    store.$fullReset()

    expect(store.openOrders).toEqual([])
    expect(store.activeOrderId).toBeNull()
    expect(store.hasUsedPos).toBe(false)
    expect(store.lastClosedSale).toBeNull()
  })
})
