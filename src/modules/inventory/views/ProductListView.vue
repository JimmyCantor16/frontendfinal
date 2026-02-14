<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Productos</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openForm">
        Nuevo Producto
      </v-btn>
    </div>

    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar producto..."
          single-line
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="filterCategory"
          :items="categoryOptions"
          label="Categoría"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="auto">
        <v-checkbox v-model="filterLowStock" label="Stock bajo" hide-details />
      </v-col>
    </v-row>

    <v-dialog v-model="showForm" max-width="550" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">
          {{ editingId ? 'Editar' : 'Nuevo' }} Producto
        </v-card-title>
        <v-form @submit.prevent="save">
          <v-text-field v-model="form.sku" label="SKU" :rules="[r => !!r || 'Requerido']" class="mb-2" />
          <v-text-field v-model="form.name" label="Nombre" :rules="[r => !!r || 'Requerido']" class="mb-2" />
          <v-textarea v-model="form.description" label="Descripción" rows="2" class="mb-2" />
          <v-select
            v-model="form.category_id"
            :items="categoryOptions"
            label="Categoría"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-row>
            <v-col cols="6">
              <v-text-field v-model.number="form.purchase_price" label="Precio Compra" type="number" min="0" step="0.01" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="form.sale_price" label="Precio Venta" type="number" min="0" step="0.01" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model.number="form.stock" label="Stock" type="number" min="0" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="form.minimum_stock" label="Stock Mínimo" type="number" min="0" />
            </v-col>
          </v-row>
          <v-checkbox v-model="form.is_active" label="Activo" hide-details />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Guardar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="tableItems"
        :items-per-page="10"
        no-data-text="No se encontraron productos."
      >
        <template #item.purchase_price="{ item }">{{ formatCOP(item.purchase_price) }}</template>
        <template #item.sale_price="{ item }">{{ formatCOP(item.sale_price) }}</template>
        <template #item.category="{ item }">{{ item.category?.name }}</template>
        <template #item.stock="{ item }">
          <span :class="{ 'text-error font-weight-bold': item.stock <= item.minimum_stock }">
            {{ item.stock }}
          </span>
        </template>
        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'grey'" size="small">
            {{ item.is_active ? 'Sí' : 'No' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" color="warning" @click="onEdit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="remove(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCrud } from '@core/composables/useCrud'
import { formatCOP } from '@core/utils/format'
import { useInventoryStore } from '../store/inventory.store'
import type { Product } from '@core/types/models'
import type { ProductForm } from '../types/inventory.types'

const inventoryStore = useInventoryStore()

const filterCategory = ref<number | string>('')
const filterLowStock = ref(false)

const categoryOptions = computed(() =>
  inventoryStore.categories.map((c) => ({ title: c.name, value: c.id }))
)

const headers = [
  { title: 'SKU', key: 'sku' },
  { title: 'Nombre', key: 'name' },
  { title: 'Categoría', key: 'category' },
  { title: 'P. Compra', key: 'purchase_price' },
  { title: 'P. Venta', key: 'sale_price' },
  { title: 'Stock', key: 'stock' },
  { title: 'Stock Mín.', key: 'minimum_stock' },
  { title: 'Activo', key: 'is_active', width: 80 },
  { title: 'Acciones', key: 'actions', sortable: false, width: 120 },
]

const {
  search, showForm, editingId, form, filtered,
  fetchData, openForm, editItem, save, remove,
} = useCrud<Product, ProductForm>({
  endpoint: '/products',
  entityName: 'Producto',
  defaultForm: () => ({
    sku: '', name: '', description: '', category_id: '',
    purchase_price: 0, sale_price: 0, stock: 0, minimum_stock: 0, is_active: true,
  }),
  searchFilter: (item, q) =>
    item.name.toLowerCase().includes(q) || (item.sku?.toLowerCase().includes(q) ?? false),
})

const tableItems = computed(() => {
  let list = filtered.value
  if (filterCategory.value) list = list.filter((p) => String(p.category_id) === String(filterCategory.value))
  if (filterLowStock.value) list = list.filter((p) => p.stock <= p.minimum_stock)
  return list
})

function onEdit(p: Product) {
  editItem(p, (prod) => ({
    sku: prod.sku,
    name: prod.name,
    description: prod.description || '',
    category_id: prod.category_id || '',
    purchase_price: prod.purchase_price,
    sale_price: prod.sale_price,
    stock: prod.stock,
    minimum_stock: prod.minimum_stock,
    is_active: prod.is_active ?? true,
  }))
}

onMounted(async () => {
  await inventoryStore.loadCategories()
  await fetchData()
})
</script>
