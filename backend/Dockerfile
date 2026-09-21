# syntax=docker/dockerfile:1

# Build targets:
#   runtime (default)  small production image
#   dev                hot reload with nodemon (used by docker-compose.dev.yml)
#   test               runs the test suite (needs a Postgres, see docker-compose.yml)

ARG NODE_VERSION=20

# --- production dependencies only ------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- all dependencies, for dev and test ------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS dev-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dev-deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 5000
CMD ["npx", "nodemon", "server.js"]

FROM dev-deps AS test
ENV NODE_ENV=test
COPY . .
CMD ["npm", "test"]

# --- production image -------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=5000 \
    UPLOADS_DIR=/data/uploads

WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json app.js server.js ./
COPY --chown=node:node config ./config
COPY --chown=node:node middleware ./middleware
COPY --chown=node:node migrations ./migrations
COPY --chown=node:node models ./models
COPY --chown=node:node routes ./routes
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node services ./services
COPY --chown=node:node utils ./utils
COPY --chown=node:node docs ./docs
COPY --chown=node:node seed-assets ./seed-assets

# Uploads live outside the app directory so a volume can be mounted over them.
RUN mkdir -p /data/uploads/images /data/uploads/videos \
    && chown -R node:node /data

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# server.js handles SIGTERM itself; compose adds an init process for zombie reaping.
CMD ["node", "server.js"]
