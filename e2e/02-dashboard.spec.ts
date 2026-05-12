import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/auth'

test.describe('02 - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('dashboard muestra los widgets principales', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)

    // Encabezado
    await expect(
      page.getByRole('heading', { name: /dashboard/i }),
    ).toBeVisible()

    // Las tres tarjetas de stats: Ventas Hoy, Ventas del Mes, Facturas Hoy
    await expect(page.getByText(/ventas hoy/i).first()).toBeVisible()
    await expect(page.getByText(/ventas del mes/i).first()).toBeVisible()
    await expect(page.getByText(/facturas hoy/i).first()).toBeVisible()

    // Tabla de stock bajo (al menos el encabezado debe renderizar)
    await expect(
      page.getByRole('heading', { name: /stock bajo/i }),
    ).toBeVisible()
  })

  test('los números de stats son numéricos no vacíos', async ({ page }) => {
    // Las cards de stats tienen un text-h5 con el valor; al menos uno
    // debería tener formato monetario "$" o un número.
    const statValues = page
      .locator('.v-card .text-h5.font-weight-bold')
      .first()
    await expect(statValues).toBeVisible()
    const text = (await statValues.textContent())?.trim() ?? ''
    // Debe contener al menos un dígito (ventas o facturas).
    expect(text).toMatch(/[\d]/)
  })

  test('navegación lateral lleva a /pos', async ({ page }) => {
    // El AppBar tiene un botón "POS" prominente cuando no estamos en /pos.
    const posBtn = page
      .locator('.v-app-bar')
      .getByRole('button', { name: /pos/i })
      .first()
    await posBtn.click()
    await page.waitForURL(/\/pos/, { timeout: 15_000 })
    await expect(page).toHaveURL(/\/pos/)
  })
})
