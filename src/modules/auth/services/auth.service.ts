import api from '@core/api/client'
import type { LoginPayload, LoginResponse } from '../types/auth.types'
import type { User } from '@core/types/models'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/login', payload)
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/me')
  return data
}
