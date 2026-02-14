<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Reporte Diario</h2>
      <v-text-field
        v-model="selectedDate"
        type="date"
        label="Fecha"
        hide-details
        style="max-width: 200px"
        @update:model-value="loadReport"
      />
    </div>

    <div v-if="loading" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <template v-else-if="report">
      <!-- Summary cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-5">
            <div class="d-flex align-center ga-3">
              <v-avatar color="success" size="48">
                <v-icon>mdi-cash-multiple</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Total Ventas</div>
                <div class="text-h5 font-weight-bold">{{ formatCOP(report.ventas_totales) }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-5">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" size="48">
                <v-icon>mdi-receipt</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Órdenes POS</div>
                <div class="text-h5 font-weight-bold">{{ report.ordenes_pos.total }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-5">
            <div class="d-flex align-center ga-3">
              <v-avatar color="info" size="48">
                <v-icon>mdi-file-document</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Facturas</div>
                <div class="text-h5 font-weight-bold">{{ report.facturas.total }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-5">
            <div class="d-flex align-center ga-3">
              <v-avatar color="warning" size="48">
                <v-icon>mdi-alert-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-medium-emphasis">Stock Bajo</div>
                <div class="text-h5 font-weight-bold">{{ report.productos_stock_bajo }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- Sales by payment method (POS) -->
        <v-col cols="12" md="5">
          <v-card class="pa-6">
            <v-card-title class="text-h6 text-primary px-0 pt-0">
              Ventas POS por Método de Pago
            </v-card-title>

            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-body-1 text-medium-emphasis">Total POS:</span>
              <span class="text-h6 font-weight-bold text-success">{{ formatCOP(report.ordenes_pos.ventas) }}</span>
            </div>

            <v-list density="compact">
              <v-list-item v-for="method in paymentMethodRows" :key="method.key">
                <template #prepend>
                  <v-icon :color="method.color" class="mr-3">{{ method.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ method.label }}</v-list-item-title>
                <template #append>
                  <span class="font-weight-bold">{{ formatCOP(method.amount) }}</span>
                </template>
              </v-list-item>
            </v-list>

            <v-divider class="my-3" />

            <!-- Visual bar breakdown -->
            <div v-for="method in paymentMethodRows" :key="'bar-' + method.key" class="mb-2">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>{{ method.label }}</span>
                <span>{{ methodPercentage(method.amount) }}%</span>
              </div>
              <v-progress-linear
                :model-value="report.ordenes_pos.ventas ? (Number(method.amount) / Number(report.ordenes_pos.ventas)) * 100 : 0"
                :color="method.color"
                height="8"
                rounded
              />
            </div>

            <!-- Facturas section -->
            <v-divider class="my-4" />
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center ga-2">
                <v-icon color="info">mdi-file-document</v-icon>
                <span class="text-body-1">Facturas</span>
              </div>
              <span class="font-weight-bold">{{ formatCOP(report.facturas.ventas) }}</span>
            </div>
          </v-card>
        </v-col>

        <!-- Cajas del día -->
        <v-col cols="12" md="7">
          <v-card>
            <v-card-title class="text-h6 text-primary">
              Cajas del Día
            </v-card-title>
            <v-data-table
              :headers="cajasHeaders"
              :items="report.cajas"
              :items-per-page="5"
              no-data-text="No hubo cajas abiertas este día."
              density="compact"
            >
              <template #item.status="{ item }">
                <v-chip
                  :color="item.status === 'open' ? 'success' : 'grey'"
                  size="small"
                  variant="flat"
                >
                  {{ item.status === 'open' ? 'Abierta' : 'Cerrada' }}
                </v-chip>
              </template>
              <template #item.opening_amount="{ item }">
                {{ formatCOP(item.opening_amount) }}
              </template>
              <template #item.total_sales="{ item }">
                {{ formatCOP(item.total_sales) }}
              </template>
              <template #item.opened_at="{ item }">
                {{ formatTime(item.opened_at) }}
              </template>
              <template #item.user="{ item }">
                {{ item.user?.name ?? '—' }}
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-card v-else class="pa-12 text-center">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-chart-bar</v-icon>
      <div class="text-h6 text-medium-emphasis">Sin datos para esta fecha</div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatCOP } from '@core/utils/format'
import { notifyApiError } from '@core/utils/notify'
import { fetchDailyReport } from '../services/report.service'
import type { DailyReport } from '../types/reports.types'

const report = ref<DailyReport | null>(null)
const loading = ref(false)
const selectedDate = ref(new Date().toISOString().slice(0, 10))

const cajasHeaders = [
  { title: 'Estado', key: 'status', width: 100 },
  { title: 'Apertura', key: 'opening_amount', width: 120 },
  { title: 'Ventas', key: 'total_sales', width: 120 },
  { title: 'Hora', key: 'opened_at', width: 100 },
  { title: 'Usuario', key: 'user' },
]

const paymentMethodRows = computed(() => {
  const pos = report.value?.ordenes_pos
  if (!pos) return []
  return [
    { key: 'efectivo', label: 'Efectivo', icon: 'mdi-cash', color: 'success', amount: pos.efectivo },
    { key: 'tarjeta', label: 'Tarjeta', icon: 'mdi-credit-card', color: 'info', amount: pos.tarjeta },
    { key: 'transferencia', label: 'Transferencia', icon: 'mdi-bank-transfer', color: 'primary', amount: pos.transferencia },
    { key: 'qr', label: 'QR', icon: 'mdi-qrcode', color: 'warning', amount: pos.qr },
  ]
})

function methodPercentage(amount: number): string {
  const totalPos = Number(report.value?.ordenes_pos?.ventas ?? 0)
  if (!totalPos) return '0'
  return ((Number(amount) / totalPos) * 100).toFixed(1)
}

function formatTime(d: string | undefined | null): string {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

async function loadReport() {
  loading.value = true
  try {
    report.value = await fetchDailyReport(selectedDate.value)
  } catch (err: unknown) {
    report.value = null
    notifyApiError(err, 'Error al cargar reporte')
  } finally {
    loading.value = false
  }
}

onMounted(() => loadReport())
</script>
