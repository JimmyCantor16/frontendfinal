<template>
  <v-container>
    <div class="text-center mb-8">
      <h1 class="text-h4 text-primary mb-2">Planes y Precios</h1>
      <p class="text-body-1 text-medium-emphasis">
        Elige el plan que mejor se adapte a tu negocio.
      </p>
    </div>

    <v-alert
      v-if="store.error"
      type="error"
      class="mb-4"
      closable
      @click:close="store.error = null"
    >
      {{ store.error }}
    </v-alert>

    <div v-if="store.loading && !store.plans.length" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-row v-else>
      <v-col
        v-for="plan in store.plans"
        :key="plan.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          :variant="isCurrentPlan(plan.id) ? 'elevated' : 'outlined'"
          :color="isCurrentPlan(plan.id) ? 'primary' : undefined"
          class="h-100 d-flex flex-column"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6">{{ plan.name }}</span>
            <v-chip
              v-if="isCurrentPlan(plan.id)"
              size="small"
              color="success"
              variant="flat"
            >
              Plan actual
            </v-chip>
          </v-card-title>

          <v-card-text class="flex-grow-1">
            <div class="mb-4">
              <span class="text-h4 font-weight-bold">
                {{ formatPrice(plan.price_cents, plan.currency) }}
              </span>
              <span class="text-body-2 text-medium-emphasis">
                / {{ intervalLabel(plan.interval) }}
              </span>
            </div>

            <v-list density="compact" class="bg-transparent">
              <v-list-item
                v-for="(feature, idx) in plan.features"
                :key="idx"
                class="px-0"
              >
                <template #prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ feature }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-btn
              block
              :color="isCurrentPlan(plan.id) ? 'grey' : 'primary'"
              :variant="isCurrentPlan(plan.id) ? 'tonal' : 'flat'"
              :disabled="isCurrentPlan(plan.id) || checkoutLoading === plan.id"
              :loading="checkoutLoading === plan.id"
              @click="onSelect(plan)"
            >
              {{ buttonLabel(plan) }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!store.loading && !store.plans.length" class="text-center py-10">
      <v-icon size="64" color="grey">mdi-package-variant</v-icon>
      <p class="text-body-1 text-medium-emphasis mt-4">
        No hay planes disponibles por el momento.
      </p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { useAuthStore } from '@modules/auth/store/auth.store'
import type { Plan } from '../types/subscription.types'

const router = useRouter()
const store = useSubscriptionStore()
const authStore = useAuthStore()

const checkoutLoading = ref<number | string | null>(null)

function isCurrentPlan(planId: number | string): boolean {
  return String(store.currentPlanId) === String(planId)
}

function intervalLabel(interval: string): string {
  switch (interval) {
    case 'month': return 'mes'
    case 'year': return 'año'
    case 'week': return 'semana'
    case 'day': return 'día'
    default: return interval
  }
}

function formatPrice(cents: number, currency: string): string {
  const value = (cents ?? 0) / 100
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${(currency || 'USD').toUpperCase()} ${value.toFixed(2)}`
  }
}

function buttonLabel(plan: Plan): string {
  if (isCurrentPlan(plan.id)) return 'Plan activo'
  if (!authStore.isAuthenticated) return 'Comenzar'
  return 'Suscribirme'
}

async function onSelect(plan: Plan) {
  if (isCurrentPlan(plan.id)) return

  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: '/plans' } })
    return
  }

  checkoutLoading.value = plan.id
  try {
    const url = await store.startCheckout(plan.id)
    if (url) {
      window.location.href = url
    }
  } finally {
    checkoutLoading.value = null
  }
}

onMounted(async () => {
  await store.fetchPlans()
  if (authStore.isAuthenticated && !store.currentSubscription) {
    await store.fetchCurrent()
  }
})
</script>
