<template>
  <v-container>
    <h2 class="text-h5 text-primary mb-6">Usuarios</h2>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="users"
        :items-per-page="10"
        :loading="loading"
        no-data-text="No se encontraron usuarios."
      >
        <template #item.role="{ item }">
          <v-chip :color="item.role === 'admin' ? 'primary' : 'grey'" size="small">
            {{ item.role }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchUsers } from '../services/user.service'
import { notifyApiError } from '@core/utils/notify'
import type { User } from '@core/types/models'

const users = ref<User[]>([])
const loading = ref(false)

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Rol', key: 'role' },
]

onMounted(async () => {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch (err: unknown) {
    notifyApiError(err, 'Error al cargar usuarios')
  } finally {
    loading.value = false
  }
})
</script>
