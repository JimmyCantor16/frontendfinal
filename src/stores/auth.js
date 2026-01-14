import { defineStore } from 'pinia'
import api from '@/services/api'
import Swal from 'sweetalert2'

let inactivityTimeout = null
let warningTimeout = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),

  actions: {
    async login(payload) {
      const { data } = await api.post('/login', payload)

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      this.user = data.user
      this.token = data.access_token
      this.isAuthenticated = true

      this.initInactivityControl()
    },

    logout() {
      localStorage.clear()
      this.clearInactivityControl()
      window.location.href = '/login'
    },

    /* =============================
       INACTIVITY CONTROL
    ============================== */

    initInactivityControl() {
      this.clearInactivityControl()
      this.resetTimers()

      window.addEventListener('mousemove', this.resetTimers)
      window.addEventListener('keydown', this.resetTimers)
      window.addEventListener('click', this.resetTimers)
    },

    resetTimers() {
      clearTimeout(inactivityTimeout)
      clearTimeout(warningTimeout)

      Swal.close()

      // ⚠ aviso a los 50 segundos
      warningTimeout = setTimeout(() => {
        Swal.fire({
          title: 'Sesión por expirar',
          text: 'Se cerrará por inactividad',
          icon: 'warning',
          timer: 10000,
          showConfirmButton: false
        })
      }, 50000)

      // 🔒 logout a los 60 segundos
      inactivityTimeout = setTimeout(() => {
        const auth = useAuthStore()
        auth.logout()
      }, 60000)
    },

    clearInactivityControl() {
      clearTimeout(inactivityTimeout)
      clearTimeout(warningTimeout)

      window.removeEventListener('mousemove', this.resetTimers)
      window.removeEventListener('keydown', this.resetTimers)
      window.removeEventListener('click', this.resetTimers)
    }
  }
})
