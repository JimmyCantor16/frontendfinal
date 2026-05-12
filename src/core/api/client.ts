import axios from 'axios'
import type { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api',
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
    const status = err.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('business')
      window.location.href = '/login'
    } else if (status === 402) {
      // Payment required — suscripción vencida o ausente
      try {
        // Lazy import to avoid circular dependency at module load
        import('@core/utils/notify').then(({ notifyError }) => {
          const msg = err.response?.data?.message
            ?? 'Tu suscripción está vencida. Renueva tu plan para continuar.'
          notifyError('Suscripción requerida', String(msg))
        }).catch(() => { /* notify unavailable */ })
        if (typeof window !== 'undefined' && window.location.pathname !== '/plans') {
          window.location.href = '/plans'
        }
      } catch {
        // ignore
      }
    } else if (status === 403) {
      try {
        import('@core/utils/notify').then(({ notifyError }) => {
          const msg = err.response?.data?.message
            ?? 'Tu plan no incluye esta función'
          notifyError('Acceso denegado', String(msg))
        }).catch(() => { /* notify unavailable */ })
      } catch {
        // ignore
      }
    }
    return Promise.reject(err)
  }
)

export default api
