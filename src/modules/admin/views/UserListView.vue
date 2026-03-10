<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Usuarios</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">
        Nuevo Usuario
      </v-btn>
    </div>

    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="Buscar por nombre o email..."
      single-line
      hide-details
      class="mb-4"
      style="max-width: 400px"
    />

    <v-dialog v-model="showForm" max-width="500" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">
          {{ editingId ? 'Editar' : 'Nuevo' }} Usuario
        </v-card-title>
        <v-form ref="formRef" @submit.prevent="save">
          <v-text-field
            v-model="form.name"
            label="Nombre"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            :rules="[r => !!r || 'Requerido', r => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r) || 'Email no válido']"
            class="mb-2"
          />
          <v-text-field
            v-model="form.password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :rules="editingId ? [r => !r || r.length >= 8 || 'Mínimo 8 caracteres'] : [r => !!r || 'Requerido', r => !r || r.length >= 8 || 'Mínimo 8 caracteres']"
            :hint="editingId ? 'Dejar vacío para no cambiar' : ''"
            :persistent-hint="!!editingId"
            class="mb-1"
          />
          <div v-if="form.password" class="mb-3">
            <v-progress-linear
              :model-value="passwordStrengthValue"
              :color="passwordStrengthColor"
              height="6"
              rounded
              class="mb-1"
            />
            <div class="d-flex justify-space-between">
              <span class="text-caption" :class="`text-${passwordStrengthColor}`">{{ passwordStrengthLabel }}</span>
              <span class="text-caption text-medium-emphasis">{{ passwordChecks }}</span>
            </div>
          </div>
          <v-select
            v-model="form.role"
            label="Rol"
            :items="roleOptions"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit" :loading="saving">Guardar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :items-per-page="10"
        :loading="loading"
        no-data-text="No se encontraron usuarios."
      >
        <template #item.role="{ item }">
          <v-chip :color="roleColor(item.role)" size="small">
            {{ roleLabel(item.role) }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" color="warning" @click="openEdit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="onDelete(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/user.service'
import { notifySuccess, notifyApiError, confirmAction, notifyError } from '@core/utils/notify'
import { useAuthGate } from '@core/composables/useAuthGate'
import { useAuthStore } from '@modules/auth/store/auth.store'
import type { User, UserRole } from '@core/types/models'
import type { UserForm } from '../types/admin.types'

const { requirePassword } = useAuthGate()
const authStore = useAuthStore()

const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showForm = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref()
const form = ref<UserForm>({ name: '', email: '', password: '', role: '' })
const showPassword = ref(false)

const roleOptions = [
  { title: 'Administrador', value: 'admin' },
  { title: 'Cajero', value: 'cajero' },
  { title: 'Usuario', value: 'user' },
]

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Rol', key: 'role' },
  { title: 'Acciones', key: 'actions', sortable: false, width: 120 },
]

const roleColor = (role: UserRole) =>
  ({ admin: 'primary', cajero: 'success', user: 'grey' })[role] || 'grey'

const roleLabel = (role: UserRole) =>
  ({ admin: 'Administrador', cajero: 'Cajero', user: 'Usuario' })[role] || role

const passwordStrength = computed(() => {
  const p = form.value.password || ''
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const passwordStrengthValue = computed(() => (passwordStrength.value / 5) * 100)

const passwordStrengthColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'error'
  if (s <= 2) return 'warning'
  if (s <= 3) return 'amber'
  return 'success'
})

const passwordStrengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'Muy débil'
  if (s <= 2) return 'Débil'
  if (s <= 3) return 'Aceptable'
  if (s === 4) return 'Fuerte'
  return 'Muy fuerte'
})

const passwordChecks = computed(() => {
  const p = form.value.password || ''
  const checks: string[] = []
  if (p.length < 8) checks.push('8+ caracteres')
  if (!/[A-Z]/.test(p)) checks.push('mayúscula')
  if (!/[a-z]/.test(p)) checks.push('minúscula')
  if (!/\d/.test(p)) checks.push('número')
  if (!/[^A-Za-z0-9]/.test(p)) checks.push('especial')
  return checks.length ? `Falta: ${checks.join(', ')}` : 'Todos los criterios'
})

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

function openCreate() {
  editingId.value = null
  form.value = { name: '', email: '', password: '', role: '' }
  showPassword.value = false
  showForm.value = true
}

function openEdit(user: User) {
  editingId.value = user.id
  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
  }
  showPassword.value = false
  showForm.value = true
}

async function save() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  const verified = await requirePassword(
    editingId.value ? 'Editar Usuario' : 'Crear Usuario',
    'Ingresa tu contraseña para confirmar'
  )
  if (!verified) return

  saving.value = true
  try {
    const isEditingSelf = editingId.value === authStore.user?.id
    const changedOwnPassword = isEditingSelf && !!form.value.password

    if (editingId.value) {
      const updated = await updateUser(editingId.value, form.value)
      const idx = users.value.findIndex((u) => u.id === editingId.value)
      if (idx !== -1) users.value[idx] = updated
      notifySuccess('Usuario actualizado')
    } else {
      const created = await createUser(form.value)
      users.value.push(created)
      notifySuccess('Usuario creado')
    }
    showForm.value = false

    if (changedOwnPassword) {
      notifyError('Contraseña cambiada', 'Tu contraseña fue modificada. Debes iniciar sesión nuevamente.')
      setTimeout(() => authStore.logout(), 2000)
    }
  } catch (err) {
    notifyApiError(err, 'Error al guardar usuario')
  } finally {
    saving.value = false
  }
}

async function onDelete(user: User) {
  const confirmed = await confirmAction(
    '¿Eliminar usuario?',
    `Se eliminará "${user.name}". Esta acción no se puede deshacer.`
  )
  if (!confirmed) return

  try {
    await deleteUser(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    notifySuccess('Usuario eliminado')
  } catch (err) {
    notifyApiError(err, 'Error al eliminar usuario')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch (err) {
    notifyApiError(err, 'Error al cargar usuarios')
  } finally {
    loading.value = false
  }
})
</script>
