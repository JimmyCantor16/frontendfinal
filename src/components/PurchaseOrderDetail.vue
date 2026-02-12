<template>
  <div class="po-detail">
    <router-link to="/purchase-orders" class="back-link">&larr; Volver a órdenes</router-link>

    <div v-if="order" class="detail-card">
      <h2>Orden #{{ order.order_number ?? order.id }}</h2>

      <div class="info-grid">
        <div><strong>Proveedor:</strong> {{ order.supplier?.name }}</div>
        <div><strong>Estado:</strong> <span class="badge" :class="'badge-' + order.status">{{ statusLabel(order.status) }}</span></div>
        <div><strong>Fecha:</strong> {{ formatDate(order.created_at) }}</div>
        <div><strong>Subtotal:</strong> {{ formatCOP(order.subtotal) }}</div>
        <div><strong>IVA:</strong> {{ formatCOP(order.tax) }}</div>
        <div><strong>Total:</strong> {{ formatCOP(order.total) }}</div>
      </div>

      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Costo Unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.id">
            <td>{{ item.product?.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCOP(item.unit_cost) }}</td>
            <td>{{ formatCOP(item.subtotal ?? item.quantity * item.unit_cost) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="order.status === 'pending'" class="detail-actions">
        <button class="btn-receive" @click="receive">Recibir Orden</button>
        <button class="btn-cancel-order" @click="cancel">Cancelar Orden</button>
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
const order = ref(null)

const formatCOP = (v) => '$ ' + Number(v || 0).toLocaleString('es-CO')
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : ''
const statusLabel = (s) => ({ pending: 'Pendiente', received: 'Recibida', cancelled: 'Cancelada' })[s] || s

const fetchOrder = async () => {
  try {
    const { data } = await api.get(`/purchase-orders/${route.params.id}`)
    order.value = data.data ?? data
  } catch {
    router.push('/purchase-orders')
  }
}

const receive = async () => {
  const result = await Swal.fire({
    title: '¿Recibir esta orden?',
    text: 'Se actualizará el stock de los productos',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#42b983',
    confirmButtonText: 'Recibir',
    cancelButtonText: 'Cancelar'
  })
  if (result.isConfirmed) {
    try {
      await api.patch(`/purchase-orders/${order.value.id}/receive`)
      Swal.fire({ icon: 'success', title: 'Orden recibida', timer: 1200, showConfirmButton: false })
      fetchOrder()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al recibir' })
    }
  }
}

const cancel = async () => {
  const result = await Swal.fire({
    title: '¿Cancelar esta orden?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No'
  })
  if (result.isConfirmed) {
    try {
      await api.patch(`/purchase-orders/${order.value.id}/cancel`)
      Swal.fire({ icon: 'success', title: 'Orden cancelada', timer: 1200, showConfirmButton: false })
      fetchOrder()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al cancelar' })
    }
  }
}

onMounted(() => fetchOrder())
</script>

<style scoped>
.po-detail { max-width: 800px; }
.back-link { color: #4f46e5; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 16px; }
.back-link:hover { text-decoration: underline; }

h2 { color: #4f46e5; margin-bottom: 16px; }
h3 { color: #4f46e5; margin: 20px 0 10px; }

.detail-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.info-grid div { font-size: 14px; }

.badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-received { background: #d1fae5; color: #065f46; }
.badge-cancelled { background: #fee2e2; color: #991b1b; }

table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
tr:hover td { background: #f9fafb; }

.detail-actions { display: flex; gap: 10px; margin-top: 16px; }
.btn-receive { background: #42b983; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-receive:hover { background: #38a169; }
.btn-cancel-order { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-cancel-order:hover { background: #b91c1c; }
</style>
