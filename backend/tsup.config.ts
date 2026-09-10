import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "build",
  format: ["esm"],
  target: "node24",
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: true,
  skipNodeModulesBundle: true,
});
