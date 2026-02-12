<template>
  <div class="po-list">
    <h2>Órdenes de Compra</h2>

    <div class="toolbar">
      <button class="btn-primary" @click="openForm()">+ Nueva Orden</button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>Nueva Orden de Compra</h3>
      <form @submit.prevent="save">
        <label>Proveedor</label>
        <select v-model="form.supplier_id" required>
          <option value="">Seleccione...</option>
          <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>

        <h4>Items</h4>
        <div v-for="(item, i) in form.items" :key="i" class="item-row">
          <select v-model="item.product_id" required>
            <option value="">Producto...</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <input v-model.number="item.quantity" type="number" min="1" placeholder="Cant." required class="input-sm" />
          <input v-model.number="item.unit_cost" type="number" step="0.01" min="0" placeholder="Costo unit." required class="input-sm" />
          <button type="button" class="btn-remove" @click="removeItem(i)">X</button>
        </div>
        <button type="button" class="btn-add" @click="addItem">+ Agregar item</button>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Crear Orden</button>
          <button type="button" class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
      </form>
    </div>

    <table>
      <thead>
        <tr>
          <th># Orden</th>
          <th>Proveedor</th>
          <th>Estado</th>
          <th>Subtotal</th>
          <th>IVA</th>
          <th>Total</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td>{{ o.order_number ?? o.id }}</td>
          <td>{{ o.supplier?.name }}</td>
          <td><span class="badge" :class="'badge-' + o.status">{{ statusLabel(o.status) }}</span></td>
          <td>{{ formatCOP(o.subtotal) }}</td>
          <td>{{ formatCOP(o.tax) }}</td>
          <td>{{ formatCOP(o.total) }}</td>
          <td>{{ formatDate(o.created_at) }}</td>
          <td>
            <router-link :to="`/purchase-orders/${o.id}`" class="btn-view">Ver</router-link>
          </td>
        </tr>
        <tr v-if="!orders.length">
          <td colspan="8" class="empty">No hay órdenes de compra.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const orders = ref([])
const suppliers = ref([])
const products = ref([])
const showForm = ref(false)
const form = ref({ supplier_id: '', items: [] })

const formatCOP = (v) => '$ ' + Number(v || 0).toLocaleString('es-CO')
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : ''
const statusLabel = (s) => ({ pending: 'Pendiente', received: 'Recibida', cancelled: 'Cancelada' })[s] || s

const fetchData = async () => {
  const { data } = await api.get('/purchase-orders')
  orders.value = data.data ?? data
}

const openForm = async () => {
  const [supRes, prodRes] = await Promise.all([
    api.get('/suppliers'),
    api.get('/products')
  ])
  suppliers.value = supRes.data.data ?? supRes.data
  products.value = prodRes.data.data ?? prodRes.data
  form.value = { supplier_id: '', items: [{ product_id: '', quantity: 1, unit_cost: 0 }] }
  showForm.value = true
}

const addItem = () => {
  form.value.items.push({ product_id: '', quantity: 1, unit_cost: 0 })
}

const removeItem = (i) => {
  if (form.value.items.length > 1) form.value.items.splice(i, 1)
}

const save = async () => {
  try {
    await api.post('/purchase-orders', form.value)
    Swal.fire({ icon: 'success', title: 'Orden creada', timer: 1200, showConfirmButton: false })
    showForm.value = false
    fetchData()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al crear orden' })
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.po-list { max-width: 1100px; }
h2 { color: #4f46e5; margin-bottom: 16px; }
h3 { color: #4f46e5; margin: 0 0 12px; }
h4 { margin: 12px 0 8px; color: #374151; }

.toolbar { display: flex; margin-bottom: 16px; }

.form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; max-width: 600px; }
.form-card label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
.form-card select { width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; }

.item-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.item-row select { flex: 2; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; }
.input-sm { width: 100px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; }
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
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-received { background: #d1fae5; color: #065f46; }
.badge-cancelled { background: #fee2e2; color: #991b1b; }

.btn-view { background: #4f46e5; color: white; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 13px; }
.empty { text-align: center; color: #6b7280; font-style: italic; }
</style>
