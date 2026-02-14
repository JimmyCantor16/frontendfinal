import type { Order, OrderItem, PaymentMethod } from '@core/types/models'

export type { Order, OrderItem, PaymentMethod }

export interface PosState {
  openOrders: Order[]
  activeOrderId: number | null
}

export interface AddItemPayload {
  product_id: number
  quantity: number
}

export interface CloseOrderPayload {
  payment_method: PaymentMethod
  client_id?: number
}
