let scriptPromise: Promise<void> | null = null

// En dev mode el backend hace bypass de reCAPTCHA (APP_ENV=local),
// así evitamos cargar el script de Google que cuesta ~700 KB + 1-2 s.
const SKIP_RECAPTCHA = import.meta.env.DEV

function loadScript(): Promise<void> {
  if (SKIP_RECAPTCHA) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    if (!key) {
      reject(new Error('reCAPTCHA site key no configurada'))
      return
    }
    if (typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined') {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/api.js?render=${key}`
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => {
      scriptPromise = null
      reject(new Error('No se pudo cargar reCAPTCHA — verifica tu conexión'))
    }
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * Precarga el script de reCAPTCHA en background. Llamar desde `onMounted` de
 * LoginView para que cuando el usuario haga submit ya esté listo (en prod).
 * En dev es no-op.
 */
export function preloadRecaptcha(): void {
  if (SKIP_RECAPTCHA) return
  loadScript().catch(() => { /* silencioso — si falla, fallará igual en submit */ })
}

export async function getRecaptchaToken(action = 'login'): Promise<string> {
  if (SKIP_RECAPTCHA) return 'dev-bypass'
  await loadScript()

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('reCAPTCHA timeout — recarga la página e intenta de nuevo'))
    }, 10000)

    if (typeof window.grecaptcha === 'undefined') {
      clearTimeout(timeout)
      reject(new Error('reCAPTCHA no disponible — verifica tu conexión e intenta de nuevo'))
      return
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action })
        .then((token: string) => {
          clearTimeout(timeout)
          resolve(token)
        })
        .catch((err: unknown) => {
          clearTimeout(timeout)
          reject(err)
        })
    })
  })
}
