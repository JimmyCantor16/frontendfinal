import { test, expect } from '@playwright/test'
import { login, stubRecaptcha } from './fixtures/auth'

test.describe('01 - Autenticación', () => {
  test('login con credenciales válidas redirige a /dashboard', async ({
    page,
  }) => {
    await login(page, 'admin@test.com', 'password')

    await expect(page).toHaveURL(/\/dashboard/)
    // El AppBar debe mostrar el nombre del negocio o "Bar POS" cuando ya
    // está autenticado.
    await expect(page.locator('.v-app-bar')).toBeVisible()
  })

  test('login con credenciales inválidas muestra mensaje de error', async ({
    page,
  }) => {
    await login(page, 'admin@test.com', 'password-incorrecto', {
      expectFailure: true,
    })

    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('.v-alert')).toBeVisible()
  })

  test('logout desde el menú de usuario regresa al login', async ({
    page,
  }) => {
    await login(page, 'admin@test.com', 'password')
    await page.waitForURL(/\/dashboard/)

    // Abrir menú de usuario (botón con icono mdi-account-circle en AppBar)
    const accountButton = page
      .locator('.v-app-bar')
      .locator('button')
      .filter({ has: page.locator('.mdi-account-circle') })
      .first()
    await accountButton.click()

    // Click en "Cerrar Sesión"
    const logoutItem = page
      .getByRole('listitem')
      .filter({ hasText: /cerrar sesión/i })
      .first()
    await logoutItem.click()

    await page.waitForURL(/\/login/, { timeout: 15_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('stub de reCAPTCHA está disponible antes del submit', async ({
    page,
  }) => {
    await stubRecaptcha(page)
    await page.goto('/login')

    const hasGrecaptcha = await page.evaluate(() => {
      const g = (window as unknown as { grecaptcha?: unknown }).grecaptcha
      return typeof g === 'object' && g !== null
    })
    expect(hasGrecaptcha).toBe(true)
  })
})
