<template>
  <div class="product-list">
    <h2>Productos</h2>

    <div class="toolbar">
      <input v-model="search" placeholder="Buscar producto..." class="search-input" />
      <select v-model="filterCategory" class="filter-select">
        <option value="">Todas las categorías</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <label class="filter-check">
        <input type="checkbox" v-model="filterLowStock" /> Stock bajo
      </label>
      <button class="btn-primary" @click="openForm()">+ Nuevo Producto</button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>{{ editingId ? 'Editar' : 'Nuevo' }} Producto</h3>
      <form @submit.prevent="save">
        <label>SKU</label>
        <input v-model="form.sku" required />
        <label>Nombre</label>
        <input v-model="form.name" required />
        <label>Descripción</label>
        <textarea v-model="form.description" rows="2"></textarea>
        <label>Categoría</label>
        <select v-model="form.category_id" required>
          <option value="">Seleccione...</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <label>Precio de Compra</label>
        <input v-model.number="form.purchase_price" type="number" step="0.01" min="0" required />
        <label>Precio de Venta</label>
        <input v-model.number="form.sale_price" type="number" step="0.01" min="0" required />
        <label>Stock</label>
        <input v-model.number="form.stock" type="number" min="0" required />
        <label>Stock Mínimo</label>
        <input v-model.number="form.minimum_stock" type="number" min="0" required />
        <label>
          <input type="checkbox" v-model="form.is_active" /> Activo
        </label>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Guardar</button>
          <button type="button" class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
      </form>
    </div>

    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>P. Compra</th>
          <th>P. Venta</th>
          <th>Stock</th>
          <th>Stock Mín.</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filtered" :key="p.id" :class="{ 'row-low': p.stock <= p.minimum_stock }">
          <td>{{ p.sku }}</td>
          <td>{{ p.name }}</td>
          <td>{{ p.category?.name }}</td>
          <td>{{ formatCOP(p.purchase_price) }}</td>
          <td>{{ formatCOP(p.sale_price) }}</td>
          <td>{{ p.stock }}</td>
          <td>{{ p.minimum_stock }}</td>
          <td>{{ p.is_active ? 'Sí' : 'No' }}</td>
          <td class="actions">
            <button class="btn-edit" @click="edit(p)">Editar</button>
            <button class="btn-delete" @click="remove(p.id)">Eliminar</button>
          </td>
        </tr>
        <tr v-if="!filtered.length">
          <td colspan="9" class="empty">No se encontraron productos.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const products = ref([])
const categories = ref([])
const search = ref('')
const filterCategory = ref('')
const filterLowStock = ref(false)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({
  sku: '', name: '', description: '', category_id: '',
  purchase_price: 0, sale_price: 0, stock: 0, minimum_stock: 0, is_active: true
})

const formatCOP = (v) => '$ ' + Number(v || 0).toLocaleString('es-CO')

const filtered = computed(() => {
  let list = products.value
  const q = search.value.toLowerCase()
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)))
  if (filterCategory.value) list = list.filter(p => p.category_id == filterCategory.value)
  if (filterLowStock.value) list = list.filter(p => p.stock <= p.minimum_stock)
  return list
})

const fetchData = async () => {
  const [prodRes, catRes] = await Promise.all([
    api.get('/products'),
    api.get('/categories')
  ])
  products.value = prodRes.data.data ?? prodRes.data
  categories.value = catRes.data.data ?? catRes.data
}

const openForm = () => {
  editingId.value = null
  form.value = { sku: '', name: '', description: '', category_id: '', purchase_price: 0, sale_price: 0, stock: 0, minimum_stock: 0, is_active: true }
  showForm.value = true
}

const edit = (p) => {
  editingId.value = p.id
  form.value = {
    sku: p.sku, name: p.name, description: p.description || '',
    category_id: p.category_id || '', purchase_price: p.purchase_price,
    sale_price: p.sale_price, stock: p.stock, minimum_stock: p.minimum_stock,
    is_active: p.is_active ?? true
  }
  showForm.value = true
}

const save = async () => {
  try {
    if (editingId.value) {
      await api.put(`/products/${editingId.value}`, form.value)
      Swal.fire({ icon: 'success', title: 'Producto actualizado', timer: 1200, showConfirmButton: false })
    } else {
      await api.post('/products', form.value)
      Swal.fire({ icon: 'success', title: 'Producto creado', timer: 1200, showConfirmButton: false })
    }
    showForm.value = false
    fetchData()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al guardar' })
  }
}

const remove = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar producto?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  })
  if (result.isConfirmed) {
    try {
      await api.delete(`/products/${id}`)
      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1200, showConfirmButton: false })
      fetchData()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo eliminar' })
    }
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.product-list { max-width: 1200px; }
h2 { color: #4f46e5; margin-bottom: 16px; }
h3 { color: #4f46e5; margin: 0 0 12px; }

.toolbar { display: flex; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.search-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; width: 220px; }
.filter-select { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; }
.filter-check { display: flex; align-items: center; gap: 4px; font-size: 14px; white-space: nowrap; }
.filter-check input { width: auto; margin: 0; }

.form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; max-width: 500px; }
.form-card label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
.form-card input:not([type="checkbox"]), .form-card select, .form-card textarea { width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; font-family: inherit; }
.form-card input[type="checkbox"] { width: auto; margin-right: 6px; }
.form-actions { display: flex; gap: 8px; margin-top: 8px; }

.btn-primary { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; white-space: nowrap; }
.btn-primary:hover { background: #4338ca; }
.btn-cancel { background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-edit { background: #f59e0b; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-delete { background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }

table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; font-size: 13px; white-space: nowrap; }
td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
tr:hover td { background: #f9fafb; }
.row-low td { background: #fef2f2; }
.actions { display: flex; gap: 6px; }
.empty { text-align: center; color: #6b7280; font-style: italic; }
</style>
