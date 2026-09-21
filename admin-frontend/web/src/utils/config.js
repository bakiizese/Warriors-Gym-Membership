// Backend base URL, without a trailing slash.
//
// Resolved in this order:
//   1. window.__APP_CONFIG__.API_URL, written into /config.js when the container
//      starts (see docker/40-config.sh), so one image works in any environment
//   2. VITE_ADDRESS, baked in at build time (dev server and static hosting)
const runtime = window.__APP_CONFIG__?.API_URL;

export const ADDRESS = (runtime || import.meta.env.VITE_ADDRESS || "").replace(
  /\/+$/,
  "",
);
