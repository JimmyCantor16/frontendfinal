import api from '@core/api/client'
import type { Order } from '@core/types/models'
import type { AddItemPayload, CloseOrderPayload } from '../types/pos.types'

export async function fetchOpenOrders(): Promise<Order[]> {
  const { data } = await api.get('/orders/open')
  return data.data ?? data
}

export async function createOrder(): Promise<Order> {
  const { data } = await api.post('/orders')
  return data.data ?? data
}

export async function addItem(orderId: number, payload: AddItemPayload): Promise<void> {
  await api.post(`/orders/${orderId}/add-item`, payload)
}

export async function removeItem(orderId: number, itemId: number): Promise<void> {
  await api.delete(`/orders/${orderId}/remove-item/${itemId}`)
}

export async function closeOrder(orderId: number, payload: CloseOrderPayload): Promise<void> {
  await api.post(`/orders/${orderId}/close`, payload)
}

export async function cancelOrder(orderId: number): Promise<void> {
  await api.post(`/orders/${orderId}/cancel`)
}
