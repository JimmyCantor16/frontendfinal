<template>
  <div class="invoice-detail">
    <router-link to="/invoices" class="back-link">&larr; Volver a facturas</router-link>

    <div v-if="invoice" class="detail-card">
      <h2>Factura #{{ invoice.invoice_number ?? invoice.id }}</h2>

      <div class="info-grid">
        <div><strong>Cliente:</strong> {{ invoice.client?.name }}</div>
        <div><strong>Documento:</strong> {{ invoice.client?.document_type }} {{ invoice.client?.document_number }}</div>
        <div><strong>Estado:</strong> <span class="badge" :class="'badge-' + invoice.status">{{ statusLabel(invoice.status) }}</span></div>
        <div><strong>Fecha:</strong> {{ formatDate(invoice.created_at) }}</div>
        <div><strong>Subtotal:</strong> {{ formatCOP(invoice.subtotal) }}</div>
        <div><strong>IVA:</strong> {{ formatCOP(invoice.tax) }}</div>
        <div><strong>Total:</strong> {{ formatCOP(invoice.total) }}</div>
      </div>

      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoice.items" :key="item.id">
            <td>{{ item.product?.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCOP(item.unit_price) }}</td>
            <td>{{ formatCOP(item.subtotal ?? item.quantity * item.unit_price) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="invoice.status === 'completed'" class="detail-actions">
        <button class="btn-cancel-invoice" @click="cancelInvoice">Cancelar Factura</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const invoice = ref(null)

const formatCOP = (v) => '$ ' + Number(v || 0).toLocaleString('es-CO')
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : ''
const statusLabel = (s) => ({ completed: 'Completada', cancelled: 'Cancelada' })[s] || s

const fetchInvoice = async () => {
  try {
    const { data } = await api.get(`/invoices/${route.params.id}`)
    invoice.value = data.data ?? data
  } catch {
    router.push('/invoices')
  }
}

const cancelInvoice = async () => {
  const result = await Swal.fire({
    title: '¿Cancelar esta factura?',
    text: 'Se revertirán los cambios en inventario',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No'
  })
  if (result.isConfirmed) {
    try {
      await api.patch(`/invoices/${invoice.value.id}/cancel`)
      Swal.fire({ icon: 'success', title: 'Factura cancelada', timer: 1200, showConfirmButton: false })
      fetchInvoice()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al cancelar' })
    }
  }
}

onMounted(() => fetchInvoice())
</script>

<style scoped>
.invoice-detail { max-width: 800px; }
.back-link { color: #4f46e5; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 16px; }
.back-link:hover { text-decoration: underline; }

h2 { color: #4f46e5; margin-bottom: 16px; }
h3 { color: #4f46e5; margin: 20px 0 10px; }

.detail-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.info-grid div { font-size: 14px; }

.badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge-completed { background: #d1fae5; color: #065f46; }
.badge-cancelled { background: #fee2e2; color: #991b1b; }

table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
tr:hover td { background: #f9fafb; }

.detail-actions { margin-top: 16px; }
.btn-cancel-invoice { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-cancel-invoice:hover { background: #b91c1c; }
</style>
