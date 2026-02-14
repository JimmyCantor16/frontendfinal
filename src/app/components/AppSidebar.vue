<template>
  <v-navigation-drawer
    :model-value="modelValue"
    color="secondary"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-list nav density="compact">
      <!-- Dashboard -->
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        to="/dashboard"
        active-color="primary"
      />

      <!-- POS -->
      <v-list-item
        prepend-icon="mdi-point-of-sale"
        title="Punto de Venta"
        to="/pos"
        active-color="success"
      />

      <v-divider class="my-2" />

      <!-- Catalogos -->
      <v-list-subheader class="text-uppercase" style="color: rgb(var(--v-theme-accent))">
        Catálogos
      </v-list-subheader>
      <v-list-item prepend-icon="mdi-shape" title="Categorías" to="/categories" active-color="primary" />
      <v-list-item prepend-icon="mdi-truck" title="Proveedores" to="/suppliers" active-color="primary" />
      <v-list-item prepend-icon="mdi-account-group" title="Clientes" to="/clients" active-color="primary" />

      <v-divider class="my-2" />

      <!-- Inventario -->
      <v-list-subheader class="text-uppercase" style="color: rgb(var(--v-theme-accent))">
        Inventario
      </v-list-subheader>
      <v-list-item prepend-icon="mdi-package-variant-closed" title="Productos" to="/products" active-color="primary" />
      <v-list-item prepend-icon="mdi-swap-horizontal" title="Movimientos" to="/inventory" active-color="primary" />

      <v-divider class="my-2" />

      <!-- Operaciones -->
      <v-list-subheader class="text-uppercase" style="color: rgb(var(--v-theme-accent))">
        Operaciones
      </v-list-subheader>
      <v-list-item prepend-icon="mdi-cash-register" title="Caja Registradora" to="/cash-register" active-color="primary" />
      <v-list-item prepend-icon="mdi-cart" title="Órdenes de Compra" to="/purchase-orders" active-color="primary" />
      <v-list-item prepend-icon="mdi-file-document" title="Facturas" to="/invoices" active-color="primary" />

      <v-divider class="my-2" />

      <!-- Reportes -->
      <v-list-subheader class="text-uppercase" style="color: rgb(var(--v-theme-accent))">
        Reportes
      </v-list-subheader>
      <v-list-item prepend-icon="mdi-chart-bar" title="Reporte Diario" to="/reports/daily" active-color="primary" />

      <!-- Admin -->
      <template v-if="isAdmin">
        <v-divider class="my-2" />
        <v-list-subheader class="text-uppercase" style="color: rgb(var(--v-theme-accent))">
          Admin
        </v-list-subheader>
        <v-list-item prepend-icon="mdi-account-cog" title="Usuarios" to="/users" active-color="primary" />
      </template>

      <v-divider class="my-2" />

      <!-- Configuración -->
      <v-list-item prepend-icon="mdi-cog" title="Configuración" to="/settings" active-color="primary" />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@modules/auth/store/auth.store'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
