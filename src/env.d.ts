/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_RECAPTCHA_SITE_KEY: string
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  grecaptcha: {
    ready(cb: () => void): void
    execute(siteKey: string, options: { action: string }): Promise<string>
  }
}
