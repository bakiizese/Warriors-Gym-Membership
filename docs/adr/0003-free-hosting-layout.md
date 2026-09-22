# 3. Host the demo on free plans, and design around their limits

Status: accepted (PR #27)

## Context

A recruiter should be able to open the demo from a resume link and use it, and the demo should cost nothing to keep running. Three free plans cover the pieces, and each has a limit that shapes the design:

- **Render** (API): sleeps after 15 minutes without traffic, takes about a minute to wake, wipes its disk on restart, and gives 750 free hours a month per workspace.
- **Neon** (PostgreSQL): sleeps after 5 minutes, and includes 100 compute hours a month.
- **Cloudflare Pages** (static sites): 25 MiB per file and 20,000 files per site, far more than these apps need.

## Decision

- The API runs on Render from [render.yaml](../../render.yaml), the database on Neon, and the landing page and three apps on four Cloudflare Pages sites.
- **Deploys wait for CI.** [deploy.yml](../../.github/workflows/deploy.yml) starts after the `CI` workflow succeeds on `main`. It calls Render's deploy hook for that exact commit and polls `/ping` until the API reports that commit, and only then publishes the four sites. A site is never live against an API that has not caught up.
- **`/ping` reports the running commit and never touches the database.** Render keeps the old version serving until the new one is ready, so "is it up" says nothing about a deploy. The commit in the response does.
- **The keep-alive pings `/ping`, not `/health`.** [keepalive.yml](../../.github/workflows/keepalive.yml) calls it every 10 minutes so Render rarely sleeps. `/health` checks the database, and calling it every 10 minutes would keep Neon awake and use most of its 100 compute hours. With `/ping`, Neon sleeps whenever nobody is using the demo.
- **The demo resets every night** through [reset-demo.yml](../../.github/workflows/reset-demo.yml), because Render's disk is wiped anyway and visitors change data.
- **The landing page tells visitors about the limits.** A status light shows whether the API is asleep, and a "Straight talk" section lists what is simulated or temporary.

## Consequences

- The whole stack costs nothing, and a fresh copy can be set up from [docs/deploy.md](../deploy.md).
- One Render service kept awake all month uses about 744 of the 750 free hours, so this workspace can run only one. That is why the API is the only Render service.
- The first request after a long idle still takes about a minute, and uploaded photos and videos do not last.
- GitHub stops scheduled workflows after 60 days without a commit, so the keep-alive and the reset need an occasional push.
- The free plans are not an SLA. The design tolerates the API being slow or briefly away, and nothing here suits real customers as it stands.
