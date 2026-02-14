declare namespace NodeJS {
  interface ProcessEnv {
    VUE_APP_API_URL: string
    VUE_APP_RECAPTCHA_SITE_KEY: string
  }
}

interface Window {
  grecaptcha: {
    ready(cb: () => void): void
    execute(siteKey: string, options: { action: string }): Promise<string>
  }
}
