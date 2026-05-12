import { test, expect, Page } from '@playwright/test'
import { loginAsAdmin } from './fixtures/auth'

/**
 * El test estrella: flujo completo del POS.
 *
 *   login → abrir caja si hace falta → crear orden → agregar productos
 *   → ver total → pagar con efectivo → confirmar éxito
 */

async function ensureCashRegisterOpen(page: Page): Promise<void> {
  await page.goto('/cash-register')

  // Esperar a que el spinner inicial desaparezca.
  await page
    .locator('.v-progress-circular')
    .first()
    .waitFor({ state: 'detached', timeout: 15_000 })
    .catch(() => {
      /* puede no existir */
    })

  // Si vemos el botón "Abrir Caja" significa que NO hay caja abierta.
  const abrirCajaBtn = page
    .getByRole('button', { name: /abrir caja/i })
    .first()
  const visible = await abrirCajaBtn.isVisible().catch(() => false)

  if (!visible) {
    // Ya hay caja abierta — nada que hacer.
    return
  }

  // Llenar el monto inicial.
  const monto = page.getByLabel(/monto inicial/i).first()
  await monto.fill('200000')

  await abrirCajaBtn.click()

  // El gate puede pedir contraseña con SweetAlert2 (promptPassword).
  // Intentamos rellenarlo si aparece.
  const swalInput = page.locator('.swal2-input').first()
  if (await swalInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await swalInput.fill('password')
    await page
      .locator('.swal2-confirm')
      .first()
      .click()
  }

  // Esperar a que el panel cambie a "Caja Activa".
  await expect(page.getByText(/caja activa/i).first()).toBeVisible({
    timeout: 20_000,
  })
}

test.describe('03 - POS - flujo de venta completo', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('venta completa: abrir caja, crear orden, agregar productos, pagar en efectivo', async ({
    page,
  }) => {
    test.setTimeout(180_000)

    // 1. Asegurar caja abierta.
    await ensureCashRegisterOpen(page)

    // 2. Ir al POS.
    await page.goto('/pos')
    await expect(page).toHaveURL(/\/pos/)

    // Esperar la carga inicial.
    await page
      .locator('.v-progress-circular')
      .first()
      .waitFor({ state: 'detached', timeout: 20_000 })
      .catch(() => {
        /* opcional */
      })

    // 3. Si vemos la pantalla de bienvenida, click en "Crear Primera Orden".
    //    Si no, vemos "Nueva Orden" en PosOrderTabs.
    const crearPrimera = page
      .getByRole('button', { name: /crear primera orden/i })
      .first()
    const nuevaOrden = page
      .getByRole('button', { name: /nueva orden/i })
      .first()

    if (await crearPrimera.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await crearPrimera.click()
    } else if (
      await nuevaOrden.isVisible({ timeout: 2_000 }).catch(() => false)
    ) {
      await nuevaOrden.click()
    }

    // Esperar a que el carrito sea visible (panel derecho con "Total:").
    await expect(page.getByText(/^total:?$/i).first()).toBeVisible({
      timeout: 20_000,
    })

    // 4. Agregar 2-3 productos (cards de productos).
    //    Los PosProductCard son v-card clickeables; estructuralmente cada
    //    producto tiene un botón "add" o el card completo dispara @add.
    //    Buscamos los cards de productos visibles a la izquierda.
    const productCards = page.locator('.pos-container .v-card').filter({
      hasText: /\$/, // los cards muestran el precio
    })

    // Las cards "Total:" y otras también pueden contener $, así que filtramos
    // a las que tienen width 200 (las product cards explícitas).
    const allCards = page.locator(
      '.pos-container > div > div .v-card[style*="200"], .pos-container .v-card[style*="width: 200"]',
    )

    let cardCount = await allCards.count()
    let cardsToUse = allCards

    if (cardCount < 1) {
      // Fallback: buscar cualquier v-card clickeable en el área de productos.
      cardsToUse = productCards
      cardCount = await productCards.count()
    }

    expect(cardCount).toBeGreaterThan(0)

    const productsToAdd = Math.min(3, cardCount)
    for (let i = 0; i < productsToAdd; i++) {
      await cardsToUse.nth(i).click()
      // Pausa pequeña para que el usuario vea cada acción.
      await page.waitForTimeout(400)
    }

    // 5. Verificar que el total es > 0.
    const totalText = await page
      .locator('.text-h5.font-weight-bold.text-primary')
      .first()
      .textContent()
    expect(totalText).toBeTruthy()
    const totalNum = Number(
      (totalText ?? '').replace(/[^\d]/g, '') || '0',
    )
    expect(totalNum).toBeGreaterThan(0)

    // 6. Click en "Cerrar Venta".
    await page.getByRole('button', { name: /cerrar venta/i }).first().click()

    // 7. Dialog de pago — seleccionar "Efectivo".
    const dialog = page.locator('.v-dialog .v-card').filter({
      hasText: /método de pago/i,
    })
    await expect(dialog).toBeVisible({ timeout: 10_000 })

    await dialog.getByRole('button', { name: /efectivo/i }).first().click()

    // 8. Confirmar.
    await dialog
      .getByRole('button', { name: /confirmar y cerrar venta/i })
      .click()

    // 9. Mensaje de éxito (Sweetalert2 / toast). Aceptamos cualquiera de:
    //    - banner sweetalert "Venta cerrada"
    //    - vista "Venta Cerrada" en PosView (post-sale summary)
    const successIndicator = page.locator(
      '.swal2-popup, .v-snackbar, .text-success',
    )
    await expect(successIndicator.first()).toBeVisible({ timeout: 15_000 })

    // Buscar el texto "Venta Cerrada" o "exitosamente".
    const finalText = await page.textContent('body')
    expect(finalText).toMatch(/venta\s*cerrada|exitosamente|nueva venta/i)
  })
})
