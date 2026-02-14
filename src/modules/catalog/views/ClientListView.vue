<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Clientes</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openForm">
        Nuevo Cliente
      </v-btn>
    </div>

    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="Buscar por nombre o documento..."
      single-line
      hide-details
      class="mb-4"
      style="max-width: 400px"
    />

    <v-dialog v-model="showForm" max-width="500" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-h6 text-primary">
          {{ editingId ? 'Editar' : 'Nuevo' }} Cliente
        </v-card-title>
        <v-form @submit.prevent="save">
          <v-select
            v-model="form.document_type"
            label="Tipo de Documento"
            :items="docTypes"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-text-field v-model="form.document_number" label="Número de Documento" :rules="[r => !!r || 'Requerido']" class="mb-2" />
          <v-text-field v-model="form.name" label="Nombre" :rules="[r => !!r || 'Requerido']" class="mb-2" />
          <v-text-field v-model="form.phone" label="Teléfono" class="mb-2" />
          <v-text-field v-model="form.email" label="Email" type="email" class="mb-2" />
          <v-text-field v-model="form.address" label="Dirección" class="mb-2" />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="showForm = false">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Guardar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="filtered"
        :items-per-page="10"
        no-data-text="No se encontraron clientes."
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
import type { Client } from '@core/types/models'
import type { ClientForm } from '../types/catalog.types'

const docTypes = ['CC', 'NIT', 'CE', 'TI', 'PP']

const headers = [
  { title: 'Tipo Doc.', key: 'document_type', width: 100 },
  { title: 'Número Doc.', key: 'document_number' },
  { title: 'Nombre', key: 'name' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Email', key: 'email' },
  { title: 'Dirección', key: 'address' },
  { title: 'Acciones', key: 'actions', sortable: false, width: 120 },
]

const {
  search, showForm, editingId, form, filtered,
  fetchData, openForm, editItem, save, remove,
} = useCrud<Client, ClientForm>({
  endpoint: '/clients',
  entityName: 'Cliente',
  defaultForm: () => ({ document_type: '', document_number: '', name: '', phone: '', email: '', address: '' }),
  searchFilter: (item, q) =>
    item.name.toLowerCase().includes(q) || (item.document_number?.toLowerCase().includes(q) ?? false),
})

function onEdit(c: Client) {
  editItem(c, (cli) => ({
    document_type: cli.document_type || '',
    document_number: cli.document_number || '',
    name: cli.name,
    phone: cli.phone || '',
    email: cli.email || '',
    address: cli.address || '',
  }))
}

onMounted(() => fetchData())
</script>
