import api from './api'

export interface LoginPayload {
  email: string
  password: string
}

export const login = async (data: LoginPayload) => {
  const response = await api.post('/login', data)

  const token = response.data.token
  localStorage.setItem('token', token)

  return response.data
}

export const logout = async () => {
  await api.post('/logout')
  localStorage.removeItem('token')
}

export const me = async () => {
  const response = await api.get('/me')
  return response.data
}
