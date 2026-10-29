import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90000,
  use: { channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  webServer: {
    command: "node node_modules/vite/bin/vite.js preview --host 127.0.0.1",
    url: "http://localhost:4173",
    reuseExistingServer: true,
  },
});
