# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-auth.spec.ts >> 01 - Autenticación >> logout desde el menú de usuario regresa al login
- Location: e2e\01-auth.spec.ts:27:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { login, stubRecaptcha } from './fixtures/auth'
  3  | 
  4  | test.describe('01 - Autenticación', () => {
  5  |   test('login con credenciales válidas redirige a /dashboard', async ({
  6  |     page,
  7  |   }) => {
  8  |     await login(page, 'admin@test.com', 'password')
  9  | 
  10 |     await expect(page).toHaveURL(/\/dashboard/)
  11 |     // El AppBar debe mostrar el nombre del negocio o "Bar POS" cuando ya
  12 |     // está autenticado.
  13 |     await expect(page.locator('.v-app-bar')).toBeVisible()
  14 |   })
  15 | 
  16 |   test('login con credenciales inválidas muestra mensaje de error', async ({
  17 |     page,
  18 |   }) => {
  19 |     await login(page, 'admin@test.com', 'password-incorrecto', {
  20 |       expectFailure: true,
  21 |     })
  22 | 
  23 |     await expect(page).toHaveURL(/\/login/)
  24 |     await expect(page.locator('.v-alert')).toBeVisible()
  25 |   })
  26 | 
  27 |   test('logout desde el menú de usuario regresa al login', async ({
  28 |     page,
  29 |   }) => {
  30 |     await login(page, 'admin@test.com', 'password')
  31 |     await page.waitForURL(/\/dashboard/)
  32 | 
  33 |     // Abrir menú de usuario (botón con icono mdi-account-circle en AppBar)
  34 |     const accountButton = page
  35 |       .locator('.v-app-bar')
  36 |       .locator('button')
  37 |       .filter({ has: page.locator('.mdi-account-circle') })
  38 |       .first()
  39 |     await accountButton.click()
  40 | 
  41 |     // Click en "Cerrar Sesión"
  42 |     const logoutItem = page
  43 |       .getByRole('listitem')
  44 |       .filter({ hasText: /cerrar sesión/i })
  45 |       .first()
  46 |     await logoutItem.click()
  47 | 
> 48 |     await page.waitForURL(/\/login/, { timeout: 15_000 })
     |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  49 |     await expect(page).toHaveURL(/\/login/)
  50 |   })
  51 | 
  52 |   test('stub de reCAPTCHA está disponible antes del submit', async ({
  53 |     page,
  54 |   }) => {
  55 |     await stubRecaptcha(page)
  56 |     await page.goto('/login')
  57 | 
  58 |     const hasGrecaptcha = await page.evaluate(() => {
  59 |       const g = (window as unknown as { grecaptcha?: unknown }).grecaptcha
  60 |       return typeof g === 'object' && g !== null
  61 |     })
  62 |     expect(hasGrecaptcha).toBe(true)
  63 |   })
  64 | })
  65 | 
```