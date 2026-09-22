# 1. Schema changes are migrations, not `sync()`

Status: accepted (PR #5)

## Context

The original API created its tables with `sequelize.sync()` when it started. `sync()` creates a table that is missing but never alters one that exists, so any later change to a model silently did nothing on a database that already had data. There was also no record of how the schema got to its current shape, and no way to go back.

## Decision

The schema lives in migration files under [`backend/migrations/`](../../backend/migrations), run by [umzug](https://github.com/sequelize/umzug) with Sequelize's own migration table. The first file is a baseline that matches the schema the app already had, so existing databases can adopt it.

- `npm run migrate`, `migrate:down` and `migrate:status` apply, revert and list migrations.
- The server runs pending migrations on boot when `AUTO_MIGRATE` is on. The hosted demo turns it on, because Render's free plan has no release command or shell to run them from.
- The tests run every migration into a throwaway schema, so a broken migration fails CI.

## Consequences

- Every schema change is a file in a pull request, with an `up` and a `down`, and CI proves that it applies.
- Running migrations on boot is fine for one instance. With several instances they could race, so before scaling out, migrations should move to a step that runs once before the new version starts.
- Editing a model without writing a migration no longer changes the database. That is the point, but it is one more step to remember.
