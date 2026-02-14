export interface ProductForm {
  sku: string
  name: string
  description: string
  category_id: number | string
  purchase_price: number
  sale_price: number
  stock: number
  minimum_stock: number
  is_active: boolean
}

export interface AdjustmentForm {
  product_id: number | string
  new_stock: number
  reason: string
}
