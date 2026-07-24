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
ENV NODE_ENV=production
RUN pnpm build

# --- runner ---
FROM node:22-alpine AS runner
WORKDIR /app

# Configure Claude-Code
RUN npm install -g @anthropic-ai/claude-code
ENV PATH_TO_CLAUDE_CODE_EXE=/usr/local/bin/claude

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
