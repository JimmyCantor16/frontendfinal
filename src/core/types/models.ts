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

export type UserRole = 'admin' | 'cajero' | 'user'

export interface RoleRecord {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  roles?: RoleRecord[]
  business_id?: number
  business?: Business
  created_at?: string
  updated_at?: string
}

/**
 * Normaliza el rol de un usuario.
 * Soporta tanto `user.role` (string directo) como `user.roles` (relación pivot).
 */
export function normalizeUserRole(user: Record<string, unknown>): UserRole {
  if (typeof user.role === 'string' && user.role) {
    return user.role as UserRole
  }
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const first = user.roles[0]
    if (typeof first === 'string') return first as UserRole
    if (first && typeof first.name === 'string') return first.name as UserRole
  }
  return 'user'
}

/**
 * Normaliza un objeto user del API asegurando que `role` sea un string.
 */
export function normalizeUser(raw: Record<string, unknown>): User {
  const role = normalizeUserRole(raw)
  return { ...raw, role } as User
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
  barcode?: string | null
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
  received_quantity?: number
  returned_quantity?: number
  return_reason?: string
}

export type PurchaseOrderStatus = 'pending' | 'received' | 'cancelled'

export interface PurchaseOrder {
  id: number
  order_number?: string
  supplier_id: number
  supplier?: Supplier
  user?: User
  status: PurchaseOrderStatus
  subtotal: number
  tax: number
  total: number
  items: PurchaseOrderItem[]
  cancel_reason?: string
  received_by_name?: string
  cancelled_by_name?: string
  received_at?: string
  cancelled_at?: string
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
  user_id?: number
  user?: User
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
