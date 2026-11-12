# syntax=docker/dockerfile:1

# DT-THAU website: the Astro standalone Node server, alone in its container.

# Exact version, so a rebuild never picks up an untested Node release.
ARG NODE_IMAGE=node:26.11.1-alpine

# ---- Build: all dependencies, then the production build ----------------------
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Public domain of the site; Astro trusts only this host behind the reverse proxy.
ARG SITE_DOMAIN
RUN test -n "$SITE_DOMAIN" || { echo "Build argument SITE_DOMAIN is required" >&2; exit 1; }
# "true" lets search engines index the site; anything else keeps it out of their results.
ARG SITE_INDEXABLE=false
RUN npm run build

# ---- Runtime dependencies only -------------------------------------------------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# No dev tools, no optional native packages (image processing is not used).
RUN npm ci --omit=dev --omit=optional

# ---- Runtime -------------------------------------------------------------------
FROM ${NODE_IMAGE}
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321 \
    DATA_DIR=/app/data \
    ASTRO_TELEMETRY_DISABLED=1
WORKDIR /app
# Code stays owned by root: the server process cannot modify it.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY scripts ./scripts
# The only writable place: the SQLite database, mounted as a volume. npm is not needed
# to run the site: remove it, and with it a tool an intruder could use.
RUN mkdir -p /app/data && chown node:node /app/data \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
USER node
EXPOSE 4321
VOLUME ["/app/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4321/').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "dist/server/entry.mjs"]
