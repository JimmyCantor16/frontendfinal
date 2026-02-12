<template>
  <aside class="sidebar">
    <nav>
      <div class="sidebar-section">
        <router-link to="/dashboard" class="sidebar-link" active-class="active">Dashboard</router-link>
      </div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">Catálogos</h4>
        <router-link to="/categories" class="sidebar-link" active-class="active">Categorías</router-link>
        <router-link to="/suppliers" class="sidebar-link" active-class="active">Proveedores</router-link>
        <router-link to="/clients" class="sidebar-link" active-class="active">Clientes</router-link>
      </div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">Inventario</h4>
        <router-link to="/products" class="sidebar-link" active-class="active">Productos</router-link>
        <router-link to="/inventory" class="sidebar-link" active-class="active">Movimientos</router-link>
      </div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">Operaciones</h4>
        <router-link to="/purchase-orders" class="sidebar-link" active-class="active">Órdenes de Compra</router-link>
        <router-link to="/invoices" class="sidebar-link" active-class="active">Facturas</router-link>
      </div>

      <div v-if="isAdmin" class="sidebar-section">
        <h4 class="sidebar-title">Admin</h4>
        <router-link to="/users" class="sidebar-link" active-class="active">Usuarios</router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: calc(100vh - 46px);
  background: #1e1b4b;
  padding: 16px 0;
  flex-shrink: 0;
}

.sidebar-section {
  margin-bottom: 8px;
  padding: 0 12px;
}

.sidebar-title {
  color: #a5b4fc;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 16px 0 6px;
  padding: 0 8px;
}

.sidebar-link {
  display: block;
  color: #c7d2fe;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: background 0.15s;
}

.sidebar-link:hover {
  background: #312e81;
  color: white;
}

.sidebar-link.active {
  background: #4f46e5;
  color: white;
  font-weight: 600;
}
</style>
