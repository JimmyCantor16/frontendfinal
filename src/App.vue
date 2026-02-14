<template>
  <v-app>
    <component :is="layout">
      <router-view />
    </component>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@modules/auth/store/auth.store'
import DefaultLayout from '@/app/layouts/DefaultLayout.vue'
import AuthLayout from '@/app/layouts/AuthLayout.vue'

const route = useRoute()
const authStore = useAuthStore()

const layouts: Record<string, typeof DefaultLayout | typeof AuthLayout> = {
  default: DefaultLayout,
  auth: AuthLayout,
}

const layout = computed(() => {
  const name = (route.meta.layout as string) || 'default'
  return layouts[name] || DefaultLayout
})

onMounted(() => {
  authStore.restoreInactivity()
})
</script>
