# Landing page

The page a resume links to: what the project is, the demo logins, and the three apps (with the mobile ones running live inside phone frames). Vite, React 19, TypeScript and Tailwind 4.

```bash
cd landing
npm ci
npm run dev        # http://localhost:5174
```

The status light and the live previews need the rest of the stack (`make up` from the repo root). The API only accepts browser calls from origins in its `CORS_ORIGINS`, so for the dev server on 5174 add it there.

## Where things are

| Path | What |
| --- | --- |
| `src/content.ts` | Every word and number on the page, plus the demo logins. Edit here first. |
| `src/config.ts` | Where the API and the apps live (see below). |
| `src/components/` | One file per section, plus the small pieces (phone frame, QR code, copy button). |
| `src/index.css` | Design tokens and the few shared classes. |
| `public/screens/` | Real screenshots of the apps, used in the hero and on the pass cards. |
| `public/og.png` | The social-preview image (1200 x 630). |

## Configuration

Addresses come from `window.__APP_CONFIG__` (written when the container starts), then the `VITE_*` variables at build time, then local defaults. See [.env.example](.env.example).

- **Docker:** the `landing` service in `docker-compose.yml` sets `API_URL`, `ADMIN_WEB_URL`, `ADMIN_MOBILE_URL` and `MEMBER_MOBILE_URL`. The same values build the page's Content-Security-Policy, so it can only call that API and frame those two apps.
- **Static hosting** (for example Cloudflare Pages): set the `VITE_*` variables at build time. The Android buttons stay hidden until `VITE_APK_ADMIN_URL` and `VITE_APK_MEMBER_URL` are set, and the QR codes only appear for public (non-localhost) app addresses.

## Design notes

- The palette comes from the logo and the apps, and each colour has one job: red for actions, gold for numbers and credentials, green only for "live" signals.
- The demo logins are styled as gym passes, and each mobile pass carries a QR code so a visitor on a laptop can open the app on their phone.
- The screenshots show real app screens. Refresh them after a visual change to the apps.
- Motion respects `prefers-reduced-motion`.
