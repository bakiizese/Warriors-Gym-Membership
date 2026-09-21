# Warriors Gym backend

REST API for the Warriors Gym platform. It serves the admin web app, the admin mobile app and the member mobile app.

**Stack:** Node.js 20+, Express 5, Sequelize 6, PostgreSQL, JWT auth, Vitest + Supertest.

Interactive API docs are served at **`/docs`** (raw spec at `/openapi.json`, source in [docs/openapi.yaml](docs/openapi.yaml)).

## Quick start

You need Node 20+ and a PostgreSQL database.

```bash
cd backend
cp .env.example .env          # set JWT_SECRET_KEY at least
npm install

# Local Postgres (once). Creates the postname/postdb the defaults expect:
psql -U postgres -f setup.sql

npm run migrate               # create / update the schema
npm run seed                  # optional: load a demo gym
npm run dev                   # http://localhost:5000
```

`npm run seed` prints the demo logins. With no `DATABASE_URL`, development uses
`postgres://postname:password@localhost:5432/postdb`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Run the server (migrates on boot unless `AUTO_MIGRATE=false`) |
| `npm run dev` | Same, restarting on file changes |
| `npm run migrate` / `migrate:down` / `migrate:status` | Apply, revert the last, or list migrations |
| `npm run seed` / `seed:reset` | Load demo data if the database is empty / wipe and reload |
| `npm test` | Run the test suite |
| `npm run lint` | ESLint |

## Configuration

All settings are environment variables, validated at startup ([config/env.js](config/env.js)); the server refuses to boot with a bad config. The full annotated list is in [.env.example](.env.example).

| Variable | Default | Notes |
| --- | --- | --- |
| `JWT_SECRET_KEY` | required | 32+ characters in production |
| `DATABASE_URL` | local dev URL | required in production |
| `DATABASE_SSL` | `false` | `true` for hosted Postgres (Neon, Supabase, Render) |
| `CORS_ORIGINS` | any origin in dev, none in prod | comma-separated; native apps are unaffected |
| `JWT_EXPIRES_IN` | `30d` | tokens carry `id`, `phone_number` and `role` |
| `ADMIN_INVITE_CODE` | unset | admin sign-up is disabled unless set |
| `UPLOADS_DIR` | `backend/uploads` | point at a mounted volume to persist uploads |
| `DEMO_MODE` | `false` | see [Demo mode](#demo-mode) |

## Project layout

```text
app.js            Express app: middleware and routes (no side effects, so it is testable)
server.js         Boot: connect, migrate, seed (demo), listen, graceful shutdown
config/           env validation, Sequelize, migrator, demo accounts
middleware/       auth (admin/member JWT), error handler, rate limits
routes/           auth, admin, member (+ demo reset)
services/         membership rules, profile updates, uploads, workouts, demo seed
models/           Sequelize models and associations
migrations/       schema history (umzug)
docs/openapi.yaml API contract
tests/            Vitest suites
```

## How it works

- **Auth.** Sign in returns a JWT. Admin routes accept only admin tokens and member routes only member tokens. Password hashes are excluded from every query by default (model default scope) and only loaded where a password is checked.
- **Memberships.** A member has at most one live membership. Plans are either `Daily` (a duration) or `Ticket` (a number of visits within a duration). Check-in re-evaluates status: fewer than 5 days or fewer than 3 tickets left is `Payment Due`; expired or out of tickets is `Inactive`.
- **Money-adjacent logic is server-side.** Prices, durations and ticket counts are read from the plan row, never from the request. A member can only touch their own memberships. Multi-step writes (payment + membership + status) run in one database transaction.
- **Uploads.** Files are only accepted from authenticated admins and members, stored under generated names, and deleted again if the request fails validation.
- **Payments.** Checkout is simulated: `/member/membership/off` records a `Pending` payment and activates the membership. The Chapa client exists in [utils/payment.js](utils/payment.js) but is not wired in yet.

## Testing

```bash
npm test
```

The suite runs against a real PostgreSQL, not a mock. It creates a throwaway schema (so nothing in `public` is touched), runs every migration into it, and drops it afterwards; uploads go to a temp directory. Point it at any database your role can `CREATE SCHEMA` in with `TEST_DATABASE_URL` (it falls back to `DATABASE_URL`, then the local dev URL).

Tests cover auth and role separation, password-hash exposure, sign-up validation, membership plan rules, payments and renewals, check-in status transitions, ownership checks, upload safety, the demo seed and reset, and that `docs/openapi.yaml` matches the routes in both directions.

## Demo mode

`DEMO_MODE=true` is for the public live demo:

- On boot, an **empty** database is filled with a sample gym (12 members in every membership state, attendance, payments, workouts with sample videos). It never touches a database that already has data.
- The two published logins (see `DEMO_*` in `.env.example`; defaults `0900000001` / `0911000001`, password `demo1234`) can't have their password or phone changed, and the demo member can't be deleted.
- With `DEMO_RESET_TOKEN` set, `POST /demo/reset` (header `x-reset-token`) wipes and reseeds the data and deletes visitor uploads. A scheduled job calls it nightly.

## Known limitations

- Payments are simulated (see above).
- The mobile apps don't yet sign out on a 401, so tokens live 30 days by default; shorten `JWT_EXPIRES_IN` once they do.
- Uploaded files live on local disk. On hosts with an ephemeral filesystem, mount a volume at `UPLOADS_DIR` or accept that uploads reset on deploy.
