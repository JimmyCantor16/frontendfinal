import { Page, expect } from '@playwright/test'

/**
 * reCAPTCHA handling notes
 * ------------------------
 * LoginView.vue calls `getRecaptchaToken()` which expects a global
 * `window.grecaptcha` provided by Google's external script. In automated
 * tests Google often refuses to issue tokens (headless detection / new
 * browser fingerprint), so we stub `window.grecaptcha` BEFORE any app code
 * runs via `page.addInitScript`. The stub:
 *   - resolves `grecaptcha.ready(cb)` immediately
 *   - returns a deterministic dummy token from `grecaptcha.execute(...)`
 *
 * The backend's AuthController in local/dev environment is expected to
 * accept any non-empty recaptcha_token (typical Laravel pattern: the
 * recaptcha middleware is bypassed when APP_ENV=local). If the backend
 * rejects the stub token, set the env var `E2E_RECAPTCHA_TOKEN` to a real
 * token captured manually, or disable the middleware server-side for the
 * duration of the tests.
 *
 * We DO NOT modify any application source code — only test-time browser
 * state via addInitScript.
 */
export async function stubRecaptcha(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const token =
      (window as unknown as { __E2E_RECAPTCHA_TOKEN?: string })
        .__E2E_RECAPTCHA_TOKEN || 'e2e-test-token'

    ;(window as unknown as { grecaptcha: unknown }).grecaptcha = {
      ready: (cb: () => void) => {
        try {
          cb()
        } catch {
          /* ignore */
        }
      },
      execute: (_siteKey?: string, _opts?: { action?: string }) =>
        Promise.resolve(token),
      render: () => 0,
      reset: () => undefined,
    }
  })
}

export interface LoginOptions {
  /** Don't expect navigation away from /login (negative tests). */
  expectFailure?: boolean
}

/**
 * Reusable helper. Stubs reCAPTCHA, navigates to /login, fills the form
 * and submits. On success, waits for the URL to leave /login.
 */
export async function login(
  page: Page,
  email = 'admin@test.com',
  password = 'password',
  options: LoginOptions = {},
): Promise<void> {
  await stubRecaptcha(page)
  await page.goto('/login')

  // The Vuetify v-text-field renders a real <input>. Match by label text.
  const emailInput = page.getByLabel(/email/i).first()
  const passwordInput = page.getByLabel(/contraseña/i).first()

  await emailInput.waitFor({ state: 'visible' })
  await emailInput.fill(email)
  await passwordInput.fill(password)

  await page.getByRole('button', { name: /^login$/i }).click()

  if (options.expectFailure) {
    // Stay on /login with an error visible.
    await expect(page.locator('.v-alert')).toBeVisible({ timeout: 15_000 })
    return
  }

  // Wait for navigation away from /login (router pushes /dashboard).
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 20_000,
  })
}

/**
 * Convenience: log in and wait until the dashboard has rendered.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, 'admin@test.com', 'password')
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
}
