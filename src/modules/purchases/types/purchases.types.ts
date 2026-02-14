export interface PurchaseOrderItemForm {
  product_id: number | string
  quantity: number
  unit_cost: number
}

export interface PurchaseOrderForm {
  supplier_id: number | string
  items: PurchaseOrderItemForm[]
}
