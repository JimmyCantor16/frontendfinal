import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/auth'

test.describe('05 - Caja Registradora', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('vista de caja registradora carga correctamente', async ({ page }) => {
    await page.goto('/cash-register')

    await expect(page).toHaveURL(/\/cash-register/)
    await expect(
      page.getByRole('heading', { name: /caja registradora/i }),
    ).toBeVisible()

    // Esperar a que termine la carga.
    await page
      .locator('.v-progress-circular')
      .first()
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => {
        /* opcional */
      })
  })

  test('si hay caja abierta, muestra totales por método de pago', async ({
    page,
  }) => {
    await page.goto('/cash-register')

    await page
      .locator('.v-progress-circular')
      .first()
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => {
        /* opcional */
      })

    const hayCaja = await page
      .getByText(/caja activa/i)
      .first()
      .isVisible()
      .catch(() => false)

    if (!hayCaja) {
      test.info().annotations.push({
        type: 'note',
        description: 'No hay caja abierta — sólo se valida el formulario.',
      })
      // Validamos al menos que el formulario de apertura exista.
      await expect(page.getByText(/no hay caja abierta/i).first()).toBeVisible()
      await expect(
        page.getByRole('button', { name: /abrir caja/i }).first(),
      ).toBeVisible()
      return
    }

    // Sí hay caja: deben existir métricas por método de pago.
    await expect(page.getByText(/efectivo/i).first()).toBeVisible()
    await expect(page.getByText(/tarjeta/i).first()).toBeVisible()
    await expect(page.getByText(/transferencia/i).first()).toBeVisible()
    await expect(page.getByText(/qr/i).first()).toBeVisible()

    // Y datos de la caja: monto inicial, ventas totales, órdenes cerradas.
    await expect(page.getByText(/monto inicial/i).first()).toBeVisible()
    await expect(page.getByText(/ventas totales/i).first()).toBeVisible()
    await expect(page.getByText(/órdenes cerradas/i).first()).toBeVisible()
  })
})
