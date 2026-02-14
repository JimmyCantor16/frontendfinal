<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6" elevation="8">
          <v-card-title class="text-h5 text-center text-primary mb-4">
            Iniciar sesión
          </v-card-title>

          <v-form @submit.prevent="onSubmit">
            <v-text-field
              v-model.trim="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :rules="[rules.required, rules.email]"
              class="mb-2"
            />

            <v-text-field
              v-model="password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="[rules.required]"
              class="mb-2"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              :disabled="loading"
            >
              Login
            </v-btn>

            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              {{ errorMessage }}
            </v-alert>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import { getRecaptchaToken } from '@core/utils/recaptcha'
import { notifySuccess } from '@core/utils/notify'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const auth = useAuthStore()

const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email inválido',
}

const onSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const recaptchaToken = await getRecaptchaToken()

    await auth.login({
      email: email.value,
      password: password.value,
      recaptcha_token: recaptchaToken,
    })

    notifySuccess('¡Bienvenido!')
    router.push('/dashboard')
  } catch (err: unknown) {
    const e = err as any
    errorMessage.value =
      e.response?.data?.message || e.message || 'Error de login'
  } finally {
    loading.value = false
  }
}
</script>
