<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Facturas</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">
        Nueva Factura
      </v-btn>
    </div>

    <v-dialog v-model="showForm" max-width="650" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">Nueva Factura</v-card-title>
        <v-form @submit.prevent="saveInvoice">
          <v-select
            v-model="form.client_id"
            :items="clientOptions"
            label="Cliente"
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
              @update:model-value="onProductChange(item)"
            />
            <v-text-field
              v-model.number="item.quantity"
              label="Cant."
              type="number"
              min="1"
              style="max-width: 100px"
              hide-details
            />
            <div class="text-body-2" style="min-width: 100px">
              {{ formatCOP(getItemTotal(item)) }}
            </div>
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
            <v-btn color="primary" type="submit">Crear Factura</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="invoices"
        :items-per-page="10"
        no-data-text="No hay facturas."
      >
        <template #item.invoice_number="{ item }">{{ item.invoice_number ?? item.id }}</template>
        <template #item.client="{ item }">{{ item.client?.name }}</template>
        <template #item.status="{ item }">
          <v-chip :color="item.status === 'completed' ? 'success' : 'error'" size="small">
            {{ statusLabel(item.status) }}
          </v-chip>
        </template>
        <template #item.subtotal="{ item }">{{ formatCOP(item.subtotal) }}</template>
        <template #item.tax="{ item }">{{ formatCOP(item.tax) }}</template>
        <template #item.total="{ item }">{{ formatCOP(item.total) }}</template>
        <template #item.created_at="{ item }">{{ formatDate(item.created_at) }}</template>
        <template #item.actions="{ item }">
          <v-btn size="small" color="primary" variant="text" :to="`/invoices/${item.id}`">
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
import * as invoiceService from '../services/invoice.service'
import type { Invoice, Client, Product, InvoiceStatus } from '@core/types/models'
import type { InvoiceForm, InvoiceItemForm } from '../types/invoices.types'

const invoices = ref<Invoice[]>([])
const clients = ref<Client[]>([])
const products = ref<Product[]>([])
const showForm = ref(false)
const form = ref<InvoiceForm>({ client_id: '', items: [] })

const clientOptions = computed(() =>
  clients.value.map((c) => ({ title: `${c.name} (${c.document_number})`, value: c.id }))
)
const productOptions = computed(() =>
  products.value.map((p) => ({ title: `${p.name} (${formatCOP(p.sale_price)})`, value: p.id }))
)

const headers = [
  { title: '# Factura', key: 'invoice_number' },
  { title: 'Cliente', key: 'client' },
  { title: 'Estado', key: 'status' },
  { title: 'Subtotal', key: 'subtotal' },
  { title: 'IVA', key: 'tax' },
  { title: 'Total', key: 'total' },
  { title: 'Fecha', key: 'created_at' },
  { title: 'Acciones', key: 'actions', sortable: false, width: 80 },
]

const statusLabel = (s: InvoiceStatus) =>
  ({ completed: 'Completada', cancelled: 'Cancelada' })[s] || s

function getItemTotal(item: InvoiceItemForm): number {
  const prod = products.value.find((p) => String(p.id) === String(item.product_id))
  return prod ? prod.sale_price * (item.quantity || 0) : 0
}

function onProductChange(item: InvoiceItemForm) {
  const prod = products.value.find((p) => String(p.id) === String(item.product_id))
  if (prod) item.unit_price = prod.sale_price
}

async function openCreateForm() {
  const [clis, prods] = await Promise.all([
    invoiceService.fetchClients(),
    invoiceService.fetchProducts(),
  ])
  clients.value = clis
  products.value = prods
  form.value = { client_id: '', items: [{ product_id: '', quantity: 1, unit_price: 0 }] }
  showForm.value = true
}

function addItem() {
  form.value.items.push({ product_id: '', quantity: 1, unit_price: 0 })
}

function removeItem(i: number) {
  if (form.value.items.length > 1) form.value.items.splice(i, 1)
}

async function saveInvoice() {
  try {
    const payload: InvoiceForm = {
      client_id: form.value.client_id,
      items: form.value.items.map((item) => {
        const prod = products.value.find((p) => String(p.id) === String(item.product_id))
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: prod ? prod.sale_price : item.unit_price,
        }
      }),
    }
    await invoiceService.createInvoice(payload)
    notifySuccess('Factura creada')
    showForm.value = false
    await loadInvoices()
  } catch (err) {
    notifyApiError(err, 'Error al crear factura')
  }
}

async function loadInvoices() {
  invoices.value = await invoiceService.fetchInvoices()
}

onMounted(() => loadInvoices())
</script>
