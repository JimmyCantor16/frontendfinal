import api from '@core/api/client'
import type { InventoryMovement } from '@core/types/models'
import type { AdjustmentForm } from '../types/inventory.types'

export async function fetchMovements(): Promise<InventoryMovement[]> {
  const { data } = await api.get('/inventory-movements')
  return data.data ?? data
}

export async function adjustInventory(form: AdjustmentForm): Promise<void> {
  await api.post('/inventory-movements/adjust', form)
}
