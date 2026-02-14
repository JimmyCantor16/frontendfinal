export interface OpenCashRegisterPayload {
  opening_amount: number
}

export interface CloseCashRegisterPayload {
  closing_amount: number
  notes?: string
}
