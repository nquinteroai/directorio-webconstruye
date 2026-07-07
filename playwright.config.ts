import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests contra el build de producción (npm run build antes de correr).
 * Puerto 3010 para no chocar con dev (3000) ni con otras apps locales.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3010",
  },
  projects: [
    { name: "movil", use: { ...devices["Pixel 7"] } },
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npx next start -p 3010",
    url: "http://localhost:3010",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
