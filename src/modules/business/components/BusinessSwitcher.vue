<template>
  <v-menu v-if="businessStore.hasBusinesses" location="bottom end" offset="4">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        color="white"
        variant="text"
        class="text-none mr-2"
        prepend-icon="mdi-store-outline"
        append-icon="mdi-menu-down"
      >
        {{ currentName }}
      </v-btn>
    </template>

    <v-list density="compact" min-width="260">
      <v-list-subheader>Mis negocios</v-list-subheader>
      <v-list-item
        v-for="biz in businessStore.businesses"
        :key="biz.id"
        :active="biz.id === businessStore.currentBusinessId"
        @click="onSwitch(biz.id)"
      >
        <template #prepend>
          <v-icon size="small">
            {{ biz.id === businessStore.currentBusinessId ? 'mdi-check-circle' : 'mdi-store' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ biz.name }}</v-list-item-title>
        <v-list-item-subtitle v-if="biz.tax_id || biz.nit">
          {{ biz.tax_id || biz.nit }}
        </v-list-item-subtitle>
      </v-list-item>
      <v-divider />
      <v-list-item prepend-icon="mdi-cog-outline" to="/businesses">
        <v-list-item-title>Administrar negocios</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useBusinessStore } from '../stores/businessStore'

const businessStore = useBusinessStore()

const currentName = computed(
  () => businessStore.currentBusiness?.name ?? 'Selecciona un negocio'
)

async function onSwitch(id: number) {
  if (id === businessStore.currentBusinessId) return
  const ok = await businessStore.switchTo(id)
  if (ok) {
    // El header X-Business-Id se inyecta desde localStorage en el próximo request.
    window.location.reload()
  }
}

onMounted(() => {
  if (!businessStore.hasBusinesses) {
    businessStore.fetchAll()
  }
})
</script>
