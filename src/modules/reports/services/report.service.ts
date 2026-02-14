import api from '@core/api/client'
import type { DailyReport } from '../types/reports.types'

export async function fetchDailyReport(date?: string): Promise<DailyReport> {
  const params = date ? { date } : {}
  const { data } = await api.get('/reports/daily', { params })
  return data.data ?? data
}
