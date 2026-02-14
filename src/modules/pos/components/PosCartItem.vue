<template>
  <v-list-item class="px-4">
    <template #prepend>
      <v-avatar color="primary" size="32" class="mr-3">
        <span class="text-caption font-weight-bold">{{ item.quantity }}</span>
      </v-avatar>
    </template>

    <v-list-item-title class="text-body-2">
      {{ item.product?.name ?? `Producto #${item.product_id}` }}
    </v-list-item-title>
    <v-list-item-subtitle class="text-caption">
      {{ formatCOP(item.unit_price) }} c/u
    </v-list-item-subtitle>

    <template #append>
      <div class="d-flex align-center ga-2">
        <span class="text-body-2 font-weight-bold">{{ formatCOP(item.subtotal) }}</span>
        <v-btn icon size="x-small" color="error" variant="text" @click="$emit('remove', item.id)">
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </div>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import type { OrderItem } from '@core/types/models'
import { formatCOP } from '@core/utils/format'

defineProps<{
  item: OrderItem
}>()

defineEmits<{
  remove: [itemId: number]
}>()
</script>
