/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, config } from '@vue/test-utils'

const {
  fetchOpenOrdersSpy,
  createOrderSpy,
  addItemSpy,
  removeItemSpy,
  closeOrderSpy,
  cancelOrderSpy,
  loadProductsSpy,
  loadCategoriesSpy,
  loadAllSpy,
  loadCurrentCrSpy,
} = vi.hoisted(() => ({
  fetchOpenOrdersSpy: vi.fn(),
  createOrderSpy: vi.fn(),
  addItemSpy: vi.fn(),
  removeItemSpy: vi.fn(),
  closeOrderSpy: vi.fn(),
  cancelOrderSpy: vi.fn(),
  loadProductsSpy: vi.fn(),
  loadCategoriesSpy: vi.fn(),
  loadAllSpy: vi.fn(),
  loadCurrentCrSpy: vi.fn(),
}))

// --- POS service mock ---
vi.mock('@modules/pos/services/pos.service', () => ({
  fetchOpenOrders: (...args: unknown[]) => fetchOpenOrdersSpy(...args),
  createOrder: (...args: unknown[]) => createOrderSpy(...args),
  addItem: (...args: unknown[]) => addItemSpy(...args),
  removeItem: (...args: unknown[]) => removeItemSpy(...args),
  closeOrder: (...args: unknown[]) => closeOrderSpy(...args),
  cancelOrder: (...args: unknown[]) => cancelOrderSpy(...args),
}))

// --- API client (used directly by inventory.store.loadCategories) ---
vi.mock('@core/api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

// --- Inventory service ---
vi.mock('@modules/inventory/services/product.service', () => ({
  fetchProducts: (...args: unknown[]) => loadProductsSpy(...args),
}))

// --- Cash register store mock (PosView reads `crStore.loading`) ---
vi.mock('@modules/cash-register/store/cash-register.store', () => ({
  useCashRegisterStore: () => ({
    isOpen: true,
    loading: false,
    loadCurrent: (...args: unknown[]) => loadCurrentCrSpy(...args),
  }),
}))

// --- Notify (avoid sweetalert) ---
vi.mock('@core/utils/notify', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyApiError: vi.fn(),
}))

// --- useAuthGate composable (admin role => no password prompt) ---
vi.mock('@core/composables/useAuthGate', () => ({
  useAuthGate: () => ({ requirePassword: vi.fn().mockResolvedValue(true) }),
}))

// Stubs for Vuetify + POS child components.
const stubs = {
  'v-chip': { template: '<span class="v-chip"><slot /></span>' },
  'v-banner': { template: '<div class="v-banner"><slot /></div>' },
  'v-btn': {
    props: ['loading', 'disabled'],
    template:
      '<button :disabled="loading || disabled" @click="$emit(\'click\', $event)"><slot /></button>',
  },
  'v-icon': { template: '<i><slot /></i>' },
  'v-card': { template: '<div class="v-card"><slot /></div>' },
  'v-progress-circular': { template: '<div class="loader" />' },
  'v-timeline': { template: '<div><slot /></div>' },
  'v-timeline-item': { template: '<div><slot /></div>' },
  'v-dialog': { template: '<div><slot /></div>' },
  PosOrderTabs: {
    template:
      '<div class="pos-order-tabs"><slot name="append" /></div>',
  },
  PosCategoryTabs: { template: '<div class="pos-category-tabs" />' },
  PosProductCard: {
    props: ['product'],
    template:
      '<div class="pos-product-card" :data-id="product?.id" @click="$emit(\'add\', product)">{{ product?.name }}</div>',
    emits: ['add'],
  },
  PosCartPanel: {
    template:
      '<div class="pos-cart-panel"><button class="pay-btn" @click="$emit(\'open-payment\')">pay</button></div>',
    emits: ['open-payment'],
  },
  PosPaymentDialog: {
    props: ['modelValue', 'total'],
    template: '<div class="pos-payment-dialog" :data-open="modelValue" />',
  },
}

