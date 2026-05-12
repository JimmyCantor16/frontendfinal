// Pinia store del módulo Business.
// Mantiene la lista de negocios accesibles por el usuario y el "current business"
// (sincronizado con `localStorage.business`, que es lo que el HTTP client lee
// para inyectar el header `X-Business-Id`).

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@modules/auth/store/auth.store'
import * as service from '../services/business.service'
import type {
  BusinessRecord,
  BusinessCreatePayload,
  BusinessUpdatePayload,
} from '../types/business.types'

function readCurrentFromStorage(): BusinessRecord | null {
  try {
    const raw = localStorage.getItem('business')
    if (!raw || raw === 'undefined') return null
    return JSON.parse(raw) as BusinessRecord
  } catch {
    return null
  }
}

function persistCurrent(business: BusinessRecord | null): void {
  try {
    if (business) {
      localStorage.setItem('business', JSON.stringify(business))
    } else {
      localStorage.removeItem('business')
    }
  } catch {
    // localStorage no disponible (SSR/tests aislados) — silencioso.
  }
}

export const useBusinessStore = defineStore('business', () => {
  const businesses = ref<BusinessRecord[]>([])
  const currentBusiness = ref<BusinessRecord | null>(readCurrentFromStorage())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentBusinessId = computed(() => currentBusiness.value?.id ?? null)
  const hasBusinesses = computed(() => businesses.value.length > 0)

  function _captureError(err: unknown, fallback: string): void {
    const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
    error.value =
      axiosErr.response?.data?.message ??
      axiosErr.message ??
      fallback
  }

  function _syncCurrent(updated: BusinessRecord): void {
    if (currentBusiness.value && currentBusiness.value.id === updated.id) {
      currentBusiness.value = { ...currentBusiness.value, ...updated }
      persistCurrent(currentBusiness.value)
      // Mantener sincronizado el auth store para que la AppBar y el header se actualicen.
      try {
        const auth = useAuthStore()
        // `business` viene del store de auth; lo dejamos consistente con currentBusiness.
        auth.business = currentBusiness.value as unknown as typeof auth.business
      } catch {
        // En tests sin Pinia auth el acceso puede fallar — ignoramos.
      }
    }
  }

  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      businesses.value = await service.fetchBusinesses()
      // Si no hay current, intenta tomar el primero como activo por defecto.
      if (!currentBusiness.value && businesses.value.length > 0) {
        currentBusiness.value = businesses.value[0]
        persistCurrent(currentBusiness.value)
      }
    } catch (err: unknown) {
      _captureError(err, 'Error al cargar negocios')
    } finally {
      loading.value = false
    }
  }

  async function create(payload: BusinessCreatePayload): Promise<BusinessRecord | null> {
    loading.value = true
    error.value = null
    try {
      const created = await service.createBusiness(payload)
      businesses.value = [...businesses.value, created]
      // El backend asigna current_business_id al crear el primer negocio.
      if (!currentBusiness.value) {
        currentBusiness.value = created
        persistCurrent(created)
      }
      return created
    } catch (err: unknown) {
      _captureError(err, 'Error al crear el negocio')
      return null
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, payload: BusinessUpdatePayload): Promise<BusinessRecord | null> {
    loading.value = true
    error.value = null
    try {
      const updated = await service.updateBusiness(id, payload)
      businesses.value = businesses.value.map((b) => (b.id === id ? { ...b, ...updated } : b))
      _syncCurrent(updated)
      return updated
    } catch (err: unknown) {
      _captureError(err, 'Error al actualizar el negocio')
      return null
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await service.deleteBusiness(id)
      businesses.value = businesses.value.filter((b) => b.id !== id)
      if (currentBusiness.value?.id === id) {
        currentBusiness.value = businesses.value[0] ?? null
        persistCurrent(currentBusiness.value)
      }
      return true
    } catch (err: unknown) {
      _captureError(err, 'Error al eliminar el negocio')
      return false
    } finally {
      loading.value = false
    }
  }

  async function switchTo(id: number): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const res = await service.switchBusiness(id)
      const target = res.business ?? businesses.value.find((b) => b.id === id) ?? null
      currentBusiness.value = target
      persistCurrent(target)
      try {
        const auth = useAuthStore()
        auth.business = target as unknown as typeof auth.business
      } catch {
        // ignore: auth store no inicializado (tests)
      }
      return true
    } catch (err: unknown) {
      _captureError(err, 'No se pudo cambiar de negocio')
      return false
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    businesses.value = []
    currentBusiness.value = null
    loading.value = false
    error.value = null
  }

  return {
    businesses,
    currentBusiness,
    loading,
    error,
    currentBusinessId,
    hasBusinesses,
    fetchAll,
    create,
    update,
    remove,
    switchTo,
    reset,
  }
})
