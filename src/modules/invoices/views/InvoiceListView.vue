<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Facturas</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm" :disabled="!crStore.isOpen">
        Nueva Factura
      </v-btn>
    </div>

    <!-- No cash register warning -->
    <v-banner
      v-if="!crStore.isOpen && !crStore.loading"
      icon="mdi-alert"
      color="warning"
      lines="one"
      class="mb-4 flex-shrink-0"
    >
      <template #text>
        No hay caja abierta. Debes abrir una caja para poder crear facturas.
      </template>
      <template #actions>
        <v-btn color="warning" variant="tonal" to="/cash-register">Abrir Caja</v-btn>
      </template>
    </v-banner>

    <!-- Invoice creation dialog -->
    <v-dialog v-model="showForm" max-width="650" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">Nueva Factura</v-card-title>
        <v-form @submit.prevent="saveInvoice">
          <div class="d-flex align-center ga-2">
            <v-select
              v-model="form.client_id"
              :items="clientOptions"
              label="Cliente"
              :rules="[r => !!r || 'Requerido']"
              class="mb-2"
              style="flex: 1"
            />
            <v-btn icon size="small" color="primary" variant="text" @click="showClientForm = true" class="mb-2">
              <v-icon>mdi-account-plus</v-icon>
              <v-tooltip activator="parent" location="top">Crear cliente</v-tooltip>
            </v-btn>
          </div>

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

          <v-select
            v-model="form.payment_method"
            :items="paymentMethodOptions"
            label="Método de Pago"
            :rules="[r => !!r || 'Seleccione un método de pago']"
            class="mb-2"
          />

          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Crear Factura</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Client creation dialog -->
    <v-dialog v-model="showClientForm" max-width="500" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">Nuevo Cliente</v-card-title>
        <v-form @submit.prevent="saveClient">
          <v-select
            v-model="clientForm.document_type"
            :items="['CC', 'NIT', 'CE', 'TI', 'PP']"
            label="Tipo de documento"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-text-field
            v-model="clientForm.document_number"
            label="Número de documento"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-text-field
            v-model="clientForm.name"
            label="Nombre"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-text-field
            v-model="clientForm.phone"
            label="Teléfono"
            class="mb-2"
          />
          <v-text-field
            v-model="clientForm.email"
            label="Email"
            class="mb-2"
          />
          <v-text-field
            v-model="clientForm.address"
            label="Dirección (opcional)"
            hint="Solo si el cliente lo proporciona"
            persistent-hint
            class="mb-2"
          />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showClientForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Crear Cliente</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar factura..."
          single-line
          hide-details
        />
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredInvoices"
        :items-per-page="10"
        :loading="loading"
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
import { notifySuccess, notifyError, notifyApiError, confirmAction } from '@core/utils/notify'
import { useCashRegisterStore } from '@modules/cash-register/store/cash-register.store'
import { useAuthStore } from '@modules/auth/store/auth.store'
import * as invoiceService from '../services/invoice.service'
import type { Invoice, Client, Product, InvoiceStatus } from '@core/types/models'
import type { InvoiceForm, InvoiceItemForm } from '../types/invoices.types'
import type { ClientForm } from '@modules/catalog/types/catalog.types'

const crStore = useCashRegisterStore()
const authStore = useAuthStore()
const userRole = computed(() => (authStore.user?.role ?? '').toLowerCase())
const isAdmin = computed(() => !userRole.value || userRole.value === 'admin')

const loading = ref(false)
const invoices = ref<Invoice[]>([])
const clients = ref<Client[]>([])
const products = ref<Product[]>([])
const showForm = ref(false)
const search = ref('')
const form = ref<InvoiceForm>({ client_id: '', payment_method: undefined, items: [] })

const paymentMethodOptions = [
  { title: 'Efectivo', value: 'cash' },
  { title: 'Tarjeta', value: 'card' },
  { title: 'Transferencia', value: 'transfer' },
  { title: 'QR', value: 'qr' },
]

// Client form state
const showClientForm = ref(false)
const clientForm = ref<ClientForm>({
  document_type: '',
  document_number: '',
  name: '',
  phone: '',
  email: '',
  address: '',
})

const filteredInvoices = computed(() => {
  let list = invoices.value
  // Cajero only sees their own invoices
  if (!isAdmin.value && authStore.user) {
    list = list.filter((inv) => (inv as any).user_id === authStore.user!.id)
  }
  const q = search.value.toLowerCase()
  if (q) {
    list = list.filter((inv) =>
      (inv.invoice_number?.toLowerCase().includes(q)) ||
      (inv.client?.name?.toLowerCase().includes(q)) ||
      (inv.client?.document_number?.toLowerCase().includes(q))
    )
  }
  return list
})

const clientOptions = computed(() =>
  clients.value.map((c) => ({ title: `${c.name} (${c.document_number})`, value: c.id }))
)
const productOptions = computed(() =>
  products.value
    .filter((p) => p.stock > 0 && p.is_active)
    .map((p) => ({ title: `${p.name} (${formatCOP(p.sale_price)}) - Stock: ${p.stock}`, value: p.id }))
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
  if (!crStore.isOpen) {
    notifyError('Caja cerrada', 'Debes abrir una caja antes de crear facturas.')
    return
  }
  const [clis, prods] = await Promise.all([
    invoiceService.fetchClients(),
    invoiceService.fetchProducts(),
  ])
  clients.value = clis
  products.value = prods
  form.value = { client_id: '', payment_method: undefined, items: [{ product_id: '', quantity: 1, unit_price: 0 }] }
  showForm.value = true
}

function addItem() {
  form.value.items.push({ product_id: '', quantity: 1, unit_price: 0 })
}

function removeItem(i: number) {
  if (form.value.items.length > 1) form.value.items.splice(i, 1)
}

async function saveInvoice() {
  // Validate stock before submitting
  for (const item of form.value.items) {
    const prod = products.value.find((p) => String(p.id) === String(item.product_id))
    if (prod && prod.stock < item.quantity) {
      notifyError('Stock insuficiente', `"${prod.name}" solo tiene ${prod.stock} unidades disponibles.`)
      return
    }
  }

  // Warn if selling last stock of any product
  const depletedProducts = form.value.items
    .map((item) => {
      const prod = products.value.find((p) => String(p.id) === String(item.product_id))
      return prod && prod.stock <= item.quantity ? prod.name : null
    })
    .filter(Boolean)

  if (depletedProducts.length > 0) {
    const confirmed = await confirmAction(
      'Inventario se agotará',
      `Los siguientes productos quedarán con stock 0 después de esta factura: ${depletedProducts.join(', ')}. ¿Deseas continuar?`,
      'Sí, continuar'
    )
    if (!confirmed) return
  }

  try {
    const payload: InvoiceForm = {
      client_id: form.value.client_id,
      payment_method: form.value.payment_method,
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

async function saveClient() {
  try {
    const newClient = await invoiceService.createClient(clientForm.value)
    clients.value.push(newClient)
    form.value.client_id = newClient.id
    notifySuccess('Cliente creado')
    showClientForm.value = false
    clientForm.value = { document_type: '', document_number: '', name: '', phone: '', email: '', address: '' }
  } catch (err) {
    notifyApiError(err, 'Error al crear cliente')
  }
}

async function loadInvoices() {
  loading.value = true
  try {
    invoices.value = await invoiceService.fetchInvoices()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadInvoices()
  crStore.loadCurrent()
})
</script>
