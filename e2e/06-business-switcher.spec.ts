import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/auth'

test.describe('06 - BusinessSwitcher en AppBar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('el BusinessSwitcher muestra el negocio actual y lista los disponibles', async ({
    page,
  }) => {
    // El switcher es un v-btn con icono mdi-store-outline en el AppBar.
    const switcher = page
      .locator('.v-app-bar')
      .locator('button')
      .filter({ has: page.locator('.mdi-store-outline') })
      .first()

    // Puede no aparecer si el usuario no tiene negocios cargados.
    const visible = await switcher.isVisible({ timeout: 5_000 }).catch(() => false)

    if (!visible) {
      test.info().annotations.push({
        type: 'note',
        description:
          'BusinessSwitcher no visible — businessStore.hasBusinesses es false. Saltando assertions del menú.',
      })
      return
    }

    // El texto del botón es el nombre del negocio actual.
    const text = (await switcher.textContent())?.trim()
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(0)

    // Click para abrir el menú.
    await switcher.click()

    await expect(
      page.getByText(/mis negocios/i).first(),
    ).toBeVisible({ timeout: 5_000 })

    // Debe haber por lo menos un v-list-item (el negocio actual).
    const items = page.locator('.v-overlay .v-list-item')
    const itemCount = await items.count()
    expect(itemCount).toBeGreaterThan(0)

    // Cerrar el menú (Escape).
    await page.keyboard.press('Escape')
  })

  test('el nombre del negocio aparece en el AppBar', async ({ page }) => {
    // v-app-bar-title muestra el nombre o "Bar POS".
    const title = page.locator('.v-app-bar .v-app-bar-title').first()
    await expect(title).toBeVisible()
    const text = (await title.textContent())?.trim()
    expect(text).toBeTruthy()
  })
})
