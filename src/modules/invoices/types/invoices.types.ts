import type { PaymentMethod } from '@core/types/models'

export interface InvoiceItemForm {
  product_id: number | string
  quantity: number
  unit_price: number
}

export interface InvoiceForm {
  client_id: number | string
  payment_method?: PaymentMethod
  items: InvoiceItemForm[]
}
