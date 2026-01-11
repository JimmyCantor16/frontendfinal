<template>
  <div class="login-wrapper">
    <div class="login-container">
      <h2>Iniciar Sesión</h2>

      <form @submit.prevent="handleLogin">
        <!-- Email -->
        <input
          type="email"
          v-model="state.email"
          placeholder="Correo electrónico"
          @blur="v$.email.$touch()"
        />
        <span v-if="v$.email.$error" class="error">
          <span v-if="v$.email.required.$invalid">El correo es obligatorio.</span>
          <span v-if="v$.email.email.$invalid">Formato de correo inválido.</span>
        </span>

        <!-- Password -->
        <input
          type="password"
          v-model="state.password"
          placeholder="Contraseña"
          @blur="v$.password.$touch()"
        />
        <span v-if="v$.password.$error" class="error">
          <span v-if="v$.password.required.$invalid">La contraseña es obligatoria.</span>
          <span v-if="v$.password.minLength.$invalid">Mínimo 6 caracteres.</span>
        </span>

        <!-- Botón de login -->
        <button type="submit" :disabled="loading || v$.$invalid">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import useVuelidate from '@vuelidate/core';
import { required, email as emailRule, minLength } from '@vuelidate/validators';
import Swal from 'sweetalert2';

// Estado del formulario
const state = reactive({
  email: '',
  password: ''
});

const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

// Reglas de validación
const rules = {
  email: { required, email: emailRule },
  password: { required, minLength: minLength(6) }
};
const v$ = useVuelidate(rules, state);

// Función de login
const handleLogin = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  loading.value = true;
  try {
    await authStore.login({ email: state.email, password: state.password });
    await Swal.fire({
      icon: 'success',
      title: '¡Login exitoso!',
      timer: 1000,
      showConfirmButton: false
    });
    router.push('/users');
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error en login',
      text: err.response?.data?.message || err.message
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-container {
  width: 350px;
  padding: 30px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2 { color: #4f46e5; margin-bottom: 20px; }

form { width: 100%; display: flex; flex-direction: column; }

input {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 16px;
}

button {
  padding: 10px;
  margin-top: 10px;
  background-color: #4f46e5;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

button:disabled { background-color: #a5b4fc; cursor: not-allowed; }

.error { color: red; font-size: 12px; margin-bottom: 5px; }

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
