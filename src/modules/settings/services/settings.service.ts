import api from '@core/api/client'
import type { Business } from '@core/types/models'

export async function fetchBusinessSettings(): Promise<Business> {
  const { data } = await api.get('/business/settings')
  return data.data ?? data
}

export async function saveBusinessSettings(
  form: { name?: string; nit?: string; address?: string; phone?: string; email?: string },
  logo?: File | null
): Promise<Business> {
  const formData = new FormData()

  if (form.name) formData.append('name', form.name)
  if (form.nit) formData.append('nit', form.nit)
  if (form.address) formData.append('address', form.address)
  if (form.phone) formData.append('phone', form.phone)
  if (form.email) formData.append('email', form.email)
  if (logo) formData.append('logo', logo)

  const { data } = await api.post('/business/settings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data ?? data
}
