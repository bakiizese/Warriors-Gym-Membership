# Deploying the demo

The whole demo runs on free plans. The code and the workflows are in the repo; what is left is creating three accounts' worth of settings and handing GitHub the keys.

| Piece | Where it runs | Set up by |
| --- | --- | --- |
| PostgreSQL | Neon | step 1 |
| API | Render (Docker, from [render.yaml](../render.yaml)) | step 3 |
| Landing page, web admin, admin mobile, member mobile | Cloudflare Pages (four projects) | created by the Deploy workflow |
| Deploys | [deploy.yml](../.github/workflows/deploy.yml), after CI passes on `main` | step 5 |
| Keep the API awake | [keepalive.yml](../.github/workflows/keepalive.yml), every 10 minutes | automatic |
| Nightly demo reset | [reset-demo.yml](../.github/workflows/reset-demo.yml), midnight East Africa time | automatic |

Nothing deploys until you set the `DEPLOY_ENABLED` variable in step 5, so the steps below can be done in any order before that.

## 1. Neon: the database

1. Create a project. Pick the **AWS Europe (Frankfurt)** region, to sit next to the Render service, and Postgres **16**, which is the version the tests run on.
2. Open **Connect** and turn **Connection pooling off**. Copy the *direct* connection string. It looks like `postgresql://user:password@ep-something.eu-central-1.aws.neon.tech/neondb?sslmode=require`.

The API creates its own tables on first start, so the database stays empty until then.

## 2. A reset token

The nightly reset proves who it is with a shared secret. Make one and keep it for steps 3 and 5:

```bash
openssl rand -hex 24
```

## 3. Render: the API

1. **New > Blueprint**, connect this GitHub repository, branch `main`. Render reads `render.yaml` and shows one service, `warriors-gym-api`, on the **Free** plan in Frankfurt.
2. It asks for two values: `DATABASE_URL` (the Neon string from step 1) and `DEMO_RESET_TOKEN` (the token from step 2). Everything else is filled in, including a generated `JWT_SECRET_KEY`.
3. Apply. The first build takes a few minutes. When it finishes, open `https://<your-service>.onrender.com/ping`. You should see `{"ping":"success", ...}`.
4. Note the service's real address. It is `https://warriors-gym-api.onrender.com` if that name was free, otherwise Render adds a suffix.
5. **Settings > Deploy Hook**: copy the URL. Treat it as a secret.

If Render asks for a payment method to create a Blueprint and you would rather not add one, create the service by hand instead: **New > Web Service**, Docker, root directory `backend`, plan Free, health check path `/ping`, auto-deploy off, and copy the environment variables from `render.yaml`.

## 4. Cloudflare: the token

1. **My Profile > API Tokens > Create Token > Create Custom Token**. Permission: **Account, Cloudflare Pages, Edit**. Resources: your account. Create it and copy the token, which is shown once.
2. Copy your **Account ID** from the **Workers & Pages** overview page (also the first part of the dashboard URL).

You do not create the Pages projects yourself. The Deploy workflow creates them on the first run.

## 5. GitHub: secrets, variables, and the switch

In the repository, **Settings > Secrets and variables > Actions**.

**Secrets** (the Secrets tab):

| Name | Value |
| --- | --- |
| `RENDER_DEPLOY_HOOK` | the deploy hook URL from step 3 |
| `CLOUDFLARE_API_TOKEN` | the token from step 4 |
| `CLOUDFLARE_ACCOUNT_ID` | the account ID from step 4 |
| `DEMO_RESET_TOKEN` | the same token you gave Render |

**Variables** (the Variables tab):

| Name | Value |
| --- | --- |
| `API_URL` | the API's address from step 3, `https://...`, with no trailing slash |

When those are in, add one last variable: **`DEPLOY_ENABLED` = `true`**. That turns on the Deploy, keep-alive and reset workflows.

## 6. First deploy

**Actions > Deploy > Run workflow** on `main`. It deploys the API and waits until the new commit answers on `/ping` (up to 20 minutes), then publishes the four sites. From then on it runs by itself after every CI pass on `main`.

Your resume link is the landing page: **https://warriors-gym.pages.dev**.

## 7. Android APKs (optional, after the first deploy)

```bash
git tag v0.1.0 && git push origin v0.1.0
```

The Release APKs workflow builds both apps against `API_URL` and attaches them to a release. Re-run the Deploy workflow afterwards, so the landing page shows the download buttons.

## Check it works

- The landing page's status light turns green.
- You can sign in to all three apps with the demo passes.
- The **Actions** tab shows a green Deploy run, and the repository sidebar shows a `production` deployment.

## What the free plans mean

| Limit | Effect |
| --- | --- |
| Render sleeps after 15 min idle and takes about a minute to wake | The keep-alive pings every 10 minutes. The landing page's status light also wakes it on arrival, so it is usually warm by the time a visitor clicks into an app. |
| Render gives 750 free hours a month per workspace | One service kept awake all month uses about 744, so this project can only run one Render service. |
| Render's disk is wiped on restart | Photos and videos added in the demo do not last. The sample clips are baked into the image. |
| Neon sleeps after 5 minutes and includes 100 compute hours a month | The keep-alive calls `/ping`, which never touches the database, so Neon really does sleep. |
| GitHub stops scheduled workflows after 60 days without a commit | Push any commit, or re-enable the workflow in the Actions tab. |
| Cloudflare Pages: 25 MiB per file, 20,000 files per site | Well inside both. |

## If something goes wrong

- **The Pages step says the project name is taken.** Names are global. Choose another prefix and change it in `render.yaml` (`CORS_ORIGINS`), in `deploy.yml` (the `env` block and the matrix), and here.
- **The apps show network or CORS errors.** `CORS_ORIGINS` on Render must list the four `*.pages.dev` addresses. Edit it in the Render dashboard.
- **The first request is slow.** That is the cold start. Give it a minute.
- **The nightly reset fails.** The `DEMO_RESET_TOKEN` secret must match the value on Render exactly. A wrong token is rejected with 403.
- **Rotating a secret.** Change it at the source (Render, Cloudflare), then update the GitHub secret with the same value.
