<template>
  <div class="user-list-container">
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
import axios from 'axios';

const users = ref([]);
const router = useRouter();

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/users');
    users.value = response.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  const user = localStorage.getItem('user');
  if (!user) {
    router.push('/'); // si no hay sesión → login
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

li {
  padding: 8px 0;
  border-bottom: 1px solid #d1d5db;
}
</style>
