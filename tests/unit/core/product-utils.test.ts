import { describe, it, expect } from 'vitest'
import { isProductLowStock, filterLowStockProducts } from '@core/utils/product'
import type { Product } from '@core/types/models'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1, sku: 'SKU1', name: 'Test', category_id: 1,
    purchase_price: 100, sale_price: 200, stock: 10,
    minimum_stock: 5, is_active: true,
    ...overrides,
  }
}

describe('isProductLowStock', () => {
  it('should return true when stock is 0', () => {
    expect(isProductLowStock(makeProduct({ stock: 0 }))).toBe(true)
  })

  it('should return true when stock <= minimum_stock', () => {
    expect(isProductLowStock(makeProduct({ stock: 3, minimum_stock: 5 }))).toBe(true)
    expect(isProductLowStock(makeProduct({ stock: 5, minimum_stock: 5 }))).toBe(true)
  })

  it('should return false when stock > minimum_stock', () => {
    expect(isProductLowStock(makeProduct({ stock: 10, minimum_stock: 5 }))).toBe(false)
  })

  it('should return false for inactive products', () => {
    expect(isProductLowStock(makeProduct({ stock: 0, is_active: false }))).toBe(false)
  })

  it('should handle minimum_stock of 0', () => {
    expect(isProductLowStock(makeProduct({ stock: 0, minimum_stock: 0 }))).toBe(true)
    expect(isProductLowStock(makeProduct({ stock: 5, minimum_stock: 0 }))).toBe(false)
  })
})

describe('filterLowStockProducts', () => {
  it('should filter only low stock active products', () => {
    const products = [
      makeProduct({ id: 1, stock: 0 }),
      makeProduct({ id: 2, stock: 10, minimum_stock: 5 }),
      makeProduct({ id: 3, stock: 3, minimum_stock: 5 }),
      makeProduct({ id: 4, stock: 0, is_active: false }),
    ]
    const result = filterLowStockProducts(products)
    expect(result).toHaveLength(2)
    expect(result.map(p => p.id)).toEqual([1, 3])
  })

  it('should return empty array for no low stock', () => {
    const products = [makeProduct({ stock: 100, minimum_stock: 5 })]
    expect(filterLowStockProducts(products)).toEqual([])
  })
})
