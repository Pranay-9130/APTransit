import { defineConfig } from "vitest/config";

// Unit tests for plain modules (api client, roles, proxy). Components are tested in packages/ui.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "*.test.ts"],
    environment: "node",
  },
});
