export interface PurchaseOrderItemForm {
  product_id: number | string
  quantity: number
  unit_cost: number
}

export interface PurchaseOrderForm {
  supplier_id: number | string
  items: PurchaseOrderItemForm[]
}

export interface ReceiveItemPayload {
  item_id: number
  received_quantity: number
  returned_quantity: number
  return_reason?: string
}

export interface ReceivePurchaseOrderPayload {
  items: ReceiveItemPayload[]
}
