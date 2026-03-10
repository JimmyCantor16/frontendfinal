<template>
  <v-card
    :disabled="product.stock <= 0"
    class="pos-product-card"
    :class="{ 'opacity-50': product.stock <= 0 }"
    hover
    @click="$emit('add', product)"
  >
    <v-card-text class="text-center pa-5">
      <v-icon size="48" color="primary" class="mb-3">mdi-package-variant-closed</v-icon>
      <div class="text-subtitle-1 font-weight-bold" style="white-space: normal; word-break: break-word; line-height: 1.3">{{ product.name }}</div>
      <div class="text-h6 text-primary mt-2">{{ formatCOP(product.sale_price) }}</div>
      <v-chip
        :color="product.stock > 0 ? 'success' : 'error'"
        size="small"
        class="mt-2"
      >
        Stock: {{ product.stock }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Product } from '@core/types/models'
import { formatCOP } from '@core/utils/format'

defineProps<{
  product: Product
}>()

defineEmits<{
  add: [product: Product]
}>()
</script>

<style scoped>
.pos-product-card {
  cursor: pointer;
  transition: transform 0.15s;
  min-width: 180px;
}
.pos-product-card:hover:not(.v-card--disabled) {
  transform: translateY(-2px);
}
</style>
