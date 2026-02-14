<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Órdenes de Compra</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">
        Nueva Orden
      </v-btn>
    </div>

    <v-dialog v-model="showForm" max-width="650" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">Nueva Orden de Compra</v-card-title>
        <v-form @submit.prevent="saveOrder">
          <v-select
            v-model="form.supplier_id"
            :items="supplierOptions"
            label="Proveedor"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />

          <div class="text-subtitle-2 mb-2">Items</div>
          <div v-for="(item, i) in form.items" :key="i" class="d-flex ga-2 align-center mb-2">
            <v-select
              v-model="item.product_id"
              :items="productOptions"
              label="Producto"
              :rules="[r => !!r || 'Requerido']"
              style="flex: 2"
              hide-details
            />
            <v-text-field
              v-model.number="item.quantity"
              label="Cant."
              type="number"
              min="1"
              style="max-width: 100px"
              hide-details
            />
            <v-text-field
              v-model.number="item.unit_cost"
              label="Costo unit."
              type="number"
              step="0.01"
              min="0"
              style="max-width: 130px"
              hide-details
            />
            <v-btn icon size="small" color="error" variant="text" @click="removeItem(i)" :disabled="form.items.length <= 1">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-btn variant="outlined" color="primary" size="small" class="mb-4" @click="addItem">
            + Agregar item
          </v-btn>

          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Crear Orden</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="orders"
        :items-per-page="10"
        no-data-text="No hay órdenes de compra."
      >
        <template #item.order_number="{ item }">{{ item.order_number ?? item.id }}</template>
        <template #item.supplier="{ item }">{{ item.supplier?.name }}</template>
        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small">{{ statusLabel(item.status) }}</v-chip>
        </template>
        <template #item.subtotal="{ item }">{{ formatCOP(item.subtotal) }}</template>
        <template #item.tax="{ item }">{{ formatCOP(item.tax) }}</template>
        <template #item.total="{ item }">{{ formatCOP(item.total) }}</template>
        <template #item.created_at="{ item }">{{ formatDate(item.created_at) }}</template>
        <template #item.actions="{ item }">
          <v-btn size="small" color="primary" variant="text" :to="`/purchase-orders/${item.id}`">
            Ver
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatCOP, formatDate } from '@core/utils/format'
import { notifySuccess, notifyApiError } from '@core/utils/notify'
import * as purchaseService from '../services/purchase.service'
import type { PurchaseOrder, Supplier, Product, PurchaseOrderStatus } from '@core/types/models'
import type { PurchaseOrderForm } from '../types/purchases.types'

const orders = ref<PurchaseOrder[]>([])
const suppliers = ref<Supplier[]>([])
const products = ref<Product[]>([])
const showForm = ref(false)
const form = ref<PurchaseOrderForm>({ supplier_id: '', items: [] })

const supplierOptions = computed(() => suppliers.value.map((s) => ({ title: s.name, value: s.id })))
const productOptions = computed(() => products.value.map((p) => ({ title: p.name, value: p.id })))

const headers = [
  { title: '# Orden', key: 'order_number' },
  { title: 'Proveedor', key: 'supplier' },
  { title: 'Estado', key: 'status' },
  { title: 'Subtotal', key: 'subtotal' },
  { title: 'IVA', key: 'tax' },
  { title: 'Total', key: 'total' },
  { title: 'Fecha', key: 'created_at' },
  { title: 'Acciones', key: 'actions', sortable: false, width: 80 },
]

const statusLabel = (s: PurchaseOrderStatus) =>
  ({ pending: 'Pendiente', received: 'Recibida', cancelled: 'Cancelada' })[s] || s

const statusColor = (s: PurchaseOrderStatus) =>
  ({ pending: 'warning', received: 'success', cancelled: 'error' })[s] || 'grey'

async function openCreateForm() {
  const [sups, prods] = await Promise.all([
    purchaseService.fetchSuppliers(),
    purchaseService.fetchProducts(),
  ])
  suppliers.value = sups
  products.value = prods
  form.value = { supplier_id: '', items: [{ product_id: '', quantity: 1, unit_cost: 0 }] }
  showForm.value = true
}

function addItem() {
  form.value.items.push({ product_id: '', quantity: 1, unit_cost: 0 })
}

function removeItem(i: number) {
  if (form.value.items.length > 1) form.value.items.splice(i, 1)
}

async function saveOrder() {
  try {
    await purchaseService.createPurchaseOrder(form.value)
    notifySuccess('Orden creada')
    showForm.value = false
    await loadOrders()
  } catch (err) {
    notifyApiError(err, 'Error al crear orden')
  }
}

async function loadOrders() {
  orders.value = await purchaseService.fetchPurchaseOrders()
}

onMounted(() => loadOrders())
</script>
