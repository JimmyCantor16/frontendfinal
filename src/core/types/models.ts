export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled'
export type PlanTier = 'free' | 'starter' | 'pro' | 'enterprise'

export interface Business {
  id: number
  name: string
  slug?: string
  logo?: string | null
  logo_url?: string | null
  address?: string
  phone?: string
  email?: string
  nit?: string
  plan?: PlanTier
  subscription_plan?: string
  subscription_status: SubscriptionStatus
  plan_limits?: unknown
  trial_ends_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  business_id?: number
  business?: Business
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Supplier {
  id: number
  name: string
  nit: string
  phone?: string
  email?: string
  contact_person?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Client {
  id: number
  document_type: 'CC' | 'NIT' | 'CE' | 'TI' | 'PP'
  document_number: string
  name: string
  phone?: string
  email?: string
  address?: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  sku: string
  name: string
  description?: string
  category_id: number
  category?: Category
  purchase_price: number
  sale_price: number
  stock: number
  minimum_stock: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: number
  subtotal: number
  created_at?: string
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'qr'
export type OrderStatus = 'open' | 'closed' | 'cancelled'

export interface Order {
  id: number
  order_number: string
  status: OrderStatus
  payment_method?: PaymentMethod
  total: number
  items: OrderItem[]
  user_id?: number
  user?: User
  client_id?: number | null
  client?: Client | null
  created_at?: string
  updated_at?: string
}

export interface PurchaseOrderItem {
  id: number
  product_id: number
  product?: Product
  quantity: number
  unit_cost: number
  subtotal?: number
}

export type PurchaseOrderStatus = 'pending' | 'received' | 'cancelled'

export interface PurchaseOrder {
  id: number
  order_number?: string
  supplier_id: number
  supplier?: Supplier
  status: PurchaseOrderStatus
  subtotal: number
  tax: number
  total: number
  items: PurchaseOrderItem[]
  created_at?: string
  updated_at?: string
}

export interface InvoiceItem {
  id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: number
  subtotal?: number
}

export type InvoiceStatus = 'completed' | 'cancelled'

export interface Invoice {
  id: number
  invoice_number?: string
  client_id: number
  client?: Client
  status: InvoiceStatus
  subtotal: number
  tax: number
  total: number
  items: InvoiceItem[]
  created_at?: string
  updated_at?: string
}

export type InventoryMovementType = 'purchase' | 'sale' | 'adjustment' | 'cancellation'

export interface InventoryMovement {
  id: number
  product_id: number
  product?: Product
  user_id: number
  user?: User
  type: InventoryMovementType
  quantity: number
  stock_before: number
  stock_after: number
  reason?: string
  created_at?: string
}

export type CashRegisterStatus = 'open' | 'closed'

export interface CashRegister {
  id: number
  user_id: number
  user?: User
  business_id: number
  status: CashRegisterStatus
  opening_amount: number
  closing_amount?: number | null
  expected_amount?: number | null
  difference?: number | null
  total_sales?: number
  total_cash?: number
  total_card?: number
  total_transfer?: number
  total_qr?: number
  orders_closed?: number
  notes?: string | null
  opened_at: string
  closed_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface DashboardStats {
  ventas_hoy: number
  ventas_mes: number
  facturas_hoy: number
  productos_stock_bajo: Product[]
}
