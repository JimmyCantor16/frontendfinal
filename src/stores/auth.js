import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),
  actions: {
    async login(payload) {
      const response = await api.post('/login', payload);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      this.user = response.data.user;
      this.isAuthenticated = true;
    },
    async fetchUser() {
      const { data } = await api.get('/me');
      this.user = data;
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.user = null;
      this.isAuthenticated = false;
    }
  }
});
