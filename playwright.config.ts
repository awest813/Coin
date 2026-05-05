import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    headless: true,
    baseURL: 'http://localhost:5173',
    actionTimeout: 30000,
    viewport: { width: 1920, height: 1080 },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  timeout: 60000,
});