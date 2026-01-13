<template>
  <div class="user-list-wrapper">
    <div class="user-list-container">
      <h2>Usuarios</h2>
      <ul>
        <li v-for="user in users" :key="user.id">{{ user.name }} - {{ user.email }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const users = ref([]);
const router = useRouter();
const authStore = useAuthStore();

const fetchUsers = async () => {
  try {
    const { data } = await api.get('/users');
    users.value = data;
  } catch (err) {
    authStore.logout();
    router.push('/login');
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) router.push('/login');
  else fetchUsers();
});
</script>

<style scoped>
.user-list-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
.user-list-container { width: 400px; padding: 20px; border-radius: 8px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
h2 { color: #4f46e5; margin-bottom: 15px; }
ul { list-style: none; padding: 0; margin: 0; }
li { padding: 8px 0; border-bottom: 1px solid #d1d5db; }
</style>
