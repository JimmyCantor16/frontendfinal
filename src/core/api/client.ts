import axios from 'axios'
import type { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: (process.env.VUE_APP_API_URL || 'http://127.0.0.1:8000') + '/api',
  headers: { Accept: 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const business = localStorage.getItem('business')
    if (business) {
      try {
        const parsed = JSON.parse(business)
        if (parsed?.id) {
          config.headers['X-Business-Id'] = String(parsed.id)
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // localStorage unavailable
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('business')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
