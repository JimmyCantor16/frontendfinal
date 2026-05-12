import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/auth'

test.describe('04 - Facturas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('lista de facturas carga y muestra registros existentes', async ({
    page,
  }) => {
    await page.goto('/invoices')
    await expect(page).toHaveURL(/\/invoices/)

    await expect(
      page.getByRole('heading', { name: /facturas/i }),
    ).toBeVisible()

    // La tabla de Vuetify renderiza filas <tr>. Esperamos que haya al
    // menos una factura (sembrado: 18 facturas demo).
    const dataTable = page.locator('.v-data-table').first()
    await expect(dataTable).toBeVisible()

    // Espera a que la tabla cargue: el spinner de loading desaparece.
    await page
      .locator('.v-data-table-progress')
      .first()
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => {
        /* puede no existir */
      })

    const rows = page.locator('.v-data-table tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('abrir detalle de la primera factura muestra items e IVA', async ({
    page,
  }) => {
    await page.goto('/invoices')

    await page
      .locator('.v-data-table-progress')
      .first()
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => {
        /* puede no existir */
      })

    const verBtn = page
      .locator('.v-data-table tbody tr')
      .first()
      .getByRole('button', { name: /ver/i })
    await verBtn.click()

    await page.waitForURL(/\/invoices\/\d+/, { timeout: 15_000 })

    await expect(
      page.getByRole('heading', { name: /factura\s*#/i }),
    ).toBeVisible({ timeout: 15_000 })

    // El detalle muestra Subtotal, IVA y Total.
    await expect(page.getByText(/subtotal/i).first()).toBeVisible()
    await expect(page.getByText(/iva/i).first()).toBeVisible()
    await expect(page.getByText(/total/i).first()).toBeVisible()

    // Tabla de items.
    await expect(page.locator('.v-data-table').first()).toBeVisible()
  })

  test('abrir el formulario de nueva factura (si la caja está abierta)', async ({
    page,
  }) => {
    await page.goto('/invoices')

    const nuevaBtn = page
      .getByRole('button', { name: /nueva factura/i })
      .first()
    await expect(nuevaBtn).toBeVisible()

    const disabled = await nuevaBtn.isDisabled()
    if (disabled) {
      test.info().annotations.push({
        type: 'note',
        description:
          'Botón "Nueva Factura" deshabilitado: caja cerrada. Skipping form check.',
      })
      return
    }

    await nuevaBtn.click()

    // Dialog persistente con título "Nueva Factura".
    const dialog = page.locator('.v-dialog').filter({
      hasText: /nueva factura/i,
    })
    await expect(dialog).toBeVisible({ timeout: 10_000 })

    // Selectors de cliente y producto presentes.
    await expect(dialog.getByLabel(/cliente/i).first()).toBeVisible()

    // Cerrar el dialog para no dejar estado.
    await dialog.getByRole('button', { name: /cancelar/i }).click()
  })
})
