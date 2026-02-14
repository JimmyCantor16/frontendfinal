<template>
  <v-container>
    <v-btn variant="text" color="primary" prepend-icon="mdi-arrow-left" to="/invoices" class="mb-4">
      Volver a facturas
    </v-btn>

    <v-card v-if="invoice" class="pa-6">
      <v-card-title class="text-h5 text-primary">
        Factura #{{ invoice.invoice_number ?? invoice.id }}
      </v-card-title>

      <v-row class="mt-2 mb-4">
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Cliente</div>
          <div>{{ invoice.client?.name }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Documento</div>
          <div>{{ invoice.client?.document_type }} {{ invoice.client?.document_number }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Estado</div>
          <v-chip :color="invoice.status === 'completed' ? 'success' : 'error'" size="small">
            {{ statusLabel(invoice.status) }}
          </v-chip>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Fecha</div>
          <div>{{ formatDate(invoice.created_at) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Subtotal</div>
          <div>{{ formatCOP(invoice.subtotal) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">IVA (19%)</div>
          <div>{{ formatCOP(calculatedTax) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Total</div>
          <div class="text-h6 font-weight-bold">{{ formatCOP(invoice.total) }}</div>
        </v-col>
      </v-row>

      <div class="text-h6 text-primary mb-3">Items</div>
      <v-data-table
        :headers="itemHeaders"
        :items="invoice.items"
        hide-default-footer
        density="compact"
      >
        <template #item.product="{ item }">{{ item.product?.name }}</template>
        <template #item.unit_price="{ item }">{{ formatCOP(item.unit_price) }}</template>
        <template #item.subtotal="{ item }">{{ formatCOP(item.subtotal ?? item.quantity * item.unit_price) }}</template>
      </v-data-table>

      <div v-if="invoice.status === 'completed'" class="mt-6">
        <v-btn color="error" @click="onCancel">Cancelar Factura</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCOP, formatDate } from '@core/utils/format'
import { notifySuccess, notifyApiError, confirmAction } from '@core/utils/notify'
import * as invoiceService from '../services/invoice.service'
import type { Invoice, InvoiceStatus } from '@core/types/models'

const route = useRoute()
const router = useRouter()
const invoice = ref<Invoice | null>(null)

const itemHeaders = [
  { title: 'Producto', key: 'product' },
  { title: 'Cantidad', key: 'quantity' },
  { title: 'Precio Unitario', key: 'unit_price' },
  { title: 'Subtotal', key: 'subtotal' },
]

const calculatedTax = computed(() => {
  if (!invoice.value) return 0
  const tax = Number(invoice.value.tax ?? 0)
  if (tax > 0) return tax
  // Si el backend no envía tax, calcular como: total - subtotal
  return Number(invoice.value.total ?? 0) - Number(invoice.value.subtotal ?? 0)
})

const statusLabel = (s: InvoiceStatus) =>
  ({ completed: 'Completada', cancelled: 'Cancelada' })[s] || s

async function loadInvoice() {
  try {
    invoice.value = await invoiceService.fetchInvoice(route.params.id as string)
  } catch {
    router.push('/invoices')
  }
}

async function onCancel() {
  const confirmed = await confirmAction(
    '¿Cancelar esta factura?',
    'Se revertirán los cambios en inventario',
    'Sí, cancelar'
  )
  if (confirmed && invoice.value) {
    try {
      await invoiceService.cancelInvoice(invoice.value.id)
      notifySuccess('Factura cancelada')
      await loadInvoice()
    } catch (err) {
      notifyApiError(err, 'Error al cancelar')
    }
  }
}

onMounted(() => loadInvoice())
</script>
