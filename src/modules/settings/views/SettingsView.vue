<template>
  <v-container>
    <h2 class="text-h5 text-primary mb-6">Configuración</h2>

    <v-row>
      <!-- Business info -->
      <v-col cols="12" md="7">
        <v-card class="pa-6">
          <v-card-title class="text-h6 px-0 pt-0">Datos del Negocio</v-card-title>

          <v-form @submit.prevent="onSave">
            <v-text-field
              v-model="form.name"
              label="Nombre del Negocio"
              prepend-inner-icon="mdi-store"
              :rules="[r => !!r || 'Requerido']"
              class="mb-2"
            />
            <v-text-field
              v-model="form.nit"
              label="NIT"
              prepend-inner-icon="mdi-card-account-details"
              class="mb-2"
            />
            <v-text-field
              v-model="form.address"
              label="Dirección"
              prepend-inner-icon="mdi-map-marker"
              class="mb-2"
            />
            <v-text-field
              v-model="form.phone"
              label="Teléfono"
              prepend-inner-icon="mdi-phone"
              class="mb-2"
            />
            <v-text-field
              v-model="form.email"
              label="Email del negocio"
              type="email"
              prepend-inner-icon="mdi-email"
              :rules="[
                (v: string) => !v || /.+@.+\..+/.test(v) || 'Email inválido',
              ]"
              class="mb-2"
            />

            <!-- Logo upload -->
            <v-card variant="outlined" class="pa-4 mb-4 text-center">
              <v-avatar v-if="logoPreview || currentLogoUrl" size="80" class="mb-3">
                <v-img :src="logoPreview || currentLogoUrl!" alt="Logo" />
              </v-avatar>
              <v-icon v-else size="48" color="grey-lighten-1" class="mb-2">mdi-image-plus</v-icon>

              <v-file-input
                label="Logo del negocio"
                accept="image/png,image/jpeg,image/webp"
                prepend-icon="mdi-camera"
                :rules="[
                  (v: File[]) => !v?.length || v[0].size <= 2_000_000 || 'Máximo 2 MB',
                ]"
                hide-details="auto"
                class="mt-2"
                @update:model-value="onLogoSelected"
              />
            </v-card>

            <v-btn type="submit" color="primary" :loading="saving" prepend-icon="mdi-content-save">
              Guardar Cambios
            </v-btn>
          </v-form>
        </v-card>
      </v-col>

      <!-- Plan & Subscription -->
      <v-col cols="12" md="5">
        <v-card class="pa-6 mb-4">
          <v-card-title class="text-h6 px-0 pt-0">Plan Actual</v-card-title>

          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar :color="planColor" size="48">
              <v-icon>mdi-crown</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold text-capitalize">
                {{ currentPlan }}
              </div>
              <v-chip
                :color="subscriptionStatusColor"
                size="small"
                class="mt-1"
              >
                {{ subscriptionStatusLabel }}
              </v-chip>
            </div>
          </div>

          <v-list density="compact" class="bg-grey-lighten-5 rounded mb-4">
            <v-list-item>
              <template #prepend><v-icon size="small" color="success">mdi-check</v-icon></template>
              <v-list-item-title class="text-body-2">Punto de Venta</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template #prepend><v-icon size="small" color="success">mdi-check</v-icon></template>
              <v-list-item-title class="text-body-2">Gestión de Inventario</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template #prepend><v-icon size="small" color="success">mdi-check</v-icon></template>
              <v-list-item-title class="text-body-2">Reportes Diarios</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template #prepend><v-icon size="small" color="success">mdi-check</v-icon></template>
              <v-list-item-title class="text-body-2">Control de Caja</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-btn color="primary" variant="outlined" block disabled prepend-icon="mdi-arrow-up-bold">
            Cambiar Plan (próximamente)
          </v-btn>
        </v-card>

        <v-card class="pa-6">
          <v-card-title class="text-h6 px-0 pt-0">Suscripción</v-card-title>
          <v-list density="compact">
            <v-list-item>
              <v-list-item-title class="text-caption text-medium-emphasis">Estado</v-list-item-title>
              <v-list-item-subtitle class="font-weight-bold text-capitalize">
                {{ subscriptionStatusLabel }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-btn color="info" variant="outlined" block disabled prepend-icon="mdi-credit-card" class="mt-2">
            Gestionar Facturación (próximamente)
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@modules/auth/store/auth.store'
import { notifySuccess, notifyApiError } from '@core/utils/notify'
import * as settingsService from '../services/settings.service'

const API_BASE = process.env.VUE_APP_API_URL || 'http://localhost:8000'

const authStore = useAuthStore()
const saving = ref(false)
const logoPreview = ref<string | null>(null)
const pendingLogoFile = ref<File | null>(null)
const form = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  nit: '',
})

const currentLogoUrl = computed(() => {
  const url = authStore.business?.logo_url
  if (!url) return null
  // Si ya es URL absoluta, usarla directamente
  if (url.startsWith('http')) return url
  // Si es ruta relativa, construir URL completa
  return `${API_BASE}${url}`
})

const currentPlan = computed(() =>
  authStore.business?.subscription_plan ?? authStore.business?.plan ?? 'free'
)

const planColor = computed(() => {
  const colors: Record<string, string> = {
    free: 'grey',
    basic: 'info',
    starter: 'info',
    pro: 'primary',
    enterprise: 'warning',
  }
  return colors[currentPlan.value] ?? 'grey'
})

const subscriptionStatusColor = computed(() => {
  const colors: Record<string, string> = {
    active: 'success',
    trial: 'info',
    past_due: 'warning',
    cancelled: 'error',
  }
  return colors[authStore.business?.subscription_status ?? ''] ?? 'grey'
})

const subscriptionStatusLabel = computed(() => {
  const labels: Record<string, string> = {
    active: 'Activa',
    trial: 'Período de Prueba',
    past_due: 'Pago Pendiente',
    cancelled: 'Cancelada',
  }
  return labels[authStore.business?.subscription_status ?? ''] ?? 'N/A'
})

function onLogoSelected(files: File[] | null) {
  if (!files?.length) {
    logoPreview.value = null
    pendingLogoFile.value = null
    return
  }
  const file = files[0]
  if (file.size > 2_000_000) return

  logoPreview.value = URL.createObjectURL(file)
  pendingLogoFile.value = file
}

async function loadSettings() {
  try {
    const biz = await settingsService.fetchBusinessSettings()
    form.value = {
      name: biz.name ?? '',
      address: biz.address ?? '',
      phone: biz.phone ?? '',
      email: biz.email ?? '',
      nit: biz.nit ?? '',
    }
    // Actualizar el store con los datos frescos del backend
    authStore.business = biz
    localStorage.setItem('business', JSON.stringify(biz))
  } catch {
    const biz = authStore.business
    if (biz) {
      form.value = {
        name: biz.name ?? '',
        address: biz.address ?? '',
        phone: biz.phone ?? '',
        email: biz.email ?? '',
        nit: biz.nit ?? '',
      }
    }
  }
}

async function onSave() {
  saving.value = true
  try {
    const updated = await settingsService.saveBusinessSettings(form.value, pendingLogoFile.value)
    authStore.business = updated
    localStorage.setItem('business', JSON.stringify(updated))
    pendingLogoFile.value = null
    if (updated.logo_url) {
      logoPreview.value = null // Usar logo_url del backend
    }
    notifySuccess('Configuración guardada')
  } catch (err) {
    notifyApiError(err, 'Error al guardar')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadSettings())
</script>
