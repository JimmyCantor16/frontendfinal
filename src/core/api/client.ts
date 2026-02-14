import axios from 'axios'
import type { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL + '/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
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
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
