import type { Product } from '@core/types/models'

export interface DashboardStats {
  ventas_hoy: number
  ventas_mes: number
  facturas_hoy: number
  productos_stock_bajo: Product[]
}
