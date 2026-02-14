import type { User, Business } from '@core/types/models'

export interface LoginPayload {
  email: string
  password: string
  recaptcha_token: string
}

export interface LoginResponse {
  access_token: string
  user: User
  business: Business
}

export interface AuthState {
  user: User | null
  token: string | null
  business: Business | null
  isAuthenticated: boolean
}
