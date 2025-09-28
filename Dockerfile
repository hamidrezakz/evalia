###############################################
# Root multi-stage Dockerfile for monorepo
# Builds separate images for API (NestJS) and Web (Next.js)
# Leverages a shared dependency layer for faster rebuilds.
###############################################

FROM node:20-alpine AS deps
WORKDIR /workspace
RUN apk add --no-cache libc6-compat \
  && npm install -g pnpm

# Copy lock/workspace & minimal manifests for better layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy package manifests (only package.json files) to leverage cache
# Adjust patterns if new packages are added later.
COPY packages ./packages
COPY apps/api/doneplay/package.json ./apps/api/doneplay/package.json
COPY apps/web/doneplay/package.json ./apps/web/doneplay/package.json

# Install all workspace dependencies (dev + prod)
RUN pnpm install --frozen-lockfile

###############################################
# API build stage
FROM deps AS build-api
COPY . .
RUN pnpm --filter @doneplay/api build

###############################################
# Web build stage
FROM deps AS build-web
COPY . .
RUN pnpm --filter @doneplay/web build

###############################################
# API runtime image (can be further slimmed by pruning dev deps if needed)
FROM node:20-alpine AS api
WORKDIR /workspace
RUN npm install -g pnpm
# Copy full workspace (includes node_modules symlinks from pnpm)
COPY --from=build-api /workspace .
EXPOSE 4000
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@doneplay/api", "start:prod"]

###############################################
# Web runtime image
FROM node:20-alpine AS web
WORKDIR /workspace
RUN npm install -g pnpm
COPY --from=build-web /workspace .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@doneplay/web", "start"]

# Usage (docker compose): specify target: api or web
###############################################