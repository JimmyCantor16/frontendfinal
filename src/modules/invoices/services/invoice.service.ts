import api from '@core/api/client'
import type { Invoice, Client, Product } from '@core/types/models'
import type { InvoiceForm } from '../types/invoices.types'

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data } = await api.get('/invoices')
  return data.data ?? data
}

export async function fetchInvoice(id: number | string): Promise<Invoice> {
  const { data } = await api.get(`/invoices/${id}`)
  return data.data ?? data
}

export async function createInvoice(form: InvoiceForm): Promise<void> {
  await api.post('/invoices', form)
}

export async function cancelInvoice(id: number): Promise<void> {
  await api.patch(`/invoices/${id}/cancel`)
}

export async function fetchClients(): Promise<Client[]> {
  const { data } = await api.get('/clients')
  return data.data ?? data
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/products')
  return data.data ?? data
}
