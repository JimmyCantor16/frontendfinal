<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="10" md="7" lg="6">
        <v-card class="pa-6" elevation="8">
          <div class="text-center mb-4">
            <v-icon size="48" color="primary">mdi-storefront-outline</v-icon>
            <h2 class="text-h5 text-primary mt-2">Configura tu negocio</h2>
            <p class="text-body-2 text-medium-emphasis">
              Para empezar a usar Jamz necesitamos algunos datos del negocio que vas a administrar.
              Podrás editarlos o agregar más negocios después.
            </p>
          </div>

          <v-form @submit.prevent="onSubmit">
            <v-text-field
              v-model="form.name"
              label="Nombre del negocio *"
              prepend-inner-icon="mdi-store"
              :error-messages="errors.name"
              class="mb-2"
              @blur="v$.name.$touch()"
            />
            <v-text-field
              v-model="form.tax_id"
              label="NIT / RUT / Tax ID"
              prepend-inner-icon="mdi-card-account-details"
              class="mb-2"
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :error-messages="errors.email"
              class="mb-2"
              @blur="v$.email.$touch()"
            />
            <v-text-field
              v-model="form.phone"
              label="Teléfono"
              prepend-inner-icon="mdi-phone"
              class="mb-2"
            />
            <v-text-field
              v-model="form.address"
              label="Dirección"
              prepend-inner-icon="mdi-map-marker"
              class="mb-2"
            />

            <v-alert v-if="serverError" type="error" variant="tonal" class="mb-3">
              {{ serverError }}
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              :disabled="loading"
            >
              Crear negocio y continuar
            </v-btn>

            <v-btn
              variant="text"
              block
              class="mt-2"
              :disabled="loading"
              @click="onLogout"
            >
              Cerrar sesión
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { required, email as emailValidator, helpers } from '@vuelidate/validators'
import { useBusinessStore } from '../stores/businessStore'
import { useAuthStore } from '@modules/auth/store/auth.store'
import type { BusinessCreatePayload } from '../types/business.types'

const router = useRouter()
const businessStore = useBusinessStore()
const authStore = useAuthStore()

const form = reactive<BusinessCreatePayload>({
  name: '',
  tax_id: '',
  email: '',
  phone: '',
  address: '',
})

const loading = ref(false)
const serverError = ref<string | null>(null)

const validations = {
  name: { required: helpers.withMessage('El nombre es obligatorio', required) },
  email: { email: helpers.withMessage('Email inválido', emailValidator) },
}

const v$ = useVuelidate(validations, form as unknown as { name: string; email: string })

const errors = computed(() => ({
  name: v$.value.name.$errors.map((e) => String(e.$message)),
  email: v$.value.email.$errors.map((e) => String(e.$message)),
}))

async function onSubmit() {
  serverError.value = null
  const ok = await v$.value.$validate()
  if (!ok) return

  loading.value = true
  try {
    const payload: BusinessCreatePayload = {
      name: form.name.trim(),
      tax_id: form.tax_id?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      address: form.address?.trim() || undefined,
    }
    const created = await businessStore.create(payload)
    if (!created) {
      serverError.value = businessStore.error ?? 'No se pudo crear el negocio'
      return
    }
    // Refrescar usuario para tomar el nuevo current_business_id asignado por el backend.
    try {
      await authStore.fetchUser()
    } catch {
      // si /me falla, seguimos con la info local
    }
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}

function onLogout() {
  authStore.logout()
}
</script>
