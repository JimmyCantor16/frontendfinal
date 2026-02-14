export function getRecaptchaToken(action = 'login'): Promise<string> {
  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(process.env.VUE_APP_RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(reject)
    })
  })
}
