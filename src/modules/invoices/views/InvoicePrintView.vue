<template>
  <div class="print-root">
    <!-- Controles que SE OCULTAN al imprimir -->
    <div class="no-print controls">
      <button class="btn-primary" @click="onPrint">🖨️ Imprimir</button>
      <button class="btn-secondary" @click="setFormat('thermal')" :class="{ active: format === 'thermal' }">Ticket 80 mm</button>
      <button class="btn-secondary" @click="setFormat('a4')" :class="{ active: format === 'a4' }">Hoja A4</button>
      <button class="btn-text" @click="goBack">Cerrar</button>
      <span class="hint">Formato seleccionado: <strong>{{ format === 'thermal' ? 'Ticket 80mm' : 'A4' }}</strong></span>
    </div>

    <div v-if="loading" class="loading">Cargando factura...</div>

    <div v-else-if="invoice" class="ticket" :class="`ticket--${format}`">
      <!-- Header negocio -->
      <header class="ticket-head">
        <h1 class="biz-name">{{ businessName }}</h1>
        <div class="biz-info">
          <div v-if="businessNit">NIT: {{ businessNit }}</div>
          <div v-if="businessAddress">{{ businessAddress }}</div>
          <div v-if="businessPhone">Tel: {{ businessPhone }}</div>
          <div v-if="businessEmail">{{ businessEmail }}</div>
        </div>
      </header>

      <hr />

      <!-- Datos factura -->
      <section class="meta">
        <div class="meta-row"><span>Factura N°:</span><strong>{{ invoice.invoice_number ?? invoice.id }}</strong></div>
        <div class="meta-row"><span>Fecha:</span><span>{{ formatDate(invoice.created_at) }}</span></div>
        <div class="meta-row" v-if="invoice.client">
          <span>Cliente:</span><span>{{ invoice.client.name }}</span>
        </div>
        <div class="meta-row" v-if="invoice.client?.document_number">
          <span>Doc:</span><span>{{ invoice.client.document_type }} {{ invoice.client.document_number }}</span>
        </div>
        <div class="meta-row"><span>Estado:</span><strong>{{ statusLabel(invoice.status) }}</strong></div>
      </section>

      <hr />

      <!-- Items -->
      <table class="items">
        <thead>
          <tr>
            <th class="col-qty">Cant</th>
            <th class="col-name">Producto</th>
            <th class="col-money">Unit</th>
            <th class="col-money">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(it, idx) in invoice.items" :key="idx">
            <td class="col-qty">{{ it.quantity }}</td>
            <td class="col-name">{{ it.product?.name ?? 'Producto #' + it.product_id }}</td>
            <td class="col-money">{{ formatCOP(it.unit_price) }}</td>
            <td class="col-money">{{ formatCOP(it.subtotal ?? it.quantity * it.unit_price) }}</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <!-- Totales -->
      <section class="totals">
        <div class="total-row"><span>Subtotal:</span><span>{{ formatCOP(invoice.subtotal) }}</span></div>
        <div class="total-row"><span>IVA 19%:</span><span>{{ formatCOP(calculatedTax) }}</span></div>
        <div class="total-row grand"><span>TOTAL:</span><strong>{{ formatCOP(invoice.total) }}</strong></div>
      </section>

      <hr />

      <footer class="ticket-foot">
        <div>¡Gracias por su compra!</div>
        <div class="small">Atendido por: {{ invoice.user?.name ?? '—' }}</div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCOP, formatDate } from '@core/utils/format'
import { useAuthStore } from '@modules/auth/store/auth.store'
import * as invoiceService from '../services/invoice.service'
import type { Invoice, InvoiceStatus } from '@core/types/models'

type PrintFormat = 'thermal' | 'a4'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const invoice = ref<Invoice | null>(null)
const loading = ref(true)
const format = ref<PrintFormat>(
  (route.query.format as PrintFormat) === 'a4' ? 'a4' : 'thermal'
)

const businessName = computed(() => authStore.business?.name ?? 'POS Jamz')
const businessNit = computed(() => authStore.business?.nit ?? '')
const businessAddress = computed(() => authStore.business?.address ?? '')
const businessPhone = computed(() => authStore.business?.phone ?? '')
const businessEmail = computed(() => authStore.business?.email ?? '')

