import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unitarias/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@/config": path.resolve(__dirname, "config"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
