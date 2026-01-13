<template>
  <div id="app">
    <header class="app-header">
      <h1>Mi App</h1>
      <button
        v-if="authStore.isAuthenticated"
        class="logout-btn"
        @click="handleLogout"
      >
        Cerrar Sesión
      </button>
    </header>

    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();

let idleTimer;

const startIdleTimer = () => {
  clearTimeout(idleTimer);
  // 1 minuto 1 segundo = 61000ms
  idleTimer = setTimeout(async () => {
    await Swal.fire({
      icon: 'warning',
      title: 'Sesión expirada',
      text: 'Por inactividad se cerrará la sesión',
      timer: 3000,
      showConfirmButton: false
    });
    authStore.logout();
    router.push('/');
  }, 61000);
};

const resetIdleTimer = () => startIdleTimer();

onMounted(() => {
  if (authStore.isAuthenticated) {
    startIdleTimer();
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
  clearTimeout(idleTimer);
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4f46e5;
  color: white;
  padding: 10px 20px;
}

.logout-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #b91c1c;
}
</style>
