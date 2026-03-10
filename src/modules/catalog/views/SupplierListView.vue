<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Proveedores</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openForm">
        Nuevo Proveedor
      </v-btn>
    </div>

    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="Buscar por nombre o NIT..."
      single-line
      hide-details
      class="mb-4"
      style="max-width: 400px"
    />

    <v-dialog v-model="showForm" max-width="500" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">
          {{ editingId ? 'Editar' : 'Nuevo' }} Proveedor
        </v-card-title>
        <v-form @submit.prevent="save">
          <v-text-field v-model="form.name" label="Nombre" :rules="[r => !!r || 'Requerido']" class="mb-2" />
          <v-text-field v-model="form.nit" label="NIT" :rules="[r => !!r || 'Requerido', r => /^[\d\-]{5,20}$/.test(r) || 'NIT inválido (solo dígitos y guiones, 5-20 caracteres)']" class="mb-2" />
          <v-text-field v-model="form.phone" label="Teléfono" class="mb-2" />
          <v-text-field v-model="form.email" label="Email" type="email" :rules="[v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email no válido']" class="mb-2" />
          <v-text-field v-model="form.contact_person" label="Persona de Contacto" class="mb-2" />
          <v-checkbox v-model="form.is_active" label="Activo" hide-details />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Guardar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Low stock alert -->
    <v-card v-if="lowStockProducts.length" class="mb-4 pa-4" variant="outlined" color="warning">
      <div class="d-flex align-center mb-3">
        <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
        <span class="text-subtitle-1 font-weight-bold">Productos con stock bajo — Sugeridos para compra</span>
      </div>
      <v-data-table
        :headers="lowStockHeaders"
        :items="lowStockProducts"
        density="compact"
        :items-per-page="5"
        no-data-text="Sin productos con stock bajo."
      >
        <template #item.stock="{ item }">
          <v-chip :color="item.stock === 0 ? 'error' : 'warning'" size="small" variant="flat">
            {{ item.stock }}
          </v-chip>
        </template>
        <template #item.minimum_stock="{ item }">{{ item.minimum_stock }}</template>
        <template #item.purchase_price="{ item }">{{ formatCOP(item.purchase_price) }}</template>
      </v-data-table>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="filtered"
        :items-per-page="10"
        :loading="loading"
        no-data-text="No se encontraron proveedores."
      >
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
import { filterLowStockProducts } from '@core/utils/product'
import { useInventoryStore } from '@modules/inventory/store/inventory.store'
import type { Supplier, Product } from '@core/types/models'
import type { SupplierForm } from '../types/catalog.types'

const inventoryStore = useInventoryStore()
const allProducts = ref<Product[]>([])

const lowStockProducts = computed(() => filterLowStockProducts(allProducts.value))

const lowStockHeaders = [
  { title: 'SKU', key: 'sku' },
  { title: 'Producto', key: 'name' },
  { title: 'Stock Actual', key: 'stock', width: 120 },
  { title: 'Stock Mín.', key: 'minimum_stock', width: 120 },
  { title: 'Costo Compra', key: 'purchase_price', width: 140 },
]

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'NIT', key: 'nit' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Email', key: 'email' },
  { title: 'Contacto', key: 'contact_person' },
  { title: 'Activo', key: 'is_active', width: 80 },
  { title: 'Acciones', key: 'actions', sortable: false, width: 120 },
]

const {
  search, showForm, editingId, form, filtered, loading,
  fetchData, openForm, editItem, save, remove,
} = useCrud<Supplier, SupplierForm>({
  endpoint: '/suppliers',
  entityName: 'Proveedor',
  defaultForm: () => ({ name: '', nit: '', phone: '', email: '', contact_person: '', is_active: true }),
  searchFilter: (item, q) =>
    item.name.toLowerCase().includes(q) || (item.nit?.toLowerCase().includes(q) ?? false),
})

function onEdit(s: Supplier) {
  editItem(s, (sup) => ({
    name: sup.name,
    nit: sup.nit || '',
    phone: sup.phone || '',
    email: sup.email || '',
    contact_person: sup.contact_person || '',
    is_active: sup.is_active ?? true,
  }))
}

onMounted(async () => {
  const results = await Promise.allSettled([
    fetchData(),
    inventoryStore.loadProducts(),
  ])
  if (results[1].status === 'fulfilled') {
    allProducts.value = inventoryStore.products
  }
})
</script>