describe('PosView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.global.stubs = stubs

    // Default: backend returns no open orders.
    fetchOpenOrdersSpy.mockResolvedValue([])
    createOrderSpy.mockResolvedValue({
      id: 10,
      order_number: 'ORD-010',
      status: 'open',
      items: [],
    })
    addItemSpy.mockResolvedValue(undefined)
    loadProductsSpy.mockResolvedValue([])
    loadCurrentCrSpy.mockResolvedValue(undefined)
  })

  async function mountView() {
    const { setActivePinia, createPinia } = await import('pinia')
    setActivePinia(createPinia())
    // Seed an admin user so useAuthGate path is skipped in the component.
    const { useAuthStore } = await import('@modules/auth/store/auth.store')
    const auth = useAuthStore()
    auth.user = { id: 1, name: 'Admin', email: 'a@a.com', role: 'admin' } as any
    auth.token = 'tok'

    const PosView = (await import('../PosView.vue')).default
    return mount(PosView, { global: { stubs } })
  }

  it('shows open orders fetched on mount', async () => {
    fetchOpenOrdersSpy.mockResolvedValue([
      { id: 1, order_number: 'ORD-001', status: 'open', items: [] },
      { id: 2, order_number: 'ORD-002', status: 'open', items: [] },
    ])

    const wrapper = await mountView()
    await flushPromises()
    await flushPromises()

    expect(fetchOpenOrdersSpy).toHaveBeenCalledTimes(1)
    // PosOrderTabs is rendered, and an active order means the main POS layout
    // is rendered (cart panel present).
    expect(wrapper.find('.pos-order-tabs').exists()).toBe(true)
    expect(wrapper.find('.pos-cart-panel').exists()).toBe(true)
  })

  it('creates a new order when "Nueva Orden" is clicked (no orders yet)', async () => {
    // No open orders -> first-time guide is shown with "Crear Primera Orden".
    fetchOpenOrdersSpy.mockResolvedValueOnce([])

    const wrapper = await mountView()
    await flushPromises()

    const createBtn = wrapper
      .findAll('button')
      .find((b) => /Crear Primera Orden|Nueva Orden/i.test(b.text()))
    expect(createBtn).toBeDefined()

    // After click, a refetch returns the new order so it becomes active.
    fetchOpenOrdersSpy.mockResolvedValueOnce([
      { id: 10, order_number: 'ORD-010', status: 'open', items: [] },
    ])

    await createBtn!.trigger('click')
    await flushPromises()
    await flushPromises()

    expect(createOrderSpy).toHaveBeenCalledTimes(1)
  })

  it('adds an item to the active order when a product card is clicked', async () => {
    // Pre-existing open order so PosView lands in state E (main POS view).
    fetchOpenOrdersSpy.mockResolvedValueOnce([
      { id: 7, order_number: 'ORD-007', status: 'open', items: [] },
    ])
    loadProductsSpy.mockResolvedValue([
      { id: 99, name: 'Pan', stock: 10, sale_price: 1000, is_active: true, category_id: 1 },
    ])

    const wrapper = await mountView()
    await flushPromises()
    await flushPromises()

    const card = wrapper.find('.pos-product-card')
    expect(card.exists()).toBe(true)
    expect(card.attributes('data-id')).toBe('99')

    // Next fetchOpenOrders call returns the order with the item added.
    fetchOpenOrdersSpy.mockResolvedValueOnce([
      {
        id: 7,
        order_number: 'ORD-007',
        status: 'open',
        items: [{ id: 1, order_id: 7, product_id: 99, quantity: 1, unit_price: 1000, subtotal: 1000 }],
      },
    ])

    await card.trigger('click')
    await flushPromises()
    await flushPromises()

    expect(addItemSpy).toHaveBeenCalledTimes(1)
    expect(addItemSpy.mock.calls[0]).toEqual([7, { product_id: 99, quantity: 1 }])
  })
})
