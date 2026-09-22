import { defineConfig, devices } from '@playwright/test'

const baseURL =
  process.env.DASHBOARD_BASE_URL ||
  'https://mmo-cr-copilot-dashboard.dev.cdp-int.defra.cloud'

// When running through the BrowserStack SDK the browser/platform is driven by
// browserstack.yml; the local `projects` block is used for local runs only.
export default defineConfig({
  testDir: './playwright/tests',
  timeout: 60 * 1000,
  expect: { timeout: 15 * 1000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
