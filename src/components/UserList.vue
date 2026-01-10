<template>
  <div class="user-list-container">
    <h2>Usuarios</h2>

    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/axios';

const users = ref([]);
const router = useRouter();

const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    users.value = response.data;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    localStorage.clear();
    router.push('/');
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');

  if (!token) {
    router.push('/');
  } else {
    fetchUsers();
  }
});
</script>

<style scoped>
.user-list-container {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f3f4f6;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

h2 {
  margin-bottom: 15px;
  color: #4f46e5;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid #d1d5db;
}
</style>
