<template>
  <v-chip-group v-model="selectedCategory" mandatory column>
    <v-chip filter value="" variant="outlined" color="primary">Todas</v-chip>
    <v-chip
      v-for="cat in categories"
      :key="cat.id"
      filter
      :value="cat.id"
      variant="outlined"
      color="primary"
    >
      {{ cat.name }}
    </v-chip>
  </v-chip-group>
</template>

<script setup lang="ts">
import type { Category } from '@core/types/models'

defineProps<{
  categories: Category[]
}>()

const selectedCategory = defineModel<number | string>({ default: '' })
</script>
