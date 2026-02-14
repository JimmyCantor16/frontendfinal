<template>
  <div class="d-flex align-center ga-2 pa-2" style="background: rgb(var(--v-theme-secondary)); overflow-x: auto">
    <v-slide-group show-arrows>
      <v-slide-group-item v-for="tab in posStore.orderTabs" :key="tab.id">
        <v-chip
          :color="tab.active ? 'primary' : 'grey-lighten-2'"
          :variant="tab.active ? 'flat' : 'tonal'"
          class="mx-1"
          size="large"
          @click="posStore.selectOrder(tab.id)"
        >
          {{ tab.label }}
        </v-chip>
      </v-slide-group-item>
    </v-slide-group>

    <v-btn
      color="success"
      variant="flat"
      size="small"
      prepend-icon="mdi-plus"
      :loading="creating"
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
import { notifyApiError } from '@core/utils/notify'

const posStore = usePosStore()
const creating = ref(false)

async function onCreateOrder() {
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
