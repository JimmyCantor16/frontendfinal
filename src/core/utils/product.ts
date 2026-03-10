import type { Product } from '@core/types/models'

export function isProductLowStock(product: Product): boolean {
  const minStock = Number(product.minimum_stock) || 0
  return product.is_active && (product.stock === 0 || (minStock > 0 && product.stock <= minStock))
}

export function filterLowStockProducts(products: Product[]): Product[] {
  return products.filter(isProductLowStock)
}
