<template>
  <div class="dashboard">
    <h2>Dashboard</h2>

    <div class="cards">
      <div class="card">
        <h4>Ventas Hoy</h4>
        <p class="amount">{{ formatCOP(stats.ventas_hoy) }}</p>
      </div>
      <div class="card">
        <h4>Ventas del Mes</h4>
        <p class="amount">{{ formatCOP(stats.ventas_mes) }}</p>
      </div>
      <div class="card">
        <h4>Facturas Hoy</h4>
        <p class="amount">{{ stats.facturas_hoy }}</p>
      </div>
    </div>

    <h3>Productos con Stock Bajo</h3>
    <table v-if="lowStock.length">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Nombre</th>
          <th>Stock</th>
          <th>Stock Mín.</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in lowStock" :key="p.id">
          <td>{{ p.sku }}</td>
          <td>{{ p.name }}</td>
          <td class="stock-low">{{ p.stock }}</td>
          <td>{{ p.minimum_stock }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">No hay productos con stock bajo.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const stats = ref({ ventas_hoy: 0, ventas_mes: 0, facturas_hoy: 0 })
const lowStock = ref([])

const formatCOP = (value) => {
  return '$ ' + Number(value || 0).toLocaleString('es-CO')
}

const fetchDashboard = async () => {
  try {
    const { data } = await api.get('/dashboard')
    stats.value = {
      ventas_hoy: data.ventas_hoy ?? 0,
      ventas_mes: data.ventas_mes ?? 0,
      facturas_hoy: data.facturas_hoy ?? 0
    }
    lowStock.value = data.productos_stock_bajo ?? []
  } catch (err) {
    console.error('Error cargando dashboard:', err)
  }
}

onMounted(() => fetchDashboard())
</script>

<style scoped>
.dashboard { max-width: 900px; }
h2 { color: #4f46e5; margin-bottom: 20px; }
h3 { color: #4f46e5; margin: 24px 0 12px; }

.cards {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card h4 { margin: 0 0 8px; color: #6b7280; font-size: 14px; }
.amount { font-size: 24px; font-weight: 700; color: #1e1b4b; margin: 0; }

table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
th { background: #4f46e5; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
tr:hover td { background: #f9fafb; }
.stock-low { color: #ef4444; font-weight: 600; }
.empty { color: #6b7280; font-style: italic; }
</style>
