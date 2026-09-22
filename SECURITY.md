# Security

## Reporting a problem

Please email **bereketzeselassie@gmail.com** with what you found and how to reproduce it, rather than opening a public issue. I will reply within a few days and tell you what I plan to do.

The live demo at https://warriors-gym.pages.dev is a public sandbox with shared, published logins, so signing in with them is expected. Please do not run load tests against it: it sits on free hosting plans.

## Supported versions

Only `main` and the latest release get fixes.

## What is protected

**The API** ([`backend/`](backend))

- Passwords are hashed with bcrypt, and the hash is excluded from every query by default. A query has to ask for it, which only the sign-in check does.
- Tokens are HS256 JWTs with an expiry, and verification pins the algorithm. Admin routes accept only admin tokens and member routes only member tokens.
- Admin sign-up is disabled unless `ADMIN_INVITE_CODE` is set, and the code is compared in constant time. Members can only read and change their own records.
- Prices, durations and ticket counts come from the plan in the database, never from the request. Multi-step writes such as a payment plus its membership run in one transaction.
- Requests are limited to 600 per 15 minutes per client, and the sign-in and sign-up routes to 30. Request bodies are capped at 1 MB.
- helmet sets the security headers, and CORS is an allowlist in production (`CORS_ORIGINS`). The server refuses to start with a missing or short `JWT_SECRET_KEY` in production.
- Uploads are accepted only from signed-in users, stored under generated names, and removed again if the request fails validation.

**The static sites**

- The landing page and the web admin are served with a Content-Security-Policy, `nosniff`, a referrer policy and clickjacking protection, from nginx running as an unprivileged user in Docker, and from generated `_headers` files on Cloudflare Pages.

**The pipeline**

- CodeQL and gitleaks run on every pull request, and Trivy scans the API image and fails the build on fixable high or critical findings.
- Dependabot opens update pull requests for npm, Docker and GitHub Actions.
- Third-party GitHub Actions are pinned to commit SHAs. Workflows get read-only permissions unless a job needs more.
- `main` is protected: changes go through a pull request, and the `CI` check must pass.

## Known limitations

- **Tokens are stateless.** There is no refresh token and no way to revoke one before it expires. The hosted demo issues 7-day tokens, and the apps sign out on a 401.
- **The rate limiter is in memory**, so each API instance counts separately. That is enough for a single instance.
- **The demo accounts are public on purpose** (see [ADR 4](docs/adr/0004-demo-mode.md)). Their passwords cannot be changed through the API, and the data resets every night.
- **Payments are simulated.** Nothing here handles card details or real money.
- **The Android builds are debug-signed.** They are not a substitute for a release key and should not be distributed as a production app.
- **An early commit contained a development `.env`,** with a sandbox payment key and a JWT secret. Treat those values as compromised. The hosted demo uses a different, generated JWT secret and does not call the payment provider.
