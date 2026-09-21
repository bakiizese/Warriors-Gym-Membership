import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Social-card image addresses must be absolute, so the site's public address is
// filled into index.html at build time (VITE_SITE_URL, empty for local use).
const siteUrl = (process.env.VITE_SITE_URL ?? "").replace(/\/$/, "");

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "site-url",
      transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", siteUrl),
    },
  ],
  server: { port: 5174 },
});
