export interface InvoiceItemForm {
  product_id: number | string
  quantity: number
  unit_price: number
}

export interface InvoiceForm {
  client_id: number | string
  items: InvoiceItemForm[]
}
