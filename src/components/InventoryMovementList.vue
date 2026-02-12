<template>
  <div class="inventory-list">
    <h2>Movimientos de Inventario</h2>

    <div class="toolbar">
      <select v-model="filterProduct" class="filter-select">
        <option value="">Todos los productos</option>
        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
      <select v-model="filterType" class="filter-select">
        <option value="">Todos los tipos</option>
        <option value="purchase">Compra</option>
        <option value="sale">Venta</option>
        <option value="adjustment">Ajuste</option>
        <option value="cancellation">Cancelación</option>
      </select>
      <button class="btn-primary" @click="openForm()">+ Ajuste Manual</button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>Ajuste Manual de Inventario</h3>
      <form @submit.prevent="saveAdjustment">
        <label>Producto</label>
        <select v-model="form.product_id" required>
          <option value="">Seleccione...</option>
          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} (Stock actual: {{ p.stock }})</option>
        </select>
        <label>Nuevo Stock</label>
        <input v-model.number="form.new_stock" type="number" min="0" required />
        <label>Razón</label>
        <textarea v-model="form.reason" rows="2" required></textarea>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Aplicar Ajuste</button>
          <button type="button" class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
      </form>
    </div>

    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Usuario</th>
          <th>Tipo</th>
          <th>Cantidad</th>
          <th>Stock Antes</th>
          <th>Stock Después</th>
          <th>Razón</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in filtered" :key="m.id">
          <td>{{ m.product?.name }}</td>
          <td>{{ m.user?.name }}</td>
          <td><span class="badge" :class="'badge-' + m.type">{{ typeLabel(m.type) }}</span></td>
          <td>{{ m.quantity }}</td>
          <td>{{ m.stock_before }}</td>
          <td>{{ m.stock_after }}</td>
          <td>{{ m.reason }}</td>
          <td>{{ formatDate(m.created_at) }}</td>
        </tr>
        <tr v-if="!filtered.length">
          <td colspan="8" class="empty">No hay movimientos.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const movements = ref([])
const products = ref([])
const filterProduct = ref('')
const filterType = ref('')
const showForm = ref(false)
const form = ref({ product_id: '', new_stock: 0, reason: '' })

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO') : ''
const typeLabel = (t) => ({ purchase: 'Compra', sale: 'Venta', adjustment: 'Ajuste', cancellation: 'Cancelación' })[t] || t

const filtered = computed(() => {
  let list = movements.value
  if (filterProduct.value) list = list.filter(m => m.product_id == filterProduct.value)
  if (filterType.value) list = list.filter(m => m.type === filterType.value)
  return list
})

const fetchData = async () => {
  const [movRes, prodRes] = await Promise.all([
    api.get('/inventory-movements'),
    api.get('/products')
  ])
  movements.value = movRes.data.data ?? movRes.data
  products.value = prodRes.data.data ?? prodRes.data
}

const openForm = () => {
  form.value = { product_id: '', new_stock: 0, reason: '' }
  showForm.value = true
}

const saveAdjustment = async () => {
  try {
    await api.post('/inventory-movements/adjust', form.value)
    Swal.fire({ icon: 'success', title: 'Ajuste aplicado', timer: 1200, showConfirmButton: false })
    showForm.value = false
    fetchData()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al ajustar' })
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.inventory-list { max-width: 1200px; }
h2 { color: #4f46e5; margin-bottom: 16px; }
h3 { color: #4f46e5; margin: 0 0 12px; }

.toolbar { display: flex; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.filter-select { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; }

.form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; max-width: 500px; }
.form-card label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
.form-card input, .form-card select, .form-card textarea { width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; font-family: inherit; }
.form-actions { display: flex; gap: 8px; margin-top: 8px; }

.btn-primary { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; white-space: nowrap; }
.btn-primary:hover { background: #4338ca; }
.btn-cancel { background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }

table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; font-size: 13px; white-space: nowrap; }
td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
tr:hover td { background: #f9fafb; }

.badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge-purchase { background: #dbeafe; color: #1e40af; }
.badge-sale { background: #d1fae5; color: #065f46; }
.badge-adjustment { background: #fef3c7; color: #92400e; }
.badge-cancellation { background: #fee2e2; color: #991b1b; }

.empty { text-align: center; color: #6b7280; font-style: italic; }
</style>
