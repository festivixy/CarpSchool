// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * E2E scaffold for the two-user ride flows (see e2e/README.md and
 * e2e/ride-flow.spec.js). Targets the dev server on :3001 -- start it
 * separately (`npm run dev`) before running `npm run test:e2e`; this config
 * does not start a webServer of its own, since a driver instance may already
 * be running.
 */
module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3001",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "driver",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/driver.json",
      },
    },
    {
      name: "rider",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/rider.json",
      },
    },
  ],
});
