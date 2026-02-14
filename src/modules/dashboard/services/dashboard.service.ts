import api from '@core/api/client'
import type { DashboardStats } from '../types/dashboard.types'

export async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard')
  return data.data ?? data
}
