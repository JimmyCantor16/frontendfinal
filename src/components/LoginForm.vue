<template>
  <div class="login-container">
    <h2>Iniciar sesión</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Contraseña</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Ingresando...' : 'Login' }}
      </button>
      <p v-if="errorMessage" style="color:red">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const router = useRouter();
const auth = useAuthStore();

const onSubmit = async () => {
  console.log("Iniciando login...");
  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await auth.login({ email: email.value, password: password.value });

    // Mostrar mensaje de bienvenida
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `Hola ${result.user.name}`,
      timer: 1500,
      showConfirmButton: false
    });

    // 🔹 Debug: mostrar token y usuario
    console.log("Login exitoso:", result);
    console.log("Token en localStorage:", localStorage.getItem('token'));
    console.log("Usuario en localStorage:", localStorage.getItem('user'));

    // 🔹 Redirigir a UserList.vue
    router.push('/users');
  } catch (err) {
    console.error("Error login:", err.response?.data || err);
    errorMessage.value = err.response?.data?.message || 'Error de login';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}
input {
  width: 100%;
  padding: 8px;
  margin: 5px 0 15px 0;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button[disabled] {
  background-color: #aaa;
  cursor: not-allowed;
}
</style>
