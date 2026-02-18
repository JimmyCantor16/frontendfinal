import api from '@core/api/client'

export async function verifyPassword(password: string): Promise<boolean> {
  try {
    await api.post('/verify-password', { password })
    return true
  } catch {
    return false
  }
}
