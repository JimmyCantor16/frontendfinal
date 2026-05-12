<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-8 text-center">
          <div v-if="loading" class="py-6">
            <v-progress-circular indeterminate color="primary" size="48" />
            <p class="text-body-1 mt-4">Verificando tu suscripción...</p>
          </div>

          <template v-else-if="verified">
            <v-icon size="80" color="success">mdi-check-circle</v-icon>
            <h2 class="text-h5 text-success mt-4 mb-2">¡Suscripción activada!</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Tu pago se procesó correctamente. Ya puedes usar todas las funcionalidades del plan
              <strong v-if="planName">{{ planName }}</strong>.
            </p>
            <div class="d-flex flex-wrap justify-center ga-2">
              <v-btn color="primary" prepend-icon="mdi-view-dashboard" to="/dashboard">
                Ir al dashboard
              </v-btn>
              <v-btn variant="outlined" prepend-icon="mdi-credit-card-check" to="/subscription">
                Ver mi suscripción
              </v-btn>
            </div>
          </template>

          <template v-else>
            <v-icon size="80" color="warning">mdi-clock-alert</v-icon>
            <h2 class="text-h5 text-warning mt-4 mb-2">Procesando tu pago...</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Tu pago se está procesando. La suscripción puede tardar unos segundos en activarse.
            </p>
            <div class="d-flex flex-wrap justify-center ga-2">
              <v-btn color="primary" prepend-icon="mdi-refresh" @click="verify">
                Verificar de nuevo
              </v-btn>
              <v-btn variant="outlined" to="/subscription">
                Ver mi suscripción
              </v-btn>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const store = useSubscriptionStore()
const loading = ref(true)

const verified = computed(() => {
  return store.hasActiveSubscription
})

const planName = computed(() => store.currentSubscription?.plan?.name ?? '')

async function verify() {
  loading.value = true
  await store.fetchCurrent()
  loading.value = false
}

onMounted(verify)
</script>
