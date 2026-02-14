<template>
  <v-container>
    <h2 class="text-h5 text-primary mb-6">Dashboard</h2>

    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card class="pa-5">
          <div class="text-caption text-medium-emphasis">Ventas Hoy</div>
          <div class="text-h5 font-weight-bold mt-1">{{ formatCOP(stats.ventas_hoy) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-5">
          <div class="text-caption text-medium-emphasis">Ventas del Mes</div>
          <div class="text-h5 font-weight-bold mt-1">{{ formatCOP(stats.ventas_mes) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-5">
          <div class="text-caption text-medium-emphasis">Facturas Hoy</div>
          <div class="text-h5 font-weight-bold mt-1">{{ stats.facturas_hoy }}</div>
        </v-card>
      </v-col>
    </v-row>

    <h3 class="text-h6 text-primary mb-3">Productos con Stock Bajo</h3>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="lowStock"
        :items-per-page="10"
        no-data-text="No hay productos con stock bajo."
      >
        <template #item.stock="{ item }">
          <span class="text-error font-weight-bold">{{ item.stock }}</span>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { formatCOP } from '@core/utils/format'
import { notifyApiError } from '@core/utils/notify'
import { fetchDashboard } from '../services/dashboard.service'
import type { Product } from '@core/types/models'

const stats = ref({ ventas_hoy: 0, ventas_mes: 0, facturas_hoy: 0 })
const lowStock = ref<Product[]>([])
const loading = ref(false)

const headers = [
  { title: 'SKU', key: 'sku' },
  { title: 'Nombre', key: 'name' },
  { title: 'Stock', key: 'stock' },
  { title: 'Stock Mín.', key: 'minimum_stock' },
]

async function loadDashboard() {
  loading.value = true
  try {
    const data = await fetchDashboard()
    stats.value = {
      ventas_hoy: Number(data.ventas_hoy ?? 0),
      ventas_mes: Number(data.ventas_mes ?? 0),
      facturas_hoy: Number(data.facturas_hoy ?? 0),
    }
    lowStock.value = data.productos_stock_bajo ?? []
  } catch (err: unknown) {
    notifyApiError(err, 'Error al cargar el dashboard')
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
onActivated(loadDashboard)
</script>
