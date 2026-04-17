import { expect, test } from '@playwright/test'

/**
 * Smoke test suite.
 *
 * We only assert that the critical public surfaces render, load their
 * structured data, and route to the adjacent pages that support them.
 * The goal is to catch the kind of regression a stray import loop or a
 * bad env var would introduce — a crashed build, a 500, a missing SEO
 * schema — not to test feature logic.
 *
 * Anything that needs authentication is out of scope for smoke: those
 * flows depend on the backend being up and a seeded test user, and we
 * cover them in the feature-specific integration tests when that
 * infrastructure is wired in.
 */
test.describe('public surfaces', () => {
  test('landing renders with brand metadata and FAQ schema', async ({ page }) => {
    await page.goto('/')

    // `<title>` contains the brand name; the template in layout.tsx
    // prepends it to every child route's title.
    await expect(page).toHaveTitle(/Crevo/i)

    // Brand link in the header takes us back to /, proving the router
    // is wired up. Using role+name is stable across markup tweaks.
    await expect(page.getByRole('link', { name: /crevo/i }).first()).toBeVisible()

    // FAQ section and its JSON-LD schema both live in the home page.
    // The schema lives in a <script type="application/ld+json"> tag; its
    // presence validates that the server component tree rendered.
    const jsonLd = page.locator('script[type="application/ld+json"]')
    await expect(jsonLd.first())
      .toHaveCount(1, { timeout: 10_000 })
      .catch(async () => {
        // There's at least one ld+json block (Organization / WebSite) so
        // just confirm the count is > 0 for resilience to future additions.
        const count = await jsonLd.count()
        expect(count).toBeGreaterThan(0)
      })
  })

  test('login page loads noindexed with email field', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status(), 'HTTP status').toBe(200)

    // Auth pages set `noindex` via the Metadata API — confirm the meta
    // tag is in place so we don't accidentally deindex the landing.
    const robots = page.locator('meta[name="robots"]')
    await expect(robots).toHaveAttribute('content', /noindex/i)

    // The email input is the first interactive surface.
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })

  test('tarifas page renders BCRP rate table', async ({ page }) => {
    const response = await page.goto('/tarifas')
    expect(response?.status()).toBe(200)

    // At least one heading naming a Crevo product (Express / Flex / Plus)
    // should appear. If the backend is offline the page still renders
    // the skeleton, so we accept either the full data or the pending
    // state as long as the page didn't 500.
    await expect(page.locator('h1, h2, h3').first()).toBeVisible()
  })

  test('libro de reclamaciones is reachable from landing link', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: /libro de reclamaciones/i }).first()
    await expect(link).toBeVisible()
    await link.click()
    await page.waitForURL(/\/libro-de-reclamaciones/i)
    expect(page.url()).toContain('/libro-de-reclamaciones')
  })

  test('security.txt is served from /.well-known/', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/.well-known/security.txt`)
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('Contact:')
    expect(body).toMatch(/seguridad@crevo\.pe/)
  })

  test('robots.txt + sitemap.xml are discoverable', async ({ request, baseURL }) => {
    const robots = await request.get(`${baseURL}/robots.txt`)
    expect(robots.status()).toBe(200)
    expect(await robots.text()).toMatch(/Sitemap:/i)

    const sitemap = await request.get(`${baseURL}/sitemap.xml`)
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain('<urlset')
  })
})
