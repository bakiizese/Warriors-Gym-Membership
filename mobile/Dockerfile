# syntax=docker/dockerfile:1

# Serves the browser build of the member app (expo export --platform web) from
# unprivileged nginx. The phone builds do not use this file.

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
# Expo inlines EXPO_PUBLIC_* values into the bundle at export time, so this is the
# address the *browser* uses to reach the API, and changing it means a rebuild.
ARG EXPO_PUBLIC_ADDRESS=http://localhost:5000
ENV EXPO_PUBLIC_ADDRESS=${EXPO_PUBLIC_ADDRESS} \
    CI=1
RUN npx expo export --platform web

# --- runtime ----------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
