export function getRecaptchaToken(action = 'login'): Promise<string> {
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
        .execute(process.env.VUE_APP_RECAPTCHA_SITE_KEY, { action })
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
