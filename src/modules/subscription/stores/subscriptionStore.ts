import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Plan, Subscription } from '../types/subscription.types'
import * as planService from '../services/planService'
import * as subscriptionService from '../services/subscriptionService'
import { notifyApiError } from '@core/utils/notify'

export const useSubscriptionStore = defineStore('subscription', () => {
  const plans = ref<Plan[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentPlanId = computed<string | number | null>(() => {
    const sub = currentSubscription.value
    if (!sub) return null
    return sub.plan?.id ?? sub.plan_id ?? null
  })

  const hasActiveSubscription = computed(() => {
    const status = currentSubscription.value?.status
    return status === 'active' || status === 'trialing'
  })

  function setError(err: unknown, fallback: string): void {
    const e = err as { response?: { data?: { message?: string } }; message?: string }
    error.value = e?.response?.data?.message ?? e?.message ?? fallback
  }

  async function fetchPlans(): Promise<Plan[]> {
    loading.value = true
    error.value = null
    try {
      plans.value = await planService.list()
      return plans.value
    } catch (err: unknown) {
      setError(err, 'Error al cargar planes')
      notifyApiError(err, 'Error al cargar planes')
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrent(): Promise<Subscription | null> {
    loading.value = true
    error.value = null
    try {
      currentSubscription.value = await subscriptionService.current()
      return currentSubscription.value
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      // 404 / null means no active subscription — not an error
      if (status === 404) {
        currentSubscription.value = null
        return null
      }
      setError(err, 'Error al cargar suscripción')
      notifyApiError(err, 'Error al cargar suscripción')
      return null
    } finally {
      loading.value = false
    }
  }

  async function startCheckout(planId: number | string): Promise<string | null> {
    loading.value = true
    error.value = null
    try {
      const { checkout_url } = await subscriptionService.checkout(planId)
      return checkout_url || null
    } catch (err: unknown) {
      setError(err, 'Error al iniciar checkout')
      notifyApiError(err, 'Error al iniciar checkout')
      return null
    } finally {
      loading.value = false
    }
  }

  async function cancel(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      currentSubscription.value = await subscriptionService.cancel()
      return true
    } catch (err: unknown) {
      setError(err, 'Error al cancelar suscripción')
      notifyApiError(err, 'Error al cancelar suscripción')
      return false
    } finally {
      loading.value = false
    }
  }

  async function resume(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      currentSubscription.value = await subscriptionService.resume()
      return true
    } catch (err: unknown) {
      setError(err, 'Error al reactivar suscripción')
      notifyApiError(err, 'Error al reactivar suscripción')
      return false
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    plans.value = []
    currentSubscription.value = null
    loading.value = false
    error.value = null
  }

  return {
    plans,
    currentSubscription,
    loading,
    error,
    currentPlanId,
    hasActiveSubscription,
    fetchPlans,
    fetchCurrent,
    startCheckout,
    cancel,
    resume,
    reset,
  }
})
