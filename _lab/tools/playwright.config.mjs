import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'line',
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4500', channel: 'chrome', viewport: { width: 1440, height: 900 } },
  webServer: { command: 'node server.mjs', url: 'http://127.0.0.1:4500/_lab/tools/package.json', reuseExistingServer: true, timeout: 15000 },
});
