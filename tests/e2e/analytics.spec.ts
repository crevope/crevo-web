import { expect, test } from '@playwright/test'

const VISITOR_KEY = 'crevo_visitor_id'
const SESSION_KEY = 'crevo_session_id'
const LAST_SEEN_KEY = 'crevo_session_last_seen'

test.describe('analítica de demanda', () => {
  test('asigna un visitor id y lo conserva entre recargas', async ({ page }) => {
    await page.goto('/')

    const first = await page.evaluate((k) => localStorage.getItem(k), VISITOR_KEY)
    expect(first).toMatch(/^[0-9a-f-]{36}$/)

    await page.reload()
    const second = await page.evaluate((k) => localStorage.getItem(k), VISITOR_KEY)
    expect(second).toBe(first)
  })

  test('envía la visita con las cabeceras de identidad', async ({ page }) => {
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
    await page.goto('/')
    const first = await page.evaluate((k) => sessionStorage.getItem(k), SESSION_KEY)
    expect(first).toBeTruthy()

    await page.evaluate(
      ([k, v]) => sessionStorage.setItem(k!, v!),
      [LAST_SEEN_KEY, String(Date.now() - 31 * 60 * 1000)],
    )
    await page.reload()

    await expect
      .poll(() => page.evaluate((k) => sessionStorage.getItem(k), SESSION_KEY), { timeout: 10_000 })
      .not.toBe(first)
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
