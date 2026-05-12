import api from '@core/api/client'
import type { Product } from '@core/types/models'

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/products')
  return data.data ?? data
}

/**
 * Busca un producto por código de barras. Devuelve null si no existe (404).
 */
export async function fetchProductByBarcode(code: string): Promise<Product | null> {
  try {
    const { data } = await api.get(`/products/barcode/${encodeURIComponent(code)}`)
    return (data.data ?? data) as Product
  } catch (err: unknown) {
    const e = err as { response?: { status?: number } }
    if (e.response?.status === 404) return null
    throw err
  }
}
