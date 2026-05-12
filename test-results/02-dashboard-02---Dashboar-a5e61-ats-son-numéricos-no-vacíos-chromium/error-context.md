# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-dashboard.spec.ts >> 02 - Dashboard >> los números de stats son numéricos no vacíos
- Location: e2e\02-dashboard.spec.ts:28:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test'
  2  | 
  3  | /**
  4  |  * reCAPTCHA handling notes
  5  |  * ------------------------
  6  |  * LoginView.vue calls `getRecaptchaToken()` which expects a global
  7  |  * `window.grecaptcha` provided by Google's external script. In automated
  8  |  * tests Google often refuses to issue tokens (headless detection / new
  9  |  * browser fingerprint), so we stub `window.grecaptcha` BEFORE any app code
  10 |  * runs via `page.addInitScript`. The stub:
  11 |  *   - resolves `grecaptcha.ready(cb)` immediately
  12 |  *   - returns a deterministic dummy token from `grecaptcha.execute(...)`
  13 |  *
  14 |  * The backend's AuthController in local/dev environment is expected to
  15 |  * accept any non-empty recaptcha_token (typical Laravel pattern: the
  16 |  * recaptcha middleware is bypassed when APP_ENV=local). If the backend
  17 |  * rejects the stub token, set the env var `E2E_RECAPTCHA_TOKEN` to a real
  18 |  * token captured manually, or disable the middleware server-side for the
  19 |  * duration of the tests.
  20 |  *
  21 |  * We DO NOT modify any application source code — only test-time browser
  22 |  * state via addInitScript.
  23 |  */
  24 | export async function stubRecaptcha(page: Page): Promise<void> {
  25 |   await page.addInitScript(() => {
  26 |     const token =
  27 |       (window as unknown as { __E2E_RECAPTCHA_TOKEN?: string })
  28 |         .__E2E_RECAPTCHA_TOKEN || 'e2e-test-token'
  29 | 
  30 |     ;(window as unknown as { grecaptcha: unknown }).grecaptcha = {
  31 |       ready: (cb: () => void) => {
  32 |         try {
  33 |           cb()
  34 |         } catch {
  35 |           /* ignore */
  36 |         }
  37 |       },
  38 |       execute: (_siteKey?: string, _opts?: { action?: string }) =>
  39 |         Promise.resolve(token),
  40 |       render: () => 0,
  41 |       reset: () => undefined,
  42 |     }
  43 |   })
  44 | }
  45 | 
  46 | export interface LoginOptions {
  47 |   /** Don't expect navigation away from /login (negative tests). */
  48 |   expectFailure?: boolean
  49 | }
  50 | 
  51 | /**
  52 |  * Reusable helper. Stubs reCAPTCHA, navigates to /login, fills the form
  53 |  * and submits. On success, waits for the URL to leave /login.
  54 |  */
  55 | export async function login(
  56 |   page: Page,
  57 |   email = 'admin@test.com',
  58 |   password = 'password',
  59 |   options: LoginOptions = {},
  60 | ): Promise<void> {
  61 |   await stubRecaptcha(page)
  62 |   await page.goto('/login')
  63 | 
  64 |   // The Vuetify v-text-field renders a real <input>. Match by label text.
  65 |   const emailInput = page.getByLabel(/email/i).first()
  66 |   const passwordInput = page.getByLabel(/contraseña/i).first()
  67 | 
  68 |   await emailInput.waitFor({ state: 'visible' })
  69 |   await emailInput.fill(email)
  70 |   await passwordInput.fill(password)
  71 | 
  72 |   await page.getByRole('button', { name: /^login$/i }).click()
  73 | 
  74 |   if (options.expectFailure) {
  75 |     // Stay on /login with an error visible.
  76 |     await expect(page.locator('.v-alert')).toBeVisible({ timeout: 15_000 })
  77 |     return
  78 |   }
  79 | 
  80 |   // Wait for navigation away from /login (router pushes /dashboard).
> 81 |   await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
     |              ^ TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
  82 |     timeout: 20_000,
  83 |   })
  84 | }
  85 | 
  86 | /**
  87 |  * Convenience: log in and wait until the dashboard has rendered.
  88 |  */
  89 | export async function loginAsAdmin(page: Page): Promise<void> {
  90 |   await login(page, 'admin@test.com', 'password')
  91 |   await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
  92 | }
  93 | 
```