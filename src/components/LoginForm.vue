<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>

    <form @submit.prevent="handleLogin">
      <!-- Email -->
      <input type="email" v-model="email" placeholder="Correo electrónico" @blur="v$.email.$touch()" />
      <span v-if="v$.email.$error" style="color:red">
        <span v-if="v$.email.required.$invalid">El correo es obligatorio.</span>
        <span v-if="v$.email.email.$invalid">Formato de correo inválido.</span>
      </span>

      <!-- Password -->
      <input type="password" v-model="password" placeholder="Contraseña" @blur="v$.password.$touch()" />
      <span v-if="v$.password.$error" style="color:red">
        <span v-if="v$.password.required.$invalid">La contraseña es obligatoria.</span>
        <span v-if="v$.password.minLength.$invalid">Mínimo 6 caracteres.</span>
      </span>

      <!-- Submit -->
      <button type="submit" :disabled="v$.$invalid">Ingresar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, email as emailRule, minLength } from '@vuelidate/validators';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

// Reglas de validación
const rules = {
  email: { required, email: emailRule },
  password: { required, minLength: minLength(6) }
};

// Instancia de Vuelidate
const v$ = useVuelidate(rules, { email, password });

// Función de login
const handleLogin = async () => {
  v$.value.$touch(); // Marca todos los campos como tocados

  if (v$.value.$invalid) return;

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      email: email.value,
      password: password.value
    });

    localStorage.setItem('user', JSON.stringify(response.data));

    // Modal de éxito
    await Swal.fire({
      icon: 'success',
      title: '¡Login exitoso!',
      text: `Bienvenido ${response.data.name}`,
      timer: 1500,
      showConfirmButton: false
    });

    router.push('/users');

  } catch (err) {
    // Modal de error
    Swal.fire({
      icon: 'error',
      title: 'Error en el login',
      text: err.response?.data?.message || 'Credenciales incorrectas'
    });
  }
};
</script>

<style scoped>
.login-container {
  width: 350px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2 {
  margin-bottom: 20px;
  color: #4f46e5;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

input {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 16px;
}

button {
  padding: 10px;
  background-color: #3e36e0;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #3730a3;
}

button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}
</style>
