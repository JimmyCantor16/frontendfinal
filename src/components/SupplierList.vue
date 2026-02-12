<template>
  <div class="supplier-list">
    <h2>Proveedores</h2>

    <div class="toolbar">
      <input v-model="search" placeholder="Buscar por nombre o NIT..." class="search-input" />
      <button class="btn-primary" @click="openForm()">+ Nuevo Proveedor</button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>{{ editingId ? 'Editar' : 'Nuevo' }} Proveedor</h3>
      <form @submit.prevent="save">
        <label>Nombre</label>
        <input v-model="form.name" required />
        <label>NIT</label>
        <input v-model="form.nit" required />
        <label>Teléfono</label>
        <input v-model="form.phone" />
        <label>Email</label>
        <input v-model="form.email" type="email" />
        <label>Persona de Contacto</label>
        <input v-model="form.contact_person" />
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
          <th>Nombre</th>
          <th>NIT</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Contacto</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in filtered" :key="s.id">
          <td>{{ s.name }}</td>
          <td>{{ s.nit }}</td>
          <td>{{ s.phone }}</td>
          <td>{{ s.email }}</td>
          <td>{{ s.contact_person }}</td>
          <td>{{ s.is_active ? 'Sí' : 'No' }}</td>
          <td class="actions">
            <button class="btn-edit" @click="edit(s)">Editar</button>
            <button class="btn-delete" @click="remove(s.id)">Eliminar</button>
          </td>
        </tr>
        <tr v-if="!filtered.length">
          <td colspan="7" class="empty">No se encontraron proveedores.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const suppliers = ref([])
const search = ref('')
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', nit: '', phone: '', email: '', contact_person: '', is_active: true })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return suppliers.value
  return suppliers.value.filter(s =>
    s.name.toLowerCase().includes(q) || (s.nit && s.nit.toLowerCase().includes(q))
  )
})

const fetchData = async () => {
  const { data } = await api.get('/suppliers')
  suppliers.value = data.data ?? data
}

const openForm = () => {
  editingId.value = null
  form.value = { name: '', nit: '', phone: '', email: '', contact_person: '', is_active: true }
  showForm.value = true
}

const edit = (s) => {
  editingId.value = s.id
  form.value = {
    name: s.name,
    nit: s.nit || '',
    phone: s.phone || '',
    email: s.email || '',
    contact_person: s.contact_person || '',
    is_active: s.is_active ?? true
  }
  showForm.value = true
}

const save = async () => {
  try {
    if (editingId.value) {
      await api.put(`/suppliers/${editingId.value}`, form.value)
      Swal.fire({ icon: 'success', title: 'Proveedor actualizado', timer: 1200, showConfirmButton: false })
    } else {
      await api.post('/suppliers', form.value)
      Swal.fire({ icon: 'success', title: 'Proveedor creado', timer: 1200, showConfirmButton: false })
    }
    showForm.value = false
    fetchData()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al guardar' })
  }
}

const remove = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar proveedor?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  })
  if (result.isConfirmed) {
    try {
      await api.delete(`/suppliers/${id}`)
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
.supplier-list { max-width: 1000px; }
h2 { color: #4f46e5; margin-bottom: 16px; }
h3 { color: #4f46e5; margin: 0 0 12px; }

.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; }
.search-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; width: 280px; }

.form-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; max-width: 500px; }
.form-card label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
.form-card input[type="text"], .form-card input[type="email"], .form-card input:not([type="checkbox"]) { width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; }
.form-card input[type="checkbox"] { width: auto; margin-right: 6px; }
.form-actions { display: flex; gap: 8px; margin-top: 8px; }

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
