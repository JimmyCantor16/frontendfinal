import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Jamz POS E2E tests.
 *
 * Tests run HEADED by default (browser visible) with slowMo so the user can
 * see every action. The dev server is expected to be already running at
 * http://localhost:8080 — start it with `npm run serve` before running the
 * suite.
 *
 * Run with:
 *   npm run test:e2e          # headed, slow-motion
 *   npm run test:e2e:headed   # explicit headed
 *   npm run test:e2e:ui       # interactive UI mode
 *   npm run test:e2e:report   # open last HTML report
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html'], ['list']],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: 'http://localhost:8080',
    headless: false,
    video: 'on',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1366, height: 768 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      slowMo: 300,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        headless: false,
        launchOptions: {
          slowMo: 300,
        },
      },
    },
  ],
})
