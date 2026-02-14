<template>
  <v-card
    :disabled="product.stock <= 0"
    class="pos-product-card"
    :class="{ 'opacity-50': product.stock <= 0 }"
    hover
    @click="$emit('add', product)"
  >
    <v-card-text class="text-center pa-4">
      <v-icon size="40" color="primary" class="mb-2">mdi-glass-cocktail</v-icon>
      <div class="text-subtitle-2 font-weight-bold text-truncate">{{ product.name }}</div>
      <div class="text-h6 text-primary mt-1">{{ formatCOP(product.sale_price) }}</div>
      <v-chip
        :color="product.stock > 0 ? 'success' : 'error'"
        size="x-small"
        class="mt-1"
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
  min-width: 140px;
}
.pos-product-card:hover:not(.v-card--disabled) {
  transform: translateY(-2px);
}
</style>
