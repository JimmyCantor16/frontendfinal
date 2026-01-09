<template>
  <div id="app">
    <header>
      <h1>Mi App</h1>
      <!-- Mostrar logout solo si estamos logueados y en UserList -->
      <button v-if="showLogout" @click="logout">Cerrar sesión</button>
    </header>

    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Computed que indica si hay sesión activa
const isLoggedIn = computed(() => !!localStorage.getItem('user'));

// Computed que indica si se debe mostrar el botón logout
const showLogout = computed(() => {
  // Solo mostramos logout si el usuario está logueado y no está en login
  return isLoggedIn.value && route.path === '/users';
});

const logout = () => {
  localStorage.removeItem('user');
  router.push('/');
};
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #4f46e5;
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

button {
  padding: 6px 12px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #b91c1c;
}
</style>
