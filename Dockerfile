FROM node:22-bookworm-slim AS base

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
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        bash \
        git \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Configure Claude Code
RUN npm install -g @anthropic-ai/claude-code

ENV PATH_TO_CLAUDE_CODE_EXE=/usr/local/bin/claude
ENV SHELL=/bin/bash

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV WORKDIR=/workdir

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --create-home nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/config /workdir && \
    chown -R nextjs:nodejs /app/config /workdir

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]