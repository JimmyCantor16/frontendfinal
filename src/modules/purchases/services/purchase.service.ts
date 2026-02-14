import api from '@core/api/client'
import type { PurchaseOrder, Supplier, Product } from '@core/types/models'
import type { PurchaseOrderForm } from '../types/purchases.types'

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data } = await api.get('/purchase-orders')
  return data.data ?? data
}

export async function fetchPurchaseOrder(id: number | string): Promise<PurchaseOrder> {
  const { data } = await api.get(`/purchase-orders/${id}`)
  return data.data ?? data
}

export async function createPurchaseOrder(form: PurchaseOrderForm): Promise<void> {
  await api.post('/purchase-orders', form)
}

export async function receivePurchaseOrder(id: number): Promise<void> {
  await api.patch(`/purchase-orders/${id}/receive`)
}

export async function cancelPurchaseOrder(id: number): Promise<void> {
  await api.patch(`/purchase-orders/${id}/cancel`)
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get('/suppliers')
  return data.data ?? data
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/products')
  return data.data ?? data
}
