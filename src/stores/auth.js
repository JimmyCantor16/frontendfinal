// stores/auth.js
import { defineStore } from 'pinia';
import api from '@/services/api';
import Swal from 'sweetalert2';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    inactivityTimer: null,
  }),
  actions: {
    async login(payload) {


      try {
        const response = await api.post('/login', payload);
        const token = response.data.access_token; // backend Laravel Sanctum
        const user = response.data.user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        this.user = user;
        this.token = token;
        this.isAuthenticated = true;

        this.startInactivityTimer();
        return { user, token };
      }catch(err) {
        Swal.fire({
          icon: 'error',
          title: 'Error de login',
          text: err.response?.data?.message || 'No se pudo iniciar sesión'
        });
        throw err;
      }
      
    },

    async fetchUser() {
      try {
        const { data } = await api.get('/me');
        this.user = data;
      } catch (err) {
        this.logout();
      }
    },

    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.clearInactivityTimer();
      window.location.href = '/login';

      Swal.fire({
        icon: 'info',
        title: 'Sesión cerrada',
        text: 'Has sido desconectado.'
      }).then(() => {
        window.location.href = '/login';
      });
    },

    startInactivityTimer() {
      this.clearInactivityTimer();
      // 1 minuto 1 segundo = 61000ms
      this.inactivityTimer = setTimeout(async () => {
        // Mostrar SweetAlert2 bloqueando clics o teclas
        await Swal.fire({
          icon: 'warning',
          title: 'Inactividad detectada',
          text: 'Tu sesión se cerrará por inactividad.',
          timer: 10000, // muestra 10 segundos
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading()
        });

        // Luego de que termine el timer, cerrar sesión
        this.logout();

      }, 61000);

      window.addEventListener('mousemove', this.resetInactivityTimer);
      window.addEventListener('keydown', this.resetInactivityTimer);
    },

    resetInactivityTimer() {
      const auth = useAuthStore();
      if (auth.inactivityTimer) {
        clearTimeout(auth.inactivityTimer);
        auth.startInactivityTimer();
      }
    },

    clearInactivityTimer() {
      if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
      window.removeEventListener('mousemove', this.resetInactivityTimer);
      window.removeEventListener('keydown', this.resetInactivityTimer);
    },
  },
});
