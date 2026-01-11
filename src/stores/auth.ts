import { defineStore } from 'pinia'
import {
    login as loginService,
    logout as logoutService,
    me as meService
  } from '@/services/auth.service'
  

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    isAuthenticated: !!localStorage.getItem('token'),
  }),

  actions: {
    async login(payload: { email: string; password: string }) {
      await loginService(payload)
      await this.fetchUser()
      this.isAuthenticated = true
    },

    async fetchUser() {
        this.user = await meService()
      },

    async logout() {
      await logoutService()
      this.user = null
      this.isAuthenticated = false
    },
  },
})
