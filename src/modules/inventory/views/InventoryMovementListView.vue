<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Movimientos de Inventario</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdjustment">
        Ajuste Manual
      </v-btn>
    </div>

    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="3">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Buscar movimiento..."
          single-line
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="filterProduct"
          :items="productOptions"
          label="Producto"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="filterType"
          :items="typeOptions"
          label="Tipo"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <v-dialog v-model="showAdjustForm" max-width="500" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">Ajuste Manual de Inventario</v-card-title>
        <v-form @submit.prevent="saveAdjustment">
          <v-select
            v-model="adjustForm.product_id"
            :items="productOptions"
            label="Producto"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-text-field
            v-model.number="adjustForm.new_stock"
            label="Nuevo Stock"
            type="number"
            min="0"
            :rules="[r => r >= 0 || 'Debe ser >= 0']"
            class="mb-2"
          />
          <v-textarea v-model="adjustForm.reason" label="Razón" rows="2" :rules="[r => !!r?.trim() || 'Requerido']" />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showAdjustForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit" :loading="saving">Aplicar Ajuste</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredMovements"
        :items-per-page="10"
        :loading="loading"
        no-data-text="No hay movimientos."
        show-expand
      >
        <template #item.product="{ item }">{{ item.product?.name }}</template>
        <template #item.type="{ item }">
          <v-chip :color="typeColor(item.type)" size="small" variant="flat">
            <v-icon start size="small">{{ typeIcon(item.type) }}</v-icon>
            {{ typeLabel(item.type) }}
          </v-chip>
        </template>
        <template #item.quantity="{ item }">
          <span :class="item.type === 'sale' || item.type === 'cancellation' ? 'text-error' : 'text-success'">
            {{ item.type === 'sale' ? '-' : '+' }}{{ item.quantity }}
          </span>
        </template>
        <template #item.stock_change="{ item }">
          {{ item.stock_before }} → {{ item.stock_after }}
        </template>
        <template #item.created_at="{ item }">{{ formatDateTime(item.created_at) }}</template>
        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="pa-4 bg-grey-lighten-5">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <span class="text-caption text-medium-emphasis">Usuario:</span>
                  <span class="ml-2">{{ item.user?.name || '—' }}</span>
                </v-col>
                <v-col cols="12" sm="6">
                  <span class="text-caption text-medium-emphasis">Razón:</span>
                  <span class="ml-2">{{ item.reason || '—' }}</span>
                </v-col>
              </v-row>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatDateTime } from '@core/utils/format'
import { notifySuccess, notifyApiError } from '@core/utils/notify'
import * as inventoryService from '../services/inventory.service'
import { fetchProducts } from '../services/product.service'
import type { InventoryMovement, Product, InventoryMovementType } from '@core/types/models'
import type { AdjustmentForm } from '../types/inventory.types'

const loading = ref(false)
const saving = ref(false)
const movements = ref<InventoryMovement[]>([])
const products = ref<Product[]>([])
const searchQuery = ref('')
const filterProduct = ref<number | string>('')
const filterType = ref('')
const showAdjustForm = ref(false)
const adjustForm = ref<AdjustmentForm>({ product_id: '', new_stock: 0, reason: '' })

const typeOptions = [
  { title: 'Todos', value: '' },
  { title: 'Compra', value: 'purchase' },
  { title: 'Venta', value: 'sale' },
  { title: 'Ajuste', value: 'adjustment' },
  { title: 'Cancelación', value: 'cancellation' },
]

const productOptions = computed(() =>
  products.value.map((p) => ({ title: `${p.name} (Stock: ${p.stock})`, value: p.id }))
)

const headers = [
  { title: 'Producto', key: 'product' },
  { title: 'Tipo', key: 'type' },
  { title: 'Cantidad', key: 'quantity', width: 100 },
  { title: 'Stock', key: 'stock_change' },
  { title: 'Fecha', key: 'created_at' },
]

const typeLabel = (t: InventoryMovementType) =>
  ({ purchase: 'Compra', sale: 'Venta', adjustment: 'Ajuste', cancellation: 'Cancelación' })[t] || t

const typeColor = (t: InventoryMovementType) =>
  ({ purchase: 'blue', sale: 'green', adjustment: 'orange', cancellation: 'red' })[t] || 'grey'

const typeIcon = (t: InventoryMovementType) =>
  ({ purchase: 'mdi-cart-arrow-down', sale: 'mdi-cart-arrow-up', adjustment: 'mdi-tune', cancellation: 'mdi-cancel' })[t] || 'mdi-help'

const filteredMovements = computed(() => {
  let list = movements.value
  const q = searchQuery.value.toLowerCase()
  if (q) {
    list = list.filter((m) =>
      (m.product?.name?.toLowerCase().includes(q)) ||
      (m.reason?.toLowerCase().includes(q)) ||
      (m.user?.name?.toLowerCase().includes(q))
    )
  }
  if (filterProduct.value) list = list.filter((m) => String(m.product_id) === String(filterProduct.value))
  if (filterType.value) list = list.filter((m) => m.type?.toLowerCase() === filterType.value.toLowerCase())
  return list
})

async function loadData() {
  loading.value = true
  try {
    const results = await Promise.allSettled([
      inventoryService.fetchMovements(),
      fetchProducts(),
    ])
    if (results[0].status === 'fulfilled') movements.value = results[0].value
    if (results[1].status === 'fulfilled') products.value = results[1].value
  } finally {
    loading.value = false
  }
}

function openAdjustment() {
  adjustForm.value = { product_id: '', new_stock: 0, reason: '' }
  showAdjustForm.value = true
}

async function saveAdjustment() {
  if (saving.value) return
  saving.value = true
  try {
    await inventoryService.adjustInventory(adjustForm.value)
    notifySuccess('Ajuste aplicado')
    showAdjustForm.value = false
    await loadData()
  } catch (err) {
    notifyApiError(err, 'Error al ajustar')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadData())
</script>
