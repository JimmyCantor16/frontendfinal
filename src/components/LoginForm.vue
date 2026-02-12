<template>
  <div class="login-container">
    <h2>Iniciar sesión</h2>

    <form @submit.prevent="onSubmit">
      <label>Email</label>
      <input v-model.trim="email" type="email" required />

      <label>Contraseña</label>
      <input v-model="password" type="password" required />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Ingresando...' : 'Login' }}
      </button>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const auth = useAuthStore()

const getRecaptchaToken = () => {
  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(process.env.VUE_APP_RECAPTCHA_SITE_KEY, { action: 'login' })
        .then(resolve)
        .catch(reject)
    })
  })
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

    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      timer: 1200,
      showConfirmButton: false,
    })

    router.push('/users')
  } catch (err) {
    console.error(err)
    errorMessage.value =
      err.response?.data?.message || err.message || 'Error de login'
  } finally {
    loading.value = false
  }
}
</script>




<style scoped>
.login-container {
  max-width: 420px;
  margin: 80px auto;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 10px;
}

label {
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  margin: 6px 0 14px;
}

button {
  width: 100%;
  padding: 10px;
  background: #42b983;
  border: none;
  color: white;
  border-radius: 6px;
}

button:disabled {
  background: #aaa;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
