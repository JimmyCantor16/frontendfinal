/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, config } from '@vue/test-utils'

const { fetchDashboardSpy } = vi.hoisted(() => ({
  fetchDashboardSpy: vi.fn(),
}))

vi.mock('@modules/dashboard/services/dashboard.service', () => ({
  fetchDashboard: (...args: unknown[]) => fetchDashboardSpy(...args),
}))

vi.mock('@core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

vi.mock('@core/utils/notify', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyApiError: vi.fn(),
}))

// Stubs that surface props for assertions while keeping the DOM observable.
const stubs = {
  'v-container': { template: '<div class="v-container"><slot /></div>' },
  'v-row': { template: '<div class="v-row"><slot /></div>' },
  'v-col': { template: '<div class="v-col"><slot /></div>' },
  'v-card': { template: '<div class="v-card"><slot /></div>' },
  'v-alert': { template: '<div class="v-alert"><slot /></div>' },
  'v-data-table': {
    props: ['items', 'headers', 'loading'],
    template:
      '<div class="v-data-table" :data-count="items?.length ?? 0" :data-loading="loading"><slot /></div>',
  },
}

describe('DashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    config.global.stubs = stubs
  })

  async function mountView() {
    const { setActivePinia, createPinia } = await import('pinia')
    setActivePinia(createPinia())
    const DashboardView = (await import('../DashboardView.vue')).default
    return mount(DashboardView, { global: { stubs } })
  }

  it('loads dashboard summary on mount and renders KPI widgets', async () => {
    fetchDashboardSpy.mockResolvedValue({
      ventas_hoy: 150000,
      ventas_mes: 2500000,
      facturas_hoy: 12,
      productos_stock_bajo: [],
    })

    const wrapper = await mountView()
    await flushPromises()

    expect(fetchDashboardSpy).toHaveBeenCalledTimes(1)
    // Three KPI widgets exist (Ventas Hoy, Ventas Mes, Facturas Hoy).
    const text = wrapper.text()
    expect(text).toContain('Ventas Hoy')
    expect(text).toContain('Ventas del Mes')
    expect(text).toContain('Facturas Hoy')
    expect(text).toContain('12') // facturas count rendered as plain number
  })

  it('renders the low-stock table fed by the store/service', async () => {
    fetchDashboardSpy.mockResolvedValue({
      ventas_hoy: 0,
      ventas_mes: 0,
      facturas_hoy: 0,
      productos_stock_bajo: [
        { id: 1, sku: 'A-1', name: 'Item 1', stock: 1, minimum_stock: 5 },
        { id: 2, sku: 'A-2', name: 'Item 2', stock: 0, minimum_stock: 3 },
      ],
    })

    const wrapper = await mountView()
    await flushPromises()

    const table = wrapper.find('.v-data-table')
    expect(table.exists()).toBe(true)
    expect(table.attributes('data-count')).toBe('2')
  })

  it('shows an error alert when fetchDashboard rejects', async () => {
    fetchDashboardSpy.mockRejectedValue(new Error('boom'))

    const wrapper = await mountView()
    await flushPromises()

    const alert = wrapper.find('.v-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Error al cargar el dashboard')
  })

  it('falls back to zero values when the API omits fields', async () => {
    fetchDashboardSpy.mockResolvedValue({})

    const wrapper = await mountView()
    await flushPromises()

    // Three KPI columns still rendered; "Facturas Hoy" value should be 0.
    const cols = wrapper.findAll('.v-col')
    expect(cols.length).toBeGreaterThanOrEqual(3)
    expect(wrapper.text()).toContain('0')
  })
})
