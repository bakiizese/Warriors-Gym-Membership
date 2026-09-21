# syntax=docker/dockerfile:1

# Builds the landing page and serves it from unprivileged nginx. The addresses of
# the API and the apps are read at container start, so one image runs anywhere.

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
# The public address of the site, used for the social-preview image links.
ARG VITE_SITE_URL=""
ENV VITE_SITE_URL=${VITE_SITE_URL}
RUN npm run build

# --- runtime ----------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

# Defaults so the policy always resolves; docker-compose.yml overrides them.
ENV API_URL=http://localhost:5000 \
    ADMIN_WEB_URL=http://localhost:8080 \
    ADMIN_MOBILE_URL=http://localhost:8081 \
    MEMBER_MOBILE_URL=http://localhost:8082

# nginx's entrypoint fills ${VARS} in these templates from the environment.
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/security-headers.inc.template /etc/nginx/templates/security-headers.inc.template
COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html
# Also on start: writes /config.js so the page knows where the API and apps are.
COPY --chmod=755 docker/40-config.sh /docker-entrypoint.d/40-config.sh

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
