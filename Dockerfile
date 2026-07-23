FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# --- dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- runner ---
FROM node:22-alpine AS runner
WORKDIR /app

# git: the app checks out/commits against target repos under workdir/.
# libc6-compat: some native binaries bundled transitively (e.g. ripgrep via
# @anthropic-ai/claude-agent-sdk) are linked against glibc, which Alpine's
# musl libc doesn't provide without this shim.
RUN apk add --no-cache git bash curl libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# config/config.js and workdir/ are not baked into the image — they're
# bind-mounted at container runtime (see docker-compose.yml) so a deployment
# can swap them without a rebuild. Pre-create the mount points so they exist
# with the right ownership even if a mount is omitted.
RUN mkdir -p /app/config /app/workdir && chown -R nextjs:nodejs /app/config /app/workdir

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
