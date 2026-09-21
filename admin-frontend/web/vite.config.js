import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tailwind v3 runs through PostCSS (see postcss.config.js), not a Vite plugin.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
});
