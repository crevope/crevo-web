import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for crevo-web smoke tests.
 *
 * Goal: catch the bugs that would make the site unusable in production —
 * landing page crashes, auth page renders, critical interactive surfaces
 * (simulator, login form) are reachable. We're deliberately not aiming for
 * full coverage here; Vitest / RTL are better tools for per-component
 * assertions. These tests run against a real dev / preview server and
 * treat the app as a black box, which is what makes them useful.
 *
 * The tests in `tests/e2e/` are the default smoke suite. CI runs them on
 * every PR; locally `yarn test:e2e` starts the dev server on an
 * unused port and tears it down afterwards.
 *
 * If `BASE_URL` is set (Vercel preview URL in CI, localhost:3001 in dev)
 * we skip the `webServer` block and hit that URL directly — simpler and
 * faster than re-booting Next for every test run.
 */

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100)
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`
const useRemote = Boolean(process.env.BASE_URL)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  // Keep the matrix small — Chromium covers 70% of traffic, Firefox
  // catches the occasional CSS-feature divergence, WebKit runs in CI
  // only because it's the slowest.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ...(process.env.CI
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]
      : []),
  ],

  webServer: useRemote
    ? undefined
    : {
        command: `next dev --port ${PORT}`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
