export interface OrdenesPos {
  total: number
  ventas: number
  efectivo: number
  tarjeta: number
  transferencia: number
  qr: number
}

export interface FacturasResumen {
  total: number
  ventas: number
}

export interface CajaDiaria {
  id: number
  status: string
  opening_amount: number
  total_sales: number
  opened_at: string
  user: { id: number; name: string }
}

export interface DailyReport {
  fecha: string
  ventas_totales: number
  ordenes_pos: OrdenesPos
  facturas: FacturasResumen
  cajas: CajaDiaria[]
  productos_stock_bajo: number
}
