<template>
  <div class="invoice-list">
    <h2>Facturas</h2>

    <div class="toolbar">
      <button class="btn-primary" @click="openForm()">+ Nueva Factura</button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>Nueva Factura</h3>
      <form @submit.prevent="save">
        <label>Cliente</label>
        <select v-model="form.client_id" required>
          <option value="">Seleccione...</option>
          <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }} ({{ c.document_number }})</option>
        </select>

        <h4>Items</h4>
        <div v-for="(item, i) in form.items" :key="i" class="item-row">
          <select v-model="item.product_id" required @change="onProductChange(item)">
            <option value="">Producto...</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} ({{ formatCOP(p.sale_price) }})</option>
          </select>
          <input v-model.number="item.quantity" type="number" min="1" placeholder="Cant." required class="input-sm" />
          <span class="item-price">{{ formatCOP(getItemPrice(item)) }}</span>
          <button type="button" class="btn-remove" @click="removeItem(i)">X</button>
        </div>
        <button type="button" class="btn-add" @click="addItem">+ Agregar item</button>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Crear Factura</button>
          <button type="button" class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
      </form>
    </div>

    <table>
      <thead>
        <tr>
          <th># Factura</th>
          <th>Cliente</th>
          <th>Estado</th>
          <th>Subtotal</th>
          <th>IVA</th>
          <th>Total</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inv in invoices" :key="inv.id">
          <td>{{ inv.invoice_number ?? inv.id }}</td>
          <td>{{ inv.client?.name }}</td>
          <td><span class="badge" :class="'badge-' + inv.status">{{ statusLabel(inv.status) }}</span></td>
          <td>{{ formatCOP(inv.subtotal) }}</td>
          <td>{{ formatCOP(inv.tax) }}</td>
          <td>{{ formatCOP(inv.total) }}</td>
          <td>{{ formatDate(inv.created_at) }}</td>
          <td>
            <router-link :to="`/invoices/${inv.id}`" class="btn-view">Ver</router-link>
          </td>
        </tr>
        <tr v-if="!invoices.length">
          <td colspan="8" class="empty">No hay facturas.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const invoices = ref([])
const clients = ref([])
const products = ref([])
const showForm = ref(false)
const form = ref({ client_id: '', items: [] })

const formatCOP = (v) => '$ ' + Number(v || 0).toLocaleString('es-CO')
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : ''
const statusLabel = (s) => ({ completed: 'Completada', cancelled: 'Cancelada' })[s] || s

const getItemPrice = (item) => {
  const prod = products.value.find(p => p.id == item.product_id)
  return prod ? prod.sale_price * (item.quantity || 0) : 0
}

const onProductChange = (item) => {
  const prod = products.value.find(p => p.id == item.product_id)
  if (prod) item.unit_price = prod.sale_price
}

const fetchData = async () => {
  const { data } = await api.get('/invoices')
  invoices.value = data.data ?? data
}

const openForm = async () => {
  const [cliRes, prodRes] = await Promise.all([
    api.get('/clients'),
    api.get('/products')
  ])
  clients.value = cliRes.data.data ?? cliRes.data
  products.value = prodRes.data.data ?? prodRes.data
  form.value = { client_id: '', items: [{ product_id: '', quantity: 1, unit_price: 0 }] }
  showForm.value = true
}

const addItem = () => {
  form.value.items.push({ product_id: '', quantity: 1, unit_price: 0 })
}

const removeItem = (i) => {
  if (form.value.items.length > 1) form.value.items.splice(i, 1)
}

const save = async () => {
  try {
    const payload = {
      client_id: form.value.client_id,
      items: form.value.items.map(item => {
        const prod = products.value.find(p => p.id == item.product_id)
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: prod ? prod.sale_price : item.unit_price
        }
      })
    }
    await api.post('/invoices', payload)
    Swal.fire({ icon: 'success', title: 'Factura creada', timer: 1200, showConfirmButton: false })
    showForm.value = false
    fetchData()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al crear factura' })
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.invoice-list { max-width: 1100px; }
h2 { color: #4f46e5; margin-bottom: 16px; }
h3 { color: #4f46e5; margin: 0 0 12px; }
h4 { margin: 12px 0 8px; color: #374151; }

.toolbar { display: flex; margin-bottom: 16px; }

.form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; max-width: 600px; }
.form-card label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
.form-card select { width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; }

.item-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.item-row select { flex: 2; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; }
.input-sm { width: 80px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; }
.item-price { font-size: 13px; color: #374151; min-width: 100px; }
.btn-remove { background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.btn-add { background: none; color: #4f46e5; border: 1px dashed #4f46e5; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; margin-bottom: 12px; display: block; }

.form-actions { display: flex; gap: 8px; }
.btn-primary { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-primary:hover { background: #4338ca; }
.btn-cancel { background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }

table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
tr:hover td { background: #f9fafb; }

.badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge-completed { background: #d1fae5; color: #065f46; }
.badge-cancelled { background: #fee2e2; color: #991b1b; }

.btn-view { background: #4f46e5; color: white; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 13px; }
.empty { text-align: center; color: #6b7280; font-style: italic; }
</style>
