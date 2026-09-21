# syntax=docker/dockerfile:1

# Build targets:
#   runtime (default)  static files served by unprivileged nginx
#   dev                Vite dev server with hot reload (used by docker-compose.dev.yml)

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM deps AS build
COPY . .
# Optional build-time API address. In Docker prefer the runtime API_URL variable,
# which lets one image run against any backend.
ARG VITE_ADDRESS=""
ENV VITE_ADDRESS=${VITE_ADDRESS}
RUN npm run build

# --- runtime ----------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html
# Runs on container start (nginx's entrypoint executes /docker-entrypoint.d/*.sh)
# and writes /config.js from the API_URL environment variable.
COPY --chmod=755 docker/40-config.sh /docker-entrypoint.d/40-config.sh

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
