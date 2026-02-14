import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Business } from '@core/types/models'
import type { LoginPayload } from '../types/auth.types'
import * as authService from '../services/auth.service'
import { initInactivityControl, clearInactivityControl } from '@core/plugins/inactivity'

function safeParse<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw || raw === 'undefined') return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(safeParse<User>('user'))
  const token = ref<string | null>(localStorage.getItem('token'))
  const business = ref<Business | null>(safeParse<Business>('business'))

  const isAuthenticated = computed(() => !!token.value)
  const businessId = computed(() => business.value?.id ?? null)
  const businessName = computed(() => business.value?.name ?? '')
  const businessLogo = computed(() => business.value?.logo_url ?? null)

  async function login(payload: LoginPayload) {
    const data = await authService.login(payload)

    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    if (data.business) {
      localStorage.setItem('business', JSON.stringify(data.business))
    }

    user.value = data.user
    token.value = data.access_token
    business.value = data.business ?? null

    initInactivityControl(logout)

    return data
  }

  function logout() {
    clearInactivityControl()
    localStorage.clear()
    user.value = null
    token.value = null
    business.value = null
    window.location.href = '/login'
  }

  async function fetchUser() {
    const data = await authService.fetchMe()
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
    if (data.business) {
      business.value = data.business
      localStorage.setItem('business', JSON.stringify(data.business))
    }
  }

  function restoreInactivity() {
    if (token.value) {
      initInactivityControl(logout)
    }
  }

  return {
    user,
    token,
    business,
    isAuthenticated,
    businessId,
    businessName,
    businessLogo,
    login,
    logout,
    fetchUser,
    restoreInactivity,
  }
})
