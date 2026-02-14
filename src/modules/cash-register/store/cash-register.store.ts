import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CashRegister } from '@core/types/models'
import * as cashService from '../services/cash-register.service'
import type { OpenCashRegisterPayload, CloseCashRegisterPayload } from '../types/cash-register.types'

export const useCashRegisterStore = defineStore('cashRegister', () => {
  const current = ref<CashRegister | null>(null)
  const loading = ref(false)

  const isOpen = computed(() => current.value?.status === 'open')
  const currentId = computed(() => current.value?.id ?? null)

  async function loadCurrent(): Promise<void> {
    loading.value = true
    try {
      current.value = await cashService.fetchCurrentCashRegister()
    } finally {
      loading.value = false
    }
  }

  async function openRegister(payload: OpenCashRegisterPayload): Promise<void> {
    current.value = await cashService.openCashRegister(payload)
  }

  async function closeRegister(payload: CloseCashRegisterPayload): Promise<void> {
    if (!current.value) return
    current.value = await cashService.closeCashRegister(current.value.id, payload)
  }

  return {
    current,
    loading,
    isOpen,
    currentId,
    loadCurrent,
    openRegister,
    closeRegister,
  }
})
