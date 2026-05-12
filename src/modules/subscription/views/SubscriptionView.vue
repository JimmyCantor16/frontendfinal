<template>
  <v-container>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Mi Suscripción</h2>
      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-package-variant"
        @click="goToPlans"
      >
        Ver planes
      </v-btn>
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

    <div v-if="store.loading && !store.currentSubscription" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-card v-else-if="store.currentSubscription" class="pa-6">
      <div class="d-flex align-center mb-4">
        <v-icon size="36" color="primary" class="mr-3">mdi-credit-card-check</v-icon>
        <div>
          <h3 class="text-h6">
            {{ store.currentSubscription.plan?.name || 'Plan activo' }}
          </h3>
          <v-chip
            size="small"
            :color="statusColor"
            variant="flat"
            class="mt-1"
          >
            {{ statusLabel }}
          </v-chip>
        </div>
      </div>

      <v-divider class="my-4" />

      <v-row>
        <v-col cols="12" sm="6" v-if="planPrice">
          <div class="text-caption text-medium-emphasis">Precio</div>
          <div class="text-body-1 font-weight-medium">{{ planPrice }}</div>
        </v-col>
        <v-col cols="12" sm="6" v-if="renewalDateLabel">
          <div class="text-caption text-medium-emphasis">
            {{ isCanceled ? 'Termina el' : 'Próxima renovación' }}
          </div>
          <div class="text-body-1 font-weight-medium">{{ renewalDateLabel }}</div>
        </v-col>
        <v-col cols="12" sm="6" v-if="trialEndsLabel">
          <div class="text-caption text-medium-emphasis">Fin del periodo de prueba</div>
          <div class="text-body-1 font-weight-medium">{{ trialEndsLabel }}</div>
        </v-col>
      </v-row>

      <v-alert
        v-if="isCanceled"
        type="warning"
        variant="tonal"
        class="mt-4"
      >
        Tu suscripción está cancelada. Conservarás el acceso hasta la fecha indicada.
      </v-alert>

      <v-alert
        v-if="store.currentSubscription.status === 'past_due'"
        type="error"
        variant="tonal"
        class="mt-4"
      >
        Tu suscripción tiene un pago vencido. Por favor actualiza tu método de pago.
      </v-alert>

      <v-divider class="my-4" />

      <div class="d-flex flex-wrap ga-2">
        <v-btn
          v-if="canCancel"
          color="error"
          variant="outlined"
          prepend-icon="mdi-cancel"
          :loading="actionLoading === 'cancel'"
          @click="onCancel"
        >
          Cancelar suscripción
        </v-btn>
        <v-btn
          v-if="canResume"
          color="success"
          variant="flat"
          prepend-icon="mdi-restart"
          :loading="actionLoading === 'resume'"
          @click="onResume"
        >
          Reactivar
        </v-btn>
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-swap-horizontal"
          @click="goToPlans"
        >
          Cambiar plan
        </v-btn>
      </div>
    </v-card>

    <v-card v-else class="pa-8 text-center">
      <v-icon size="64" color="grey">mdi-package-variant-closed</v-icon>
      <h3 class="text-h6 mt-4 mb-2">No tienes una suscripción activa</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Selecciona un plan para empezar a usar todas las funcionalidades.
      </p>
      <v-btn color="primary" prepend-icon="mdi-package-variant" @click="goToPlans">
        Ver planes disponibles
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { formatDate } from '@core/utils/format'
import { confirmAction, notifySuccess } from '@core/utils/notify'

const router = useRouter()
const store = useSubscriptionStore()
const actionLoading = ref<'cancel' | 'resume' | null>(null)

const statusLabel = computed(() => {
  const status = store.currentSubscription?.status
  switch (status) {
    case 'active': return 'Activa'
    case 'trialing': return 'Periodo de prueba'
    case 'canceled': return 'Cancelada'
    case 'past_due': return 'Pago vencido'
    case 'incomplete': return 'Incompleta'
    case 'unpaid': return 'No pagada'
    default: return status ?? 'Desconocido'
  }
})

const statusColor = computed(() => {
  const status = store.currentSubscription?.status
  switch (status) {
    case 'active': return 'success'
    case 'trialing': return 'info'
    case 'canceled': return 'warning'
    case 'past_due':
    case 'unpaid': return 'error'
    default: return 'grey'
  }
})

const isCanceled = computed(() => {
  const sub = store.currentSubscription
  if (!sub) return false
  return sub.status === 'canceled' || sub.cancel_at_period_end === true || !!sub.ends_at
})

const canCancel = computed(() => {
  const sub = store.currentSubscription
  if (!sub) return false
  return (sub.status === 'active' || sub.status === 'trialing') && !isCanceled.value
})

const canResume = computed(() => {
  const sub = store.currentSubscription
  if (!sub) return false
  // Allow resume while still in grace period (ends_at in future) or canceled status
  return isCanceled.value
})

const renewalDateLabel = computed(() => {
  const sub = store.currentSubscription
  if (!sub) return ''
  return formatDate(sub.ends_at ?? sub.current_period_end ?? null)
})

const trialEndsLabel = computed(() => {
  return formatDate(store.currentSubscription?.trial_ends_at ?? null)
})

const planPrice = computed(() => {
  const plan = store.currentSubscription?.plan
  if (!plan) return ''
  const value = (plan.price_cents ?? 0) / 100
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: (plan.currency || 'USD').toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value) + ` / ${plan.interval}`
  } catch {
    return `${plan.currency} ${value.toFixed(2)} / ${plan.interval}`
  }
})

function goToPlans() {
  router.push('/plans')
}

async function onCancel() {
  const ok = await confirmAction(
    '¿Cancelar suscripción?',
    'Conservarás el acceso hasta el final del periodo actual.',
    'Sí, cancelar'
  )
  if (!ok) return
  actionLoading.value = 'cancel'
  const success = await store.cancel()
  actionLoading.value = null
  if (success) notifySuccess('Suscripción cancelada')
}

async function onResume() {
  actionLoading.value = 'resume'
  const success = await store.resume()
  actionLoading.value = null
  if (success) notifySuccess('Suscripción reactivada')
}

onMounted(async () => {
  await store.fetchCurrent()
})
</script>
