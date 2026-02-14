export interface CategoryForm {
  name: string
  description: string
}

export interface SupplierForm {
  name: string
  nit: string
  phone: string
  email: string
  contact_person: string
  is_active: boolean
}

export interface ClientForm {
  document_type: string
  document_number: string
  name: string
  phone: string
  email: string
  address: string
}
