import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderItem, PaymentMethod, Product } from '@core/types/models'
import * as posService from '../services/pos.service'
import { useInventoryStore } from '@modules/inventory/store/inventory.store'
import { useCashRegisterStore } from '@modules/cash-register/store/cash-register.store'
import { notifyError, notifySuccess } from '@core/utils/notify'

export interface ClosedSaleSummary {
  orderNumber: string
  total: number
  paymentMethod: PaymentMethod
  itemCount: number
  closedAt: string
}

export const usePosStore = defineStore('pos', () => {
  const openOrders = ref<Order[]>([])
  const activeOrderId = ref<number | null>(null)
  const loading = ref(false)
  const lastClosedSale = ref<ClosedSaleSummary | null>(null)
  const hasUsedPos = ref(false)

  const activeOrder = computed<Order | null>(() =>
    openOrders.value.find((o) => o.id === activeOrderId.value) ?? null
  )

  const cartItems = computed<OrderItem[]>(() => activeOrder.value?.items ?? [])

  const cartTotal = computed<number>(() =>
    cartItems.value.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
  )

  const orderTabs = computed(() =>
    openOrders.value.map((o) => ({
      id: o.id,
      label: o.order_number,
      active: o.id === activeOrderId.value,
    }))
  )

  const cashRegisterOpen = computed(() => {
    const crStore = useCashRegisterStore()
    return crStore.isOpen
  })

  async function loadOpenOrders(): Promise<void> {
    loading.value = true
    try {
      openOrders.value = await posService.fetchOpenOrders()
      if (openOrders.value.length && !activeOrderId.value) {
        activeOrderId.value = openOrders.value[0].id
      }
      if (activeOrderId.value && !openOrders.value.find((o) => o.id === activeOrderId.value)) {
        activeOrderId.value = openOrders.value.length ? openOrders.value[0].id : null
      }
    } finally {
      loading.value = false
    }
  }

  async function createOrder(): Promise<void> {
    const order = await posService.createOrder()
    await loadOpenOrders()
    activeOrderId.value = order.id
    hasUsedPos.value = true
    lastClosedSale.value = null
  }

  function selectOrder(orderId: number): void {
    activeOrderId.value = orderId
  }

  async function addProduct(product: Product, quantity = 1): Promise<void> {
    if (!activeOrderId.value) {
      notifyError('Sin orden', 'Crea una orden antes de agregar productos.')
      return
    }
    if (product.stock < quantity) {
      notifyError('Sin stock', `"${product.name}" no tiene stock disponible.`)
      return
    }
    await posService.addItem(activeOrderId.value, { product_id: product.id, quantity })
    await loadOpenOrders()
    const inventoryStore = useInventoryStore()
    await inventoryStore.loadProducts()
  }

  async function removeItem(itemId: number): Promise<void> {
    if (!activeOrderId.value) return
    await posService.removeItem(activeOrderId.value, itemId)
    await loadOpenOrders()
    const inventoryStore = useInventoryStore()
    await inventoryStore.loadProducts()
  }

  async function closeOrder(paymentMethod: PaymentMethod, clientId?: number | null): Promise<void> {
    if (!activeOrderId.value) return
    if (!cashRegisterOpen.value) {
      throw new Error('No hay caja abierta. Abre una caja antes de cobrar.')
    }
    const closingOrder = activeOrder.value
    await posService.closeOrder(activeOrderId.value, { payment_method: paymentMethod, client_id: clientId ?? undefined })

    if (closingOrder) {
      lastClosedSale.value = {
        orderNumber: closingOrder.order_number,
        total: cartTotal.value,
        paymentMethod,
        itemCount: closingOrder.items.length,
        closedAt: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      }
    }
    hasUsedPos.value = true
    activeOrderId.value = null
    await loadOpenOrders()
    const inventoryStore = useInventoryStore()
    await inventoryStore.loadProducts()
  }

  async function cancelOrder(): Promise<void> {
    if (!activeOrderId.value) return
    await posService.cancelOrder(activeOrderId.value)
    activeOrderId.value = null
    await loadOpenOrders()
    const inventoryStore = useInventoryStore()
    await inventoryStore.loadProducts()
    notifySuccess('Orden cancelada')
  }

  function clearLastSale(): void {
    lastClosedSale.value = null
  }

  return {
    openOrders,
    activeOrderId,
    loading,
    lastClosedSale,
    hasUsedPos,
    activeOrder,
    cartItems,
    cartTotal,
    orderTabs,
    cashRegisterOpen,
    loadOpenOrders,
    createOrder,
    selectOrder,
    addProduct,
    removeItem,
    closeOrder,
    cancelOrder,
    clearLastSale,
  }
})
