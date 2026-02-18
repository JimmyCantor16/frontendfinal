<template>
  <div class="d-flex align-center ga-2 pa-2" style="background: rgb(var(--v-theme-secondary))">
    <!-- Show current order label only (no multi-tab switching) -->
    <v-chip
      v-if="posStore.activeOrder"
      color="primary"
      variant="flat"
      size="large"
      class="mx-1"
    >
      {{ posStore.activeOrder.order_number }}
    </v-chip>

    <v-btn
      color="success"
      variant="flat"
      size="small"
      prepend-icon="mdi-plus"
      :loading="creating"
      :disabled="posStore.creatingOrder || !!posStore.activeOrder || !posStore.cashRegisterOpen"
      @click="onCreateOrder"
    >
      Nueva Orden
    </v-btn>

    <v-spacer />

    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePosStore } from '../store/pos.store'
import { useAuthStore } from '@modules/auth/store/auth.store'
import { useAuthGate } from '@core/composables/useAuthGate'
import { notifyApiError } from '@core/utils/notify'

const posStore = usePosStore()
const authStore = useAuthStore()
const { requirePassword } = useAuthGate()
const creating = ref(false)

async function onCreateOrder() {
  const role = (authStore.user?.role ?? '').toLowerCase()
  if (role && role !== 'admin') {
    const verified = await requirePassword('Crear Orden', 'Ingresa tu contraseña para crear una orden')
    if (!verified) return
  }

  creating.value = true
  try {
    await posStore.createOrder()
  } catch (err) {
    notifyApiError(err, 'Error al crear orden')
  } finally {
    creating.value = false
  }
}
</script>
