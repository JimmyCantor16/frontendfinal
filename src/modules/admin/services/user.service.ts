import api from '@core/api/client'
import { normalizeUser } from '@core/types/models'
import type { User } from '@core/types/models'
import type { UserForm } from '../types/admin.types'

function normalizeList(raw: unknown[]): User[] {
  return raw.map((u) => normalizeUser(u as Record<string, unknown>))
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get('/users')
  const list = data.data ?? data
  return normalizeList(list)
}

export async function createUser(form: UserForm): Promise<User> {
  const { data } = await api.post('/users', form)
  return normalizeUser((data.data ?? data) as Record<string, unknown>)
}

export async function updateUser(id: number, form: Partial<UserForm>): Promise<User> {
  const payload = { ...form }
  if (!payload.password) delete payload.password
  const { data } = await api.put(`/users/${id}`, payload)
  return normalizeUser((data.data ?? data) as Record<string, unknown>)
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`)
}
