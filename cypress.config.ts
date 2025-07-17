import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 375,
  viewportHeight: 800,
  e2e: {
    baseUrl: "http://localhost:8100",
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