const calculatedTax = computed(() => {
  if (!invoice.value) return 0
  const tax = Number(invoice.value.tax ?? 0)
  if (tax > 0) return tax
  return Number(invoice.value.total ?? 0) - Number(invoice.value.subtotal ?? 0)
})

const statusLabel = (s: InvoiceStatus): string =>
  ({ completed: 'Completada', cancelled: 'Cancelada' })[s] || s

function setFormat(f: PrintFormat): void {
  format.value = f
}

function onPrint(): void {
  // Pequeña pausa para que el DOM reaccione al cambio de formato antes de imprimir
  setTimeout(() => window.print(), 100)
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/invoices')
  }
}

onMounted(async () => {
  try {
    const id = String(route.params.id)
    invoice.value = await invoiceService.fetchInvoice(id)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.print-root {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 16px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
.controls .hint { font-size: 13px; color: #666; margin-left: auto; }
.controls button {
  padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;
  font-size: 14px; font-weight: 500;
}
.btn-primary { background: #4f46e5; color: white; }
.btn-primary:hover { background: #4338ca; }
.btn-secondary { background: #e5e7eb; color: #1f2937; }
.btn-secondary:hover { background: #d1d5db; }
.btn-secondary.active { background: #4f46e5; color: white; }
.btn-text { background: transparent; color: #6b7280; }

.loading { text-align: center; padding: 48px; color: #6b7280; }

/* === Ticket common === */
.ticket {
  background: white;
  margin: 0 auto;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Consolas', 'Courier New', monospace;
  color: #111;
}
.ticket-head { text-align: center; margin-bottom: 8px; }
.biz-name { font-size: 18px; margin: 0 0 4px; font-weight: 700; }
.biz-info { font-size: 11px; line-height: 1.4; color: #444; }
.meta { font-size: 12px; }
.meta-row { display: flex; justify-content: space-between; margin: 2px 0; }
.meta-row span:first-child { color: #555; }
hr { border: 0; border-top: 1px dashed #999; margin: 8px 0; }
.items { width: 100%; border-collapse: collapse; font-size: 11px; }
.items th { text-align: left; padding: 4px 2px; border-bottom: 1px solid #ddd; font-weight: 600; }
.items td { padding: 3px 2px; vertical-align: top; }
.col-qty { text-align: center; width: 30px; }
.col-name { word-break: break-word; }
.col-money { text-align: right; white-space: nowrap; }
.totals { font-size: 13px; }
.total-row { display: flex; justify-content: space-between; margin: 3px 0; }
.total-row.grand { font-size: 16px; font-weight: 700; margin-top: 6px; padding-top: 6px; border-top: 2px solid #111; }
.ticket-foot { text-align: center; font-size: 11px; color: #555; margin-top: 8px; }
.ticket-foot .small { font-size: 10px; margin-top: 4px; color: #888; }

/* === Thermal 80 mm === */
.ticket--thermal {
  width: 80mm;
  max-width: 80mm;
  padding: 5mm 4mm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.ticket--thermal .biz-name { font-size: 14px; }
.ticket--thermal .biz-info { font-size: 9px; }
.ticket--thermal .items { font-size: 10px; }
.ticket--thermal .total-row.grand { font-size: 14px; }

/* === A4 === */
.ticket--a4 {
  width: 210mm;
  max-width: 210mm;
  min-height: 270mm;
  padding: 25mm 20mm;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.ticket--a4 .biz-name { font-size: 24px; }
.ticket--a4 .biz-info { font-size: 13px; }
.ticket--a4 .meta { font-size: 14px; }
.ticket--a4 .items { font-size: 13px; }
.ticket--a4 .items th { padding: 8px 4px; }
.ticket--a4 .items td { padding: 6px 4px; }
.ticket--a4 .totals { font-size: 15px; }
.ticket--a4 .total-row.grand { font-size: 20px; }

/* === Print rules === */
@media print {
  .no-print { display: none !important; }
  .print-root { background: white; padding: 0; }
  .ticket { box-shadow: none !important; margin: 0 !important; }

  /* Thermal: forzamos rollito */
  .ticket--thermal {
    width: 80mm !important;
    padding: 0 4mm !important;
  }
  /* Use @page rule appropriate for selected paper.
     Browser print dialog will let user pick the actual paper. */
}

@page {
  margin: 0;
}
</style>
