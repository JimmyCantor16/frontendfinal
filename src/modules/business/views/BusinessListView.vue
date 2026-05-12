<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Mis negocios</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">
        Nuevo negocio
      </v-btn>
    </div>

    <v-alert v-if="businessStore.error" type="error" variant="tonal" class="mb-4">
      {{ businessStore.error }}
    </v-alert>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="businessStore.businesses"
        :loading="businessStore.loading"
        :items-per-page="10"
        no-data-text="Aún no tienes negocios. Crea el primero para comenzar."
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar v-if="item.logo_url" size="28" class="mr-2">
              <v-img :src="item.logo_url" :alt="item.name" />
            </v-avatar>
            <v-icon v-else size="22" class="mr-2">mdi-store</v-icon>
            <span class="font-weight-medium">{{ item.name }}</span>
          </div>
        </template>

        <template #item.tax_id="{ item }">
          {{ item.tax_id || item.nit || '—' }}
        </template>

        <template #item.status="{ item }">
          <v-chip
            v-if="item.id === businessStore.currentBusinessId"
            color="success"
            size="small"
            variant="flat"
            prepend-icon="mdi-check-circle"
          >
            Activo
          </v-chip>
          <span v-else class="text-disabled">—</span>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip text="Cambiar a este negocio" location="top">
            <template #activator="{ props: tt }">
              <v-btn
                v-bind="tt"
                icon
                size="small"
                variant="text"
                color="success"
                :disabled="item.id === businessStore.currentBusinessId"
                @click="onSwitch(item.id)"
              >
                <v-icon>mdi-swap-horizontal</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-btn icon size="small" variant="text" color="warning" @click="openEdit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="onDelete(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <BusinessFormDialog
      v-model="dialogOpen"
      :editing="editingItem"
      :saving="businessStore.loading"
      :error="formError"
      @submit="onSubmit"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBusinessStore } from '../stores/businessStore'
import BusinessFormDialog from '../components/BusinessFormDialog.vue'
import type { BusinessRecord, BusinessCreatePayload } from '../types/business.types'
import { notifySuccess, notifyApiError, confirmAction } from '@core/utils/notify'

const businessStore = useBusinessStore()

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'NIT / Tax ID', key: 'tax_id' },
  { title: 'Email', key: 'email' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Estado', key: 'status', sortable: false, width: 110 },
  { title: 'Acciones', key: 'actions', sortable: false, width: 160 },
]

const dialogOpen = ref(false)
const editingItem = ref<BusinessRecord | null>(null)
const formError = ref<string | null>(null)

function openCreate() {
  editingItem.value = null
  formError.value = null
  dialogOpen.value = true
}

function openEdit(item: BusinessRecord) {
  editingItem.value = item
  formError.value = null
  dialogOpen.value = true
}

async function onSubmit(payload: BusinessCreatePayload, id: number | null) {
  formError.value = null
  const result = id
    ? await businessStore.update(id, payload)
    : await businessStore.create(payload)

  if (result) {
    notifySuccess(id ? 'Negocio actualizado' : 'Negocio creado')
    dialogOpen.value = false
  } else {
    formError.value = businessStore.error ?? 'No se pudo guardar el negocio'
  }
}

async function onSwitch(id: number) {
  const ok = await businessStore.switchTo(id)
  if (ok) {
    notifySuccess('Negocio activo cambiado')
    window.location.reload()
  } else if (businessStore.error) {
    notifyApiError(new Error(businessStore.error))
  }
}

async function onDelete(item: BusinessRecord) {
  const confirmed = await confirmAction(
    `¿Eliminar el negocio "${item.name}"?`,
    'Esta acción no se puede deshacer.',
    'Eliminar'
  )
  if (!confirmed) return
  const ok = await businessStore.remove(item.id)
  if (ok) notifySuccess('Negocio eliminado')
  else if (businessStore.error) notifyApiError(new Error(businessStore.error))
}

onMounted(() => {
  businessStore.fetchAll()
})
</script>
