<template>
  <div class="category-list">
    <h2>Categorías</h2>

    <div class="toolbar">
      <input v-model="search" placeholder="Buscar categoría..." class="search-input" />
      <button class="btn-primary" @click="openForm()">+ Nueva Categoría</button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>{{ editingId ? 'Editar' : 'Nueva' }} Categoría</h3>
      <form @submit.prevent="save">
        <label>Nombre</label>
        <input v-model="form.name" required />
        <label>Descripción</label>
        <textarea v-model="form.description" rows="3"></textarea>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Guardar</button>
          <button type="button" class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
      </form>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in filtered" :key="cat.id">
          <td>{{ cat.name }}</td>
          <td>{{ cat.description }}</td>
          <td class="actions">
            <button class="btn-edit" @click="edit(cat)">Editar</button>
            <button class="btn-delete" @click="remove(cat.id)">Eliminar</button>
          </td>
        </tr>
        <tr v-if="!filtered.length">
          <td colspan="3" class="empty">No se encontraron categorías.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const categories = ref([])
const search = ref('')
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', description: '' })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return categories.value
  return categories.value.filter(c => c.name.toLowerCase().includes(q))
})

const fetchData = async () => {
  const { data } = await api.get('/categories')
  categories.value = data.data ?? data
}

const openForm = () => {
  editingId.value = null
  form.value = { name: '', description: '' }
  showForm.value = true
}

const edit = (cat) => {
  editingId.value = cat.id
  form.value = { name: cat.name, description: cat.description || '' }
  showForm.value = true
}

const save = async () => {
  try {
    if (editingId.value) {
      await api.put(`/categories/${editingId.value}`, form.value)
      Swal.fire({ icon: 'success', title: 'Categoría actualizada', timer: 1200, showConfirmButton: false })
    } else {
      await api.post('/categories', form.value)
      Swal.fire({ icon: 'success', title: 'Categoría creada', timer: 1200, showConfirmButton: false })
    }
    showForm.value = false
    fetchData()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al guardar' })
  }
}

const remove = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar categoría?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  })
  if (result.isConfirmed) {
    try {
      await api.delete(`/categories/${id}`)
      Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1200, showConfirmButton: false })
      fetchData()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo eliminar' })
    }
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.category-list { max-width: 800px; }
h2 { color: #4f46e5; margin-bottom: 16px; }
h3 { color: #4f46e5; margin: 0 0 12px; }

.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; }
.search-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; width: 260px; }

.form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; max-width: 500px; }
.form-card label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
.form-card input, .form-card textarea { width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 4px; font-family: inherit; box-sizing: border-box; }
.form-actions { display: flex; gap: 8px; }

.btn-primary { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-primary:hover { background: #4338ca; }
.btn-cancel { background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-edit { background: #f59e0b; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-delete { background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }

table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
tr:hover td { background: #f9fafb; }
.actions { display: flex; gap: 6px; }
.empty { text-align: center; color: #6b7280; font-style: italic; }
</style>
