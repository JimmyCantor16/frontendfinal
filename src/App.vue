<template>
  <div id="app">
    <header class="app-header">
      <h1>Mi App</h1>
      <button v-if="authStore.isAuthenticated" @click="logout">Cerrar Sesión</button>
    </header>

    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<style>
#app { font-family: Arial, sans-serif; margin: 0; padding: 0; }
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4f46e5;
  color: white;
  padding: 10px 20px;
}
button {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover { background: #b91c1c; }
</style>
