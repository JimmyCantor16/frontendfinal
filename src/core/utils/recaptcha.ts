let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
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

export async function getRecaptchaToken(action = 'login'): Promise<string> {
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
