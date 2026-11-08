import { expect, test, type Page } from '@playwright/test'

const VISITOR_KEY = 'crevo_visitor_id'
const SESSION_KEY = 'crevo_session_id'
const LAST_SEEN_KEY = 'crevo_session_last_seen'
const CONSENT_KEY = 'crevo_cookie_consent'

/** Seeds the analytics consent before any page script runs. */
async function grantAnalyticsConsent(page: Page) {
  await page.addInitScript(
    ([key, payload]) => localStorage.setItem(key!, payload!),
    [
      CONSENT_KEY,
      JSON.stringify({
        // Debe coincidir con CONSENT_VERSION en features/cookie-consent/lib/consentStorage.ts
        version: 2,
        decidedAt: new Date().toISOString(),
        categories: { necessary: true, analytics: true, marketing: false },
      }),
    ],
  )
}

test.describe('analítica de demanda', () => {
  test('asigna un visitor id y lo conserva entre recargas', async ({ page }) => {
    await grantAnalyticsConsent(page)
    await page.goto('/')

    // El id nace en el efecto del tracker, que corre tras la hidratación: hay
    // que esperarlo, no leerlo de una.
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), VISITOR_KEY), { timeout: 15_000 })
      .toMatch(/^[0-9a-f-]{36}$/)
    const first = await page.evaluate((k) => localStorage.getItem(k), VISITOR_KEY)

    await page.reload()
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), VISITOR_KEY), { timeout: 15_000 })
      .toBe(first)
  })

  test('envía la visita con las cabeceras de identidad', async ({ page }) => {
    await grantAnalyticsConsent(page)
    const seen: Record<string, string>[] = []

    // El backend aún no expone la ruta: la interceptamos y respondemos nosotros.
    await page.route('**/leads/page-view', async (route) => {
      seen.push(route.request().headers())
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"success":true}',
      })
    })

    await page.goto('/')

    await expect.poll(() => seen.length, { timeout: 10_000 }).toBeGreaterThan(0)
    expect(seen[0]!['x-visitor-id']).toBeTruthy()
    expect(seen[0]!['x-session-id']).toBeTruthy()
  })

  test('abre una sesión nueva tras 30 minutos de inactividad', async ({ page }) => {
    await grantAnalyticsConsent(page)
    await page.goto('/')

    await expect
      .poll(() => page.evaluate((k) => sessionStorage.getItem(k), SESSION_KEY), { timeout: 15_000 })
      .toBeTruthy()
    const first = await page.evaluate((k) => sessionStorage.getItem(k), SESSION_KEY)

    await page.evaluate(
      ([k, v]) => sessionStorage.setItem(k!, v!),
      [LAST_SEEN_KEY, String(Date.now() - 31 * 60 * 1000)],
    )
    await page.reload()

    await expect
      .poll(() => page.evaluate((k) => sessionStorage.getItem(k), SESSION_KEY), { timeout: 10_000 })
      .not.toBe(first)
  })

  test('sin consentimiento de analítica no guarda ninguna identidad', async ({ page }) => {
    // Sin consentimiento previo el banner aún no se respondió: no se escribe nada.
    const headers: Record<string, string>[] = []
    await page.route('**/leads/page-view', async (route) => {
      headers.push(route.request().headers())
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"success":true}',
      })
    })

    await page.goto('/')

    // Esperar a que el tracker haya corrido de verdad: si no, la ausencia de
    // identidad podría ser solo que aún no le dio tiempo.
    await expect.poll(() => headers.length, { timeout: 15_000 }).toBeGreaterThan(0)

    const visitor = await page.evaluate((k) => localStorage.getItem(k), VISITOR_KEY)
    const session = await page.evaluate((k) => sessionStorage.getItem(k), SESSION_KEY)
    expect(visitor).toBeNull()
    expect(session).toBeNull()

    for (const h of headers) {
      expect(h['x-visitor-id']).toBeUndefined()
      expect(h['x-session-id']).toBeUndefined()
    }
  })

  test('no rompe la página cuando el almacenamiento está bloqueado', async ({ page }) => {
    await page.addInitScript(() => {
      const blow = () => {
        throw new Error('bloqueado')
      }
      Object.defineProperty(Storage.prototype, 'getItem', { value: blow })
      Object.defineProperty(Storage.prototype, 'setItem', { value: blow })
    })

    await page.goto('/')
    await expect(page).toHaveTitle(/Crevo/i)
  })
})
