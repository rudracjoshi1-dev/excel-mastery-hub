import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "@univerjs/core",
      "@univerjs/engine-render",
      "@univerjs/engine-formula",
      "@univerjs/sheets",
      "@univerjs/sheets-ui",
      "@univerjs/ui",
      "@wendellhu/redi",
      "rxjs",
    ],
  },
  optimizeDeps: {
    // force: true was used once to clear stale cache after version alignment
    include: [
      "@univerjs/preset-sheets-core",
      "@univerjs/preset-sheets-filter",
      "@univerjs/presets",
    ],
  },
}));
