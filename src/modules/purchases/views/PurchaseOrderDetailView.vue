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
          <v-chip :color="statusColor(order.status)" size="small" variant="flat">
            <v-icon start size="small">{{ statusIcon(order.status) }}</v-icon>
            {{ statusLabel(order.status) }}
          </v-chip>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Fecha creación</div>
          <div>{{ formatDateTime(order.created_at) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Subtotal</div>
          <div>{{ formatCOP(order.subtotal) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">IVA (19%)</div>
          <div>{{ formatCOP(calculatedTax) }}</div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="text-caption text-medium-emphasis">Total</div>
          <div class="font-weight-bold text-h6">{{ formatCOP(order.total) }}</div>
        </v-col>
      </v-row>

      <!-- Audit trail: who approved/cancelled and when -->
      <v-alert
        v-if="order.status === 'received'"
        type="success"
        variant="tonal"
        density="compact"
        class="mb-4"
        icon="mdi-check-circle"
      >
        <strong>Recibida</strong> por {{ order.received_by_name || order.user?.name || 'Usuario' }}
        el {{ formatDateTime(order.received_at || order.updated_at) }}
      </v-alert>

      <v-alert
        v-if="order.status === 'cancelled'"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
        icon="mdi-close-circle"
      >
        <strong>Cancelada</strong> por {{ order.cancelled_by_name || order.user?.name || 'Usuario' }}
        el {{ formatDateTime(order.cancelled_at || order.updated_at) }}
        <template v-if="order.cancel_reason">
          <br><span class="text-caption">Motivo: {{ order.cancel_reason }}</span>
        </template>
      </v-alert>

      <!-- Normal view (not receiving) -->
      <template v-if="!receivingMode">
        <div class="text-h6 text-primary mb-3">Items</div>
        <v-data-table
          :headers="itemHeaders"
          :items="order.items"
          hide-default-footer
          density="compact"
        >
          <template #item.product="{ item }">{{ item.product?.name }}</template>
          <template #item.unit_cost="{ item }">{{ formatCOP(item.unit_cost) }}</template>
          <template #item.tax="{ item }">{{ formatCOP(Number(item.unit_cost) * Number(item.quantity) * 0.19) }}</template>
          <template #item.subtotal="{ item }">{{ formatCOP((item.subtotal ?? item.quantity * item.unit_cost) * 1.19) }}</template>
        </v-data-table>

        <div v-if="order.status === 'pending'" class="d-flex ga-3 mt-6">
          <v-btn color="success" prepend-icon="mdi-clipboard-check" @click="startReceiving">
            Recibir Orden
          </v-btn>
          <v-btn color="error" prepend-icon="mdi-cancel" @click="cancel">
            Cancelar Orden
          </v-btn>
        </div>
      </template>

      <!-- Receiving mode with checklist -->
      <template v-else>
        <div class="text-h6 text-primary mb-3">
          <v-icon start>mdi-clipboard-check</v-icon>
          Checklist de Recepción
        </div>
        <v-alert type="info" variant="tonal" class="mb-4" density="compact">
          Verifica cada producto recibido. Si hay devoluciones, indica la cantidad y el motivo.
        </v-alert>

        <v-table density="compact">
          <thead>
            <tr>
              <th>Producto</th>
              <th style="width: 100px">Pedido</th>
              <th style="width: 130px">Recibido</th>
              <th style="width: 130px">Devuelto</th>
              <th>Motivo devolución</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in checklistRows" :key="i">
              <td>{{ row.productName }}</td>
              <td>{{ row.orderedQty }}</td>
              <td>
                <v-text-field
                  v-model.number="row.received_quantity"
                  type="number"
                  :min="0"
                  :max="row.orderedQty"
                  density="compact"
                  hide-details
                  variant="outlined"
                  style="max-width: 100px"
                />
              </td>
              <td>
                <v-text-field
                  v-model.number="row.returned_quantity"
                  type="number"
                  :min="0"
                  :max="row.orderedQty"
                  density="compact"
                  hide-details
                  variant="outlined"
                  style="max-width: 100px"
                />
              </td>
              <td>
                <v-text-field
                  v-if="row.returned_quantity > 0"
                  v-model="row.return_reason"
                  placeholder="Motivo requerido"
                  density="compact"
                  hide-details
                  variant="outlined"
                  :rules="[r => !!r || 'Requerido']"
                />
                <span v-else class="text-medium-emphasis">—</span>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div class="d-flex ga-3 mt-6">
          <v-btn
            color="success"
            prepend-icon="mdi-check"
            :loading="submittingChecklist"
            :disabled="!checklistValid"
            @click="submitChecklist"
          >
            Confirmar Recepción
          </v-btn>
          <v-btn variant="text" @click="receivingMode = false">
            Cancelar
          </v-btn>
        </div>
      </template>
    </v-card>

    <!-- Cancel reason dialog -->
    <v-dialog v-model="showCancelDialog" max-width="450" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-error">Cancelar Orden</v-card-title>
        <v-form @submit.prevent="confirmCancel">
          <v-textarea
            v-model="cancelReason"
            label="Motivo de cancelación"
            :rules="[r => !!r?.trim() || 'Debe indicar un motivo']"
            rows="3"
            class="mt-3"
          />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showCancelDialog = false">Volver</v-btn>
            <v-btn color="error" type="submit" :disabled="!cancelReason?.trim()">Confirmar Cancelación</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCOP } from '@core/utils/format'
import { notifySuccess, notifyApiError, confirmAction } from '@core/utils/notify'
import * as purchaseService from '../services/purchase.service'
import type { PurchaseOrder, PurchaseOrderStatus } from '@core/types/models'
import type { ReceiveItemPayload } from '../types/purchases.types'

const route = useRoute()
const router = useRouter()
const order = ref<PurchaseOrder | null>(null)
const receivingMode = ref(false)
const submittingChecklist = ref(false)
const showCancelDialog = ref(false)
const cancelReason = ref('')

interface ChecklistRow {
  item_id: number
  productName: string
  orderedQty: number
  received_quantity: number
  returned_quantity: number
  return_reason: string
}

const checklistRows = ref<ChecklistRow[]>([])

const itemHeaders = [
  { title: 'Producto', key: 'product' },
  { title: 'Cantidad', key: 'quantity' },
  { title: 'Costo Unitario', key: 'unit_cost' },
  { title: 'IVA', key: 'tax' },
  { title: 'Subtotal + IVA', key: 'subtotal' },
]

const calculatedTax = computed(() => {
  if (!order.value) return 0
  const tax = Number(order.value.tax ?? 0)
  if (tax > 0) return tax
  const diff = Number(order.value.total ?? 0) - Number(order.value.subtotal ?? 0)
  return diff < 0 ? 0 : diff
})

const statusLabel = (s: PurchaseOrderStatus) =>
  ({ pending: 'Pendiente', received: 'Recibida', cancelled: 'Cancelada' })[s] || s

const statusColor = (s: PurchaseOrderStatus) =>
  ({ pending: 'orange', received: 'green', cancelled: 'red' })[s] || 'grey'

const statusIcon = (s: PurchaseOrderStatus) =>
  ({ pending: 'mdi-clock-outline', received: 'mdi-check-circle', cancelled: 'mdi-close-circle' })[s] || 'mdi-help'

const checklistValid = computed(() =>
  checklistRows.value.every((row) =>
    row.received_quantity >= 0 &&
    row.returned_quantity >= 0 &&
    (row.returned_quantity === 0 || !!row.return_reason?.trim())
  )
)

function formatDateTime(d: string | undefined | null): string {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('es-CO') + ' ' + date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function startReceiving() {
  if (!order.value) return
  checklistRows.value = order.value.items.map((item) => ({
    item_id: item.id,
    productName: item.product?.name ?? `Producto #${item.product_id}`,
    orderedQty: item.quantity,
    received_quantity: item.quantity,
    returned_quantity: 0,
    return_reason: '',
  }))
  receivingMode.value = true
}

async function submitChecklist() {
  if (!order.value || !checklistValid.value) return

  const confirmed = await confirmAction(
    '¿Confirmar recepción?',
    'Se actualizará el stock según las cantidades recibidas.',
    'Confirmar'
  )
  if (!confirmed) return

  const invalidQty = checklistRows.value.some((row) => row.received_quantity > row.orderedQty)
  if (invalidQty) {
    notifyApiError(null, 'La cantidad recibida no puede superar la cantidad pedida')
    return
  }

  submittingChecklist.value = true
  try {
    const items: ReceiveItemPayload[] = checklistRows.value.map((row) => ({
      item_id: row.item_id,
      received_quantity: row.received_quantity,
      returned_quantity: row.returned_quantity,
      ...(row.returned_quantity > 0 ? { return_reason: row.return_reason } : {}),
    }))
    await purchaseService.receivePurchaseOrderWithChecklist(order.value.id, { items })
    notifySuccess('Orden recibida')
    receivingMode.value = false
    await loadOrder()
  } catch (err) {
    notifyApiError(err, 'Error al recibir orden')
  } finally {
    submittingChecklist.value = false
  }
}

async function loadOrder() {
  try {
    order.value = await purchaseService.fetchPurchaseOrder(route.params.id as string)
  } catch {
    router.push('/purchase-orders')
  }
}

function cancel() {
  cancelReason.value = ''
  showCancelDialog.value = true
}

async function confirmCancel() {
  if (!cancelReason.value?.trim() || !order.value) return

  try {
    await purchaseService.cancelPurchaseOrder(order.value.id, cancelReason.value.trim())
    notifySuccess('Orden cancelada')
    showCancelDialog.value = false
    await loadOrder()
  } catch (err) {
    notifyApiError(err, 'Error al cancelar')
  }
}

onMounted(() => loadOrder())
</script>
