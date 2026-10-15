import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    rules: {
      "typescript/no-explicit-any": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-return": "error",
    },
  },
  fmt: {
    ignorePatterns: ["docs/**", "llm.md", "llms.txt", "test/data/**"],
  },
  test: {
    setupFiles: ["./test/setup.ts"],
    // Local live tests share Datawrapper charts; CI runs only independent offline tests.
    fileParallelism: process.env.CI === "true",
  },
  pack: {
    entry: ["src/index.ts", "src/web.ts"],
    sourcemap: true,
  },
});
