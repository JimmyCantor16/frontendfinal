import api from '@core/api/client'
import { normalizeUser } from '@core/types/models'
import type { LoginPayload, LoginResponse } from '../types/auth.types'
import type { User } from '@core/types/models'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/login', payload)
  if (data.user) {
    data.user = normalizeUser(data.user as unknown as Record<string, unknown>)
  }
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get('/me')
  return normalizeUser((data.data ?? data) as Record<string, unknown>)
}
