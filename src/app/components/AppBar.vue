<template>
  <v-app-bar color="primary" density="comfortable" elevation="2">
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')" />

    <!-- Business branding -->
    <v-avatar v-if="authStore.businessLogo" size="32" class="ml-2 mr-2">
      <v-img :src="authStore.businessLogo" :alt="authStore.businessName" />
    </v-avatar>
    <v-icon v-else class="ml-2 mr-1" size="28">mdi-store</v-icon>

    <v-app-bar-title class="text-h6 font-weight-bold">
      {{ authStore.businessName || 'Bar POS' }}
    </v-app-bar-title>

    <v-spacer />

    <v-btn
      v-if="isInPos"
      color="white"
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mr-2"
      to="/dashboard"
    >
      Volver
    </v-btn>
    <v-btn
      v-else
      color="success"
      variant="flat"
      prepend-icon="mdi-point-of-sale"
      class="mr-2"
      to="/pos"
    >
      POS
    </v-btn>

    <v-menu>
      <template #activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" min-width="220">
        <v-list-item>
          <v-list-item-title class="font-weight-bold">{{ authStore.user?.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-list-item v-if="authStore.business" disabled>
          <template #prepend><v-icon size="small">mdi-store</v-icon></template>
          <v-list-item-title class="text-caption">{{ authStore.businessName }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            Plan {{ authStore.business.plan }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-list-item prepend-icon="mdi-cog" to="/settings">
          <v-list-item-title>Configuración</v-list-item-title>
        </v-list-item>
        <v-list-item prepend-icon="mdi-logout" @click="authStore.logout()">
          <v-list-item-title>Cerrar Sesión</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@modules/auth/store/auth.store'

const authStore = useAuthStore()
const route = useRoute()
const isInPos = computed(() => route.path === '/pos')

defineEmits<{
  'toggle-drawer': []
}>()
</script>
