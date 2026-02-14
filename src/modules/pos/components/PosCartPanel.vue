<template>
  <v-card class="d-flex flex-column" style="height: 100%" flat>
    <!-- Header -->
    <v-card-title class="text-subtitle-1 bg-primary text-white pa-3">
      {{ posStore.activeOrder ? posStore.activeOrder.order_number : 'Sin orden' }}
    </v-card-title>

    <!-- Items list -->
    <v-list lines="two" class="flex-grow-1 overflow-y-auto pa-0">
      <template v-if="posStore.cartItems.length">
        <PosCartItem
          v-for="item in posStore.cartItems"
          :key="item.id"
          :item="item"
          @remove="onRemoveItem"
        />
      </template>
      <v-list-item v-else>
        <div class="text-center text-medium-emphasis py-6 w-100">
          <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-cart-outline</v-icon>
          <div class="text-body-2 mb-2">Carrito vacío</div>
          <div class="text-caption">
            Haz clic en los productos de la izquierda<br>para agregarlos a esta orden
          </div>
        </div>
      </v-list-item>
    </v-list>

    <v-divider />

    <!-- Total -->
    <div class="pa-4">
      <div class="d-flex justify-space-between align-center mb-4">
        <span class="text-h6">Total:</span>
        <span class="text-h5 font-weight-bold text-primary">{{ formatCOP(posStore.cartTotal) }}</span>
      </div>

      <v-btn
        color="success"
        block
        size="large"
        class="mb-2"
        :disabled="!posStore.cartItems.length"
        prepend-icon="mdi-point-of-sale"
        @click="$emit('open-payment')"
      >
        Cerrar Venta
      </v-btn>
      <v-btn
        color="error"
        variant="outlined"
        block
        :disabled="!posStore.activeOrder"
        @click="onCancel"
      >
        Cancelar Orden
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { usePosStore } from '../store/pos.store'
import { formatCOP } from '@core/utils/format'
import { notifyApiError, confirmAction } from '@core/utils/notify'
import PosCartItem from './PosCartItem.vue'

const posStore = usePosStore()

defineEmits<{
  'open-payment': []
}>()

async function onRemoveItem(itemId: number) {
  const confirmed = await confirmAction(
    '¿Quitar este producto?',
    'Se eliminará de la orden y se devolverá al stock',
    'Sí, quitar'
  )
  if (!confirmed) return
  try {
    await posStore.removeItem(itemId)
  } catch (err) {
    notifyApiError(err, 'Error al quitar item')
  }
}

async function onCancel() {
  const confirmed = await confirmAction(
    '¿Cancelar esta orden?',
    'Se devolverá todo el stock',
    'Sí, cancelar'
  )
  if (confirmed) {
    try {
      await posStore.cancelOrder()
    } catch (err) {
      notifyApiError(err, 'Error al cancelar orden')
    }
  }
}
</script>
