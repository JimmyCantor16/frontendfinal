<template>
  <div class="pos-container d-flex flex-column" style="height: calc(100vh - 64px); overflow: hidden">
    <!-- Order tabs bar + cash register indicator -->
    <PosOrderTabs>
      <template #append>
        <v-chip
          :color="posStore.cashRegisterOpen ? 'success' : 'error'"
          size="small"
          variant="flat"
          class="mr-2"
          :prepend-icon="posStore.cashRegisterOpen ? 'mdi-cash-register' : 'mdi-alert-circle'"
          @click="$router.push('/cash-register')"
        >
          {{ posStore.cashRegisterOpen ? 'Caja Abierta' : 'Sin Caja' }}
        </v-chip>
      </template>
    </PosOrderTabs>

    <!-- No cash register warning -->
    <v-banner
      v-if="!posStore.cashRegisterOpen && !crStore.loading"
      icon="mdi-alert"
      color="warning"
      lines="one"
      class="flex-shrink-0"
    >
      <template #text>
        No hay caja abierta. Debes abrir una caja para poder cobrar órdenes.
      </template>
      <template #actions>
        <v-btn color="warning" variant="tonal" to="/cash-register">Abrir Caja</v-btn>
      </template>
    </v-banner>

    <!-- Loading -->
    <div v-if="initialLoading" class="d-flex align-center justify-center flex-grow-1">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- State A: First-time guide (never used POS + no orders) -->
    <div v-else-if="showFirstTimeGuide" class="d-flex align-center justify-center flex-grow-1">
      <v-card max-width="500" flat class="text-center pa-8">
        <v-icon size="80" color="primary" class="mb-4">mdi-point-of-sale</v-icon>
        <div class="text-h5 mb-4">Punto de Venta</div>
        <div class="text-body-1 text-medium-emphasis mb-6">
          Sigue estos pasos para realizar una venta:
        </div>
        <v-timeline side="end" density="compact" class="text-left mb-6">
          <v-timeline-item dot-color="success" size="small" icon="mdi-numeric-1-circle">
            <div class="text-body-2"><strong>Crea una orden</strong> — Haz clic en <v-chip size="x-small" color="success" variant="flat" prepend-icon="mdi-plus">Nueva Orden</v-chip> arriba</div>
          </v-timeline-item>
          <v-timeline-item dot-color="primary" size="small" icon="mdi-numeric-2-circle">
            <div class="text-body-2"><strong>Agrega productos</strong> — Haz clic en las tarjetas de productos</div>
          </v-timeline-item>
          <v-timeline-item dot-color="success" size="small" icon="mdi-numeric-3-circle">
            <div class="text-body-2"><strong>Cierra la venta</strong> — Presiona <v-chip size="x-small" color="success" variant="flat" prepend-icon="mdi-point-of-sale">Cerrar Venta</v-chip> y elige el método de pago</div>
          </v-timeline-item>
        </v-timeline>
        <v-btn color="success" size="large" prepend-icon="mdi-plus" :loading="creatingOrder" @click="onCreateOrder">
          Crear Primera Orden
        </v-btn>
      </v-card>
    </div>

    <!-- State B: Post-sale summary (just closed a sale, no active order) -->
    <div v-else-if="showPostSaleSummary" class="d-flex align-center justify-center flex-grow-1">
      <v-card max-width="450" class="text-center pa-8" flat>
        <v-icon size="64" color="success" class="mb-3">mdi-check-circle</v-icon>
        <div class="text-h5 text-success mb-2">Venta Cerrada</div>

        <v-card class="mx-auto mb-6 pa-4" max-width="350" variant="outlined">
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">Orden:</span>
            <span class="text-body-2 font-weight-bold">{{ posStore.lastClosedSale!.orderNumber }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">Total:</span>
            <span class="text-body-2 font-weight-bold text-primary">{{ formatCOP(posStore.lastClosedSale!.total) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">Método:</span>
            <span class="text-body-2 font-weight-bold">{{ paymentMethodLabel(posStore.lastClosedSale!.paymentMethod) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">Productos:</span>
            <span class="text-body-2 font-weight-bold">{{ posStore.lastClosedSale!.itemCount }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-body-2 text-medium-emphasis">Hora:</span>
            <span class="text-body-2 font-weight-bold">{{ posStore.lastClosedSale!.closedAt }}</span>
          </div>
        </v-card>

        <v-btn color="success" size="large" prepend-icon="mdi-plus" class="mb-3" block :loading="creatingOrder" @click="onCreateOrder">
          Nueva Venta
        </v-btn>
        <v-btn variant="text" color="primary" prepend-icon="mdi-view-dashboard" to="/dashboard" block>
          Ir al Dashboard
        </v-btn>
      </v-card>
    </div>

    <!-- State C: Ready for new order (has used POS, no active order, no last sale) -->
    <div v-else-if="!posStore.activeOrder" class="d-flex align-center justify-center flex-grow-1">
      <v-card max-width="400" flat class="text-center pa-8">
        <v-icon size="64" color="primary" class="mb-3">mdi-cart-plus</v-icon>
        <div class="text-h6 mb-2">Listo para una nueva venta</div>
        <div class="text-body-2 text-medium-emphasis mb-6">
          Crea una nueva orden para comenzar
        </div>
        <v-btn color="success" size="large" prepend-icon="mdi-plus" :loading="creatingOrder" @click="onCreateOrder">
          Nueva Orden
        </v-btn>
      </v-card>
    </div>

    <!-- State D: Active order — main POS content -->
    <div v-else class="d-flex flex-grow-1" style="min-height: 0">
      <!-- Left: Products -->
      <div class="flex-grow-1 d-flex flex-column pa-3" style="overflow-y: auto">
        <PosCategoryTabs v-model="selectedCategory" :categories="inventoryStore.categories" />
        <div v-if="filteredProducts.length" class="d-flex flex-wrap ga-3 mt-3">
          <PosProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            style="width: 150px"
            @add="onAddProduct"
          />
        </div>
        <div v-else class="d-flex align-center justify-center flex-grow-1">
          <span class="text-medium-emphasis">No hay productos disponibles</span>
        </div>
      </div>

      <!-- Right: Cart panel -->
      <div style="width: 380px; min-width: 380px; border-left: 1px solid rgba(0,0,0,0.12)">
        <PosCartPanel @open-payment="onOpenPayment" />
      </div>
    </div>

    <!-- Payment dialog -->
    <PosPaymentDialog v-model="showPayment" :total="posStore.cartTotal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePosStore } from '../store/pos.store'
import { useInventoryStore } from '@modules/inventory/store/inventory.store'
import { useCashRegisterStore } from '@modules/cash-register/store/cash-register.store'
import { notifyApiError, notifyError } from '@core/utils/notify'
import { formatCOP } from '@core/utils/format'
import type { Product, PaymentMethod } from '@core/types/models'
import PosOrderTabs from '../components/PosOrderTabs.vue'
import PosCategoryTabs from '../components/PosCategoryTabs.vue'
import PosProductCard from '../components/PosProductCard.vue'
import PosCartPanel from '../components/PosCartPanel.vue'
import PosPaymentDialog from '../components/PosPaymentDialog.vue'

const posStore = usePosStore()
const inventoryStore = useInventoryStore()
const crStore = useCashRegisterStore()

const selectedCategory = ref<number | string>('')
const showPayment = ref(false)
const initialLoading = ref(true)
const creatingOrder = ref(false)

const showFirstTimeGuide = computed(() =>
  !posStore.hasUsedPos && !posStore.activeOrder && posStore.openOrders.length === 0
)

const showPostSaleSummary = computed(() =>
  !posStore.activeOrder && posStore.lastClosedSale !== null
)

const filteredProducts = computed(() => {
  let list = inventoryStore.products.filter((p) => p.is_active)
  if (selectedCategory.value) {
    list = list.filter((p) => String(p.category_id) === String(selectedCategory.value))
  }
  return list
})

const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  qr: 'QR',
}

function paymentMethodLabel(method: PaymentMethod): string {
  return paymentLabels[method] ?? method
}

function onOpenPayment() {
  if (!posStore.cashRegisterOpen) {
    notifyError('Sin Caja', 'Debes abrir una caja antes de cobrar.')
    return
  }
  showPayment.value = true
}

async function onCreateOrder() {
  creatingOrder.value = true
  try {
    await posStore.createOrder()
  } catch (err) {
    notifyApiError(err, 'Error al crear orden')
  } finally {
    creatingOrder.value = false
  }
}

async function onAddProduct(product: Product) {
  try {
    await posStore.addProduct(product)
  } catch (err) {
    notifyApiError(err, 'Error al agregar producto')
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      posStore.loadOpenOrders(),
      inventoryStore.loadAll(),
      crStore.loadCurrent(),
    ])
    if (posStore.openOrders.length > 0) {
      posStore.hasUsedPos = true
    }
  } catch (err: unknown) {
    notifyApiError(err, 'Error al cargar datos del POS')
  } finally {
    initialLoading.value = false
  }
})
</script>
