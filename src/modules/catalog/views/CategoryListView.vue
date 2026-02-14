<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Categorías</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openForm">
        Nueva Categoría
      </v-btn>
    </div>

    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="Buscar categoría..."
      single-line
      hide-details
      class="mb-4"
      style="max-width: 400px"
    />

    <!-- Form Dialog -->
    <v-dialog v-model="showForm" max-width="500" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">
          {{ editingId ? 'Editar' : 'Nueva' }} Categoría
        </v-card-title>
        <v-form @submit.prevent="save">
          <v-text-field v-model="form.name" label="Nombre" :rules="[r => !!r || 'Requerido']" class="mb-2" />
          <v-textarea v-model="form.description" label="Descripción" rows="3" />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Guardar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filtered"
        :items-per-page="10"
        no-data-text="No se encontraron categorías."
      >
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" color="warning" @click="onEdit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="remove(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCrud } from '@core/composables/useCrud'
import type { Category } from '@core/types/models'
import type { CategoryForm } from '../types/catalog.types'

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Descripción', key: 'description' },
  { title: 'Acciones', key: 'actions', sortable: false, width: 120 },
]

const {
  search, showForm, editingId, form, filtered,
  fetchData, openForm, editItem, save, remove,
} = useCrud<Category, CategoryForm>({
  endpoint: '/categories',
  entityName: 'Categoría',
  defaultForm: () => ({ name: '', description: '' }),
  searchFilter: (item, q) => item.name.toLowerCase().includes(q),
})

function onEdit(cat: Category) {
  editItem(cat, (c) => ({ name: c.name, description: c.description || '' }))
}

onMounted(() => fetchData())
</script>
