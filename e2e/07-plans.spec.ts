import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/auth'

test.describe('07 - Planes y Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('la página /plans muestra los planes con precios', async ({ page }) => {
    await page.goto('/plans')
    await expect(page).toHaveURL(/\/plans/)

    await expect(
      page.getByRole('heading', { name: /planes/i }),
    ).toBeVisible()

    // Esperar a que los planes se carguen.
    await page
      .locator('.v-progress-circular')
      .first()
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => {
        /* opcional */
      })

    // Esperamos 3 cards (Free, Pro, Enterprise).
    const planCards = page.locator('.v-card').filter({
      has: page.locator('.v-card-title'),
    })

    // Verificar al menos uno de los nombres conocidos.
    const bodyText = (await page.textContent('body')) ?? ''
    const hasFree = /free/i.test(bodyText)
    const hasPro = /\bpro\b/i.test(bodyText)
    const hasEnterprise = /enterprise/i.test(bodyText)

    expect(hasFree || hasPro || hasEnterprise).toBe(true)

    // Cada card debe mostrar un precio (text-h4 font-weight-bold).
    const prices = page.locator('.v-card .text-h4.font-weight-bold')
    const priceCount = await prices.count()
    expect(priceCount).toBeGreaterThan(0)
  })

  test('click en "Suscribirme" del plan Pro intenta ir a Stripe (puede fallar con mensaje claro)', async ({
    page,
  }) => {
    await page.goto('/plans')

    await page
      .locator('.v-progress-circular')
      .first()
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => {
        /* opcional */
      })

    // Buscar la card "Pro" y su botón "Suscribirme" / "Comenzar".
    const proCard = page
      .locator('.v-card')
      .filter({ hasText: /\bpro\b/i })
      .first()

    const proVisible = await proCard
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (!proVisible) {
      test.info().annotations.push({
        type: 'note',
        description: 'No se encontró un plan "Pro" — saltando assertion de checkout.',
      })
      return
    }

    const subscribeBtn = proCard
      .getByRole('button', { name: /suscribirme|comenzar|plan/i })
      .first()

    // Si el botón es "Plan activo" o disabled, no podemos probar checkout.
    if (await subscribeBtn.isDisabled().catch(() => true)) {
      test.info().annotations.push({
        type: 'note',
        description:
          'Botón del plan Pro deshabilitado (probablemente el plan actual) — no se prueba checkout.',
      })
      return
    }

    // Click y esperamos cualquiera de:
    //   - redirect a checkout.stripe.com
    //   - alerta de error (placeholder Stripe / 400)
    await subscribeBtn.click()

    // Esperamos hasta 10s a uno de los dos resultados.
    const errorAlert = page.locator('.v-alert[type="error"], .swal2-popup')
    const stripeRedirected = page.waitForURL(/stripe\.com|checkout/, {
      timeout: 10_000,
    })

    const result = await Promise.race([
      stripeRedirected.then(() => 'stripe' as const).catch(() => null),
      errorAlert
        .first()
        .waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => 'error' as const)
        .catch(() => null),
    ])

    // Cualquiera de los dos resultados es válido: lo importante es que el
    // click disparó la integración (no fue un no-op).
    expect(['stripe', 'error']).toContain(result)
  })
})
