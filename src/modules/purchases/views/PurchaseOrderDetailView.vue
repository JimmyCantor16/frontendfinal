<template>
  <v-container>
    <v-btn variant="text" color="primary" prepend-icon="mdi-arrow-left" to="/purchase-orders" class="mb-4">
      Volver a órdenes
    </v-btn>

    <v-card v-if="order" class="pa-6">
      <v-card-title class="text-h5 text-primary">
        Orden #{{ order.order_number ?? order.id }}
      </v-card-title>

      <v-row class="mt-2 mb-4">
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Proveedor</div>
          <div>{{ order.supplier?.name }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Estado</div>
          <v-chip :color="statusColor(order.status)" size="small">{{ statusLabel(order.status) }}</v-chip>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Fecha</div>
          <div>{{ formatDate(order.created_at) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Subtotal</div>
          <div>{{ formatCOP(order.subtotal) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">IVA</div>
          <div>{{ formatCOP(order.tax) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Total</div>
          <div class="font-weight-bold">{{ formatCOP(order.total) }}</div>
        </v-col>
      </v-row>

      <div class="text-h6 text-primary mb-3">Items</div>
      <v-data-table
        :headers="itemHeaders"
        :items="order.items"
        hide-default-footer
        density="compact"
      >
        <template #item.product="{ item }">{{ item.product?.name }}</template>
        <template #item.unit_cost="{ item }">{{ formatCOP(item.unit_cost) }}</template>
        <template #item.subtotal="{ item }">{{ formatCOP(item.subtotal ?? item.quantity * item.unit_cost) }}</template>
      </v-data-table>

      <div v-if="order.status === 'pending'" class="d-flex ga-3 mt-6">
        <v-btn color="success" @click="receive">Recibir Orden</v-btn>
        <v-btn color="error" @click="cancel">Cancelar Orden</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCOP, formatDate } from '@core/utils/format'
import { notifySuccess, notifyApiError, confirmAction } from '@core/utils/notify'
import * as purchaseService from '../services/purchase.service'
import type { PurchaseOrder, PurchaseOrderStatus } from '@core/types/models'

const route = useRoute()
const router = useRouter()
const order = ref<PurchaseOrder | null>(null)

const itemHeaders = [
  { title: 'Producto', key: 'product' },
  { title: 'Cantidad', key: 'quantity' },
  { title: 'Costo Unitario', key: 'unit_cost' },
  { title: 'Subtotal', key: 'subtotal' },
]

const statusLabel = (s: PurchaseOrderStatus) =>
  ({ pending: 'Pendiente', received: 'Recibida', cancelled: 'Cancelada' })[s] || s

const statusColor = (s: PurchaseOrderStatus) =>
  ({ pending: 'warning', received: 'success', cancelled: 'error' })[s] || 'grey'

async function loadOrder() {
  try {
    order.value = await purchaseService.fetchPurchaseOrder(route.params.id as string)
  } catch {
    router.push('/purchase-orders')
  }
}

async function receive() {
  const confirmed = await confirmAction('¿Recibir esta orden?', 'Se actualizará el stock de los productos', 'Recibir')
  if (confirmed && order.value) {
    try {
      await purchaseService.receivePurchaseOrder(order.value.id)
      notifySuccess('Orden recibida')
      await loadOrder()
    } catch (err) {
      notifyApiError(err, 'Error al recibir')
    }
  }
}

async function cancel() {
  const confirmed = await confirmAction('¿Cancelar esta orden?', undefined, 'Sí, cancelar')
  if (confirmed && order.value) {
    try {
      await purchaseService.cancelPurchaseOrder(order.value.id)
      notifySuccess('Orden cancelada')
      await loadOrder()
    } catch (err) {
      notifyApiError(err, 'Error al cancelar')
    }
  }
}

onMounted(() => loadOrder())
</script>
