# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server with Turbopack (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # ESLint
pnpm format           # Prettier — write
pnpm format:check     # Prettier — check only
```

There is no test suite configured in this repo currently.

Local backing services (MongoDB + MinIO) are provided via `docker-compose.yml`:

```bash
docker compose up mongo minio minio-init
```

## Environment

Copy `.env.example` to `.env`. Key vars:

| Variable                      | Purpose                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `AUTH_SECRET`, `NEXTAUTH_URL` | NextAuth                                                           |
| `GOOGLE_CLIENT_ID/SECRET`     | Google OAuth — the only auth provider                              |
| `MONGODB_URI`                 | MongoDB connection string                                          |
| `CLAUDE_CODE_OAUTH_TOKEN`     | Anthropic API key (`lib/ai/providers.ts`)                          |
| `WORKDIR`                     | Host path containing the target repo Claude Code edits (see below) |

## Architecture

This app is a chat interface where a user describes a "change request" for a website, and the backend runs the **Claude Code CLI itself** (via `ai-sdk-provider-claude-code`, not the plain Anthropic messages API) against a real checkout of a target project to make the change.

- `app/(change-request)/api/chat/route.ts` — the chat endpoint. It builds a `claudeCode(...)` model with `cwd: path.join(process.env.WORKDIR, "starter-kit-astro-apollo")` and `permissionMode: "acceptEdits"`, so every chat turn can read/edit files in that checkout directly (auto-accepting edits, no per-tool confirmation).
- `workdir/starter-kit-astro-apollo/` — the target project (an Astro frontend + Node/Apollo backend starter kit) that change requests are applied to. It's a separate git checkout, not part of this app's own history.
- `lib/ai/providers.ts` — only exports a raw `@ai-sdk/anthropic` client, used for file uploads (Anthropic Files API), _not_ for chat completions.

### Route groups

- `app/(auth)/` — login page + NextAuth config (`auth.ts`). Google OAuth only, JWT session strategy, single `UserType` (`"regular"`).
- `app/(change-request)/` — main app: change-request list/detail pages and API routes (`api/change-requests`, `api/change-requests/[id]/messages`, `api/chat`).
- `proxy.ts` (Next.js middleware) enforces auth on every route except `/ping`, `/api/auth/*`, and `/login`, and redirects based on a `NEXT_PUBLIC_BASE_PATH`-aware URL (used for path-prefixed deployments, e.g. a `/demo` mount).

### Chat UI (`@assistant-ui/react`)

`components/chat/aui-runtime.tsx` wires up `useRemoteThreadListRuntime`, so each change-request is a remote thread:

- Thread list CRUD (`list`/`initialize`/`fetch`/`delete`/`rename`/`archive`/`unarchive`/`generateTitle`) is implemented against `/api/change-requests*` in `makeAdapter`.
- Message history persistence is custom (`makeHistoryAdapter`): messages are encoded/decoded via assistant-ui's `MessageFormatAdapter` and stored as opaque `{ id, parent_id, format, content }` rows through `/api/change-requests/[id]/messages` (see `lib/db/schema.ts` — `Message_v2` collection stores `content` as `Schema.Types.Mixed`, so it's format-agnostic from the DB's point of view).
- `components/chat/chat-shell.tsx` is the actual thread UI, built from assistant-ui primitives (`ThreadPrimitive`, `ComposerPrimitive`, `MessagePrimitive`, etc.) rather than hand-rolled chat components.

### Database (`lib/db/`)

Mongoose against MongoDB. Two collections, both keyed by a UUID string `_id` (not ObjectId):

- `ChangeRequest` — `id`, `userId`, `title`, `createdAt`.
- `Message_v2` (`PersistedMessage`) — `changeRequestId`, `parent_id` (for branching), `format`, `content` (mixed).

`lib/db/connection.ts` caches the mongoose connection promise on `globalThis` to survive Next.js dev hot-reloads.

### File uploads

`app/files/upload/route.ts` accepts a multipart file and uploads it via the AI SDK's `uploadFile` to Anthropic's Files API (`anthropic.files()`), returning a `FilePart` with a provider file reference. This is separate from the MinIO/S3 storage configured for general asset hosting.

### Linting

Plain ESLint (`eslint-config-next/core-web-vitals`), not Biome/ultracite. `components/ai-elements/**` is excluded from linting (treated as vendored). A few `react-hooks` rules are disabled in `eslint.config.mjs`; the comment there refers to editor components from an earlier version of this app that no longer exist — re-evaluate whether those rules can be re-enabled if touching that config.
