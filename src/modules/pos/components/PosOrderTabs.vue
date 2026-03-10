<template>
  <div class="d-flex align-center ga-2 pa-2" style="background: rgb(var(--v-theme-secondary))">
    <v-chip
      v-for="tab in posStore.orderTabs"
      :key="tab.id"
      :color="tab.active ? 'primary' : 'grey-lighten-2'"
      :variant="tab.active ? 'flat' : 'tonal'"
      size="large"
      class="mx-1"
      style="cursor: pointer"
      @click="posStore.selectOrder(tab.id)"
    >
      {{ tab.label }}
    </v-chip>

    <v-btn
      color="success"
      variant="flat"
      size="small"
      prepend-icon="mdi-plus"
      :loading="creating"
      :disabled="posStore.creatingOrder || !posStore.cashRegisterOpen"
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
