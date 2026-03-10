import type { User, UserRole } from '@core/types/models'

export type { User }

export interface UserForm {
  name: string
  email: string
  password: string
  role: UserRole | ''
}
