# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server

# Formatting (Prettier)
pnpm format           # Format all files
pnpm format:check     # Check formatting without writing

```

## Environment

Copy `.env.example` to `.env.local`. Required vars:

| Variable             | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `AUTH_SECRET`        | NextAuth secret                                          |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key (not needed on Vercel — uses OIDC) |
| `MONGODB_URI`        | MongoDB connection string (Atlas or local)               |
| `MINIO_ENDPOINT`     | MinIO S3 API endpoint (e.g. `http://localhost:9000`)     |
| `MINIO_ACCESS_KEY`   | MinIO access key                                         |
| `MINIO_SECRET_KEY`   | MinIO secret key                                         |
| `MINIO_PUBLIC_URL`   | Base URL the browser uses to access uploaded files       |

Set `IS_DEMO=1` to enable the demo mode base path (`/demo`).

## Architecture

### Routing

Next.js App Router with two route groups:

- `app/(auth)/` — login, register, NextAuth config (`auth.ts`, `auth.config.ts`)
- `app/(chat)/` — main chat UI, API routes

API routes under `app/(chat)/api/`:

- `chat/` — POST streams AI responses, DELETE removes chats
- `files/upload/` — file upload to Vercel Blob
- `history/`, `vote/`, `suggestions/`, `document/` — CRUD for chat data
- `models/` — exposes available models to the client

### AI Layer (`lib/ai/`)

- **`models.ts`** — defines `chatModels[]` and `DEFAULT_CHAT_MODEL`. Each model declares static `capabilities` (`tools`, `vision`, `reasoning`). Add/remove models here; no gateway config needed.
- **`providers.ts`** — `getLanguageModel(modelId)` and `getTitleModel()` use `claudeCode()` from `ai-sdk-provider-claude-code` (Claude Pro/Max subscription via Claude Code). In test environments it uses `models.mock.ts`.
- **`prompts.ts`** — system prompt composition. `systemPrompt()` conditionally includes the artifacts prompt only when the model's static `capabilities.tools` is true.
- **`entitlements.ts`** — per-user-type rate limits (`guest` and `regular` users both get 10 messages/hour).
- **`tools/`** — AI SDK tool definitions: `getWeather`, `createDocument`, `editDocument`, `updateDocument`, `requestSuggestions`.

The chat route (`app/(chat)/api/chat/route.ts`) derives `isReasoningModel` and `supportsTools` from the static model capabilities, then decides whether to enable tools and stream reasoning output.

### Artifacts System

Artifacts are a side-panel document/code/spreadsheet editor. The pattern is:

- **`artifacts/{kind}/server.ts`** — AI SDK tool handler that streams content into the artifact
- **`artifacts/{kind}/client.tsx`** — React component that renders and edits the artifact
- **`artifacts/actions.ts`** — Server Actions for artifact data
- Kinds: `text` (ProseMirror editor), `code` (CodeMirror), `sheet` (react-data-grid), `image`

### Database (`lib/db/`)

Mongoose with MongoDB. Collections: `User`, `Chat`, `Message_v2`, `Vote_v2`, `Document`, `Suggestion`. Schemas and Mongoose models are defined in `lib/db/schema.ts`. All queries go through `lib/db/queries.ts`. Connection is managed in `lib/db/connection.ts` with a global cache to survive Next.js hot-reloads.

The `Document` collection supports versioning: the same logical `id` (UUID) can have multiple documents with different `createdAt` timestamps. MongoDB `_id` is an auto-generated ObjectId per version; `id` is the stable logical identifier. All other collections use a UUID string as `_id`.

### Rate Limiting

Per-user DB message count check in the chat route against `entitlementsByUserType` (`lib/ai/entitlements.ts`).

### Auth

NextAuth v4.24.14. User types are `guest` (anonymous) or `regular`. Guest sessions are created automatically. `app/(auth)/auth.ts` exports the `auth()` helper used in API routes.

### Linting

Biome via ultracite (`biome.jsonc`). The config excludes `components/ui/`, `components/ai-elements/`, and a few generated files from linting. Key rules that differ from defaults: `noExplicitAny`, `noConsole`, `noNestedTernary`, and `noBitwiseOperators` are all turned off.

TypeScript enums are banned (use `as const` maps instead). Use `import type` for type-only imports. No `!` non-null assertions.
