<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Movimientos de Inventario</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdjustment">
        Ajuste Manual
      </v-btn>
    </div>

    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="4">
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
          <v-textarea v-model="adjustForm.reason" label="Razón" rows="2" :rules="[r => !!r || 'Requerido']" />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showAdjustForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Aplicar Ajuste</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredMovements"
        :items-per-page="10"
        no-data-text="No hay movimientos."
      >
        <template #item.product="{ item }">{{ item.product?.name }}</template>
        <template #item.user="{ item }">{{ item.user?.name }}</template>
        <template #item.type="{ item }">
          <v-chip :color="typeColor(item.type)" size="small">{{ typeLabel(item.type) }}</v-chip>
        </template>
        <template #item.created_at="{ item }">{{ formatDate(item.created_at) }}</template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatDate } from '@core/utils/format'
import { notifySuccess, notifyApiError } from '@core/utils/notify'
import * as inventoryService from '../services/inventory.service'
import { fetchProducts } from '../services/product.service'
import type { InventoryMovement, Product, InventoryMovementType } from '@core/types/models'
import type { AdjustmentForm } from '../types/inventory.types'

const movements = ref<InventoryMovement[]>([])
const products = ref<Product[]>([])
const filterProduct = ref<number | string>('')
const filterType = ref('')
const showAdjustForm = ref(false)
const adjustForm = ref<AdjustmentForm>({ product_id: '', new_stock: 0, reason: '' })

const typeOptions = [
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
  { title: 'Usuario', key: 'user' },
  { title: 'Tipo', key: 'type' },
  { title: 'Cantidad', key: 'quantity' },
  { title: 'Stock Antes', key: 'stock_before' },
  { title: 'Stock Después', key: 'stock_after' },
  { title: 'Razón', key: 'reason' },
  { title: 'Fecha', key: 'created_at' },
]

const typeLabel = (t: InventoryMovementType) =>
  ({ purchase: 'Compra', sale: 'Venta', adjustment: 'Ajuste', cancellation: 'Cancelación' })[t] || t

const typeColor = (t: InventoryMovementType) =>
  ({ purchase: 'info', sale: 'success', adjustment: 'warning', cancellation: 'error' })[t] || 'grey'

const filteredMovements = computed(() => {
  let list = movements.value
  if (filterProduct.value) list = list.filter((m) => String(m.product_id) === String(filterProduct.value))
  if (filterType.value) list = list.filter((m) => m.type === filterType.value)
  return list
})

async function loadData() {
  const [movs, prods] = await Promise.all([
    inventoryService.fetchMovements(),
    fetchProducts(),
  ])
  movements.value = movs
  products.value = prods
}

function openAdjustment() {
  adjustForm.value = { product_id: '', new_stock: 0, reason: '' }
  showAdjustForm.value = true
}

async function saveAdjustment() {
  try {
    await inventoryService.adjustInventory(adjustForm.value)
    notifySuccess('Ajuste aplicado')
    showAdjustForm.value = false
    await loadData()
  } catch (err) {
    notifyApiError(err, 'Error al ajustar')
  }
}

onMounted(() => loadData())
</script>
