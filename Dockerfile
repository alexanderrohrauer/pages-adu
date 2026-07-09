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

# libc6-compat: official nodejs.org builds (what nvm installs) are linked
# against glibc; Alpine ships musl, so without this shim any Node version
# nvm installs besides the one baked into this image fails to run.
RUN apk add --no-cache git bash curl libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs "$NVM_DIR"

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
