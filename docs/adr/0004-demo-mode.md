# 4. A demo mode that anyone can use and nobody can break

Status: accepted (PR #5, extended in PR #27)

## Context

The live demo is public, shares its accounts with every visitor, and has no moderation. A visitor could change the demo admin's password, delete the demo member, or fill the database with junk. Payments are also not real, because no money should move in a portfolio project.

## Decision

`DEMO_MODE=true` turns on a set of guardrails, all in the API:

- **Sample data on an empty database.** On boot, an empty database is filled with a sample gym: 12 members in every membership state, attendance, payments and workouts with sample videos. A database that already has data is never touched.
- **Locked demo accounts.** The two published logins cannot have their password or phone number changed, and the demo member cannot be deleted. Visitors can change any other data, so the apps can be tried properly, but nobody can lock out the next visitor.
- **A protected reset.** `POST /demo/reset` reseeds the data and deletes uploaded files. It requires the `x-reset-token` header, compared in constant time, and answers 403 to anything else. The route is only mounted when `DEMO_MODE` and `DEMO_RESET_TOKEN` are both set. A scheduled workflow calls it every night.
- **Simulated payments.** Checkout records a payment and renews the membership, but no money moves. A Chapa client exists in the code but is not wired in. The landing page says this plainly.

## Consequences

- Demo behaviour lives in one flag and one seed file, and is tested ([`demo-mode.test.js`](../../backend/tests/demo-mode.test.js), [`seed.test.js`](../../backend/tests/seed.test.js)), so the normal code paths are not full of demo exceptions.
- The reset token is a real secret. If it leaks, anyone can wipe the demo, though nothing more than that.
- The sample data has one workout per category, which is enough to show the screens but thin.
