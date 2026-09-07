## Context

`frontend/` is currently empty. The backend (`backend/`, Express on port 3009) already exposes:

- `POST /api/v1/transcription/presigned-url` — body `{ fileType: string }`, returns `{ presignedUrl: string }`. Internally it generates a `jobId` (UUID) and uses it as the raw S3 object key (no folder prefix, no extension) when signing a `PutObjectCommand`. The `jobId` itself is **not** returned in the response body — see `backend/src/usecases/transcription/get-presigned-url-by-file.ts` and `backend/src/services/s3.ts`.
- `GET /api/v1/transcription/:jobId` — returns `{ transcription: string }` or 404 (`Transcription not found`) if the job doesn't exist yet or failed.

There is no CORS middleware on the backend and no frontend build tooling exists yet. This design scaffolds the whole frontend from scratch.

## Goals / Non-Goals

**Goals:**
- Vite + React + TypeScript app, single page, no router.
- UI built with shadcn/ui components on top of Tailwind CSS.
- Drag-and-drop (and click-to-browse) upload restricted to `.mp4`.
- Direct browser → S3 upload via the presigned URL (backend never sees file bytes).
- React Query-driven polling of transcription status every 10s, capped at 3 minutes total.
- Transcript view with copy-to-clipboard and a reset action.

**Non-Goals:**
- Backend changes (CORS, response shape) — flagged as an open question below but not implemented here.
- Multiple file types beyond `.mp4`, multi-file upload, upload progress bars, auth, persistence across page reloads (e.g. resuming a poll after refresh).
- Automated tests (out of scope per task list unless trivial to add for pure logic like jobId parsing).

## Decisions

1. **Vite scaffold**: use `npm create vite@latest . -- --template react-ts` inside `frontend/` (the current directory). This is the closest equivalent to "vite start" available in current Vite tooling (no `vite start` command exists; `create-vite` + `npm run dev` is the standard path).

2. **Deriving `jobId` from the presigned URL**: since the backend doesn't return the jobId, the frontend parses it from the presigned URL's path — the last path segment of the URL (before the query string) is exactly the S3 key, which is the jobId (confirmed in `s3.ts`: `Key: jobId`). This is done with the standard `URL` API: `new URL(presignedUrl).pathname.split("/").pop()`. This is brittle if the backend changes the key scheme (e.g., adds a prefix); flagged as an Open Question.

3. **State machine via a single React state enum**, not a router: `idle | uploading | polling | error | done`. A page-level component holds this state and the derived `jobId`; no need for React Router for a one-page app.

4. **React Query for polling**: `useQuery` with `refetchInterval: 10_000`, `enabled` gated on being in the `polling` state, and `retry: false` (a 404 just means "not ready yet", not a failure to surface). A separate wall-clock deadline (`Date.now() + 3 * 60_000` stored in a ref at the moment polling starts) is checked in the query function itself — if `Date.now() > deadline`, the query throws a distinct `TranscriptionTimeoutError`, which flips the page state to `error` via `onError`/`isError`. This avoids relying on React Query's own retry/attempt counting (interval could drift) and gives an exact 3-minute wall-clock bound.

5. **Upload call is a plain `fetch` `PUT`** to the presigned URL with `Content-Type` matching the file's mime type (must match what was sent to `/presigned-url`, since S3 presigned PUT URLs are signed against that header). Wrapped in a React Query `useMutation` for loading/error state consistency, not because it needs caching.

6. **Dev CORS handling**: add a Vite dev-server proxy (`vite.config.ts` → `server.proxy['/api']` → `http://localhost:3009`) so the browser calls same-origin `/api/v1/transcription/...` in dev, sidestepping the backend's missing CORS headers. The S3 PUT is same-origin-agnostic (S3 buckets used for presigned uploads typically have their own CORS config already, out of scope here). Production base URL is read from `import.meta.env.VITE_API_BASE_URL` (falls back to relative `/api/v1/transcription` if unset).

7. **Styling**: Tailwind CSS + shadcn/ui. Initialize Tailwind (`tailwindcss`/`@tailwindcss/vite` for the Vite plugin) first, then run `npx shadcn@latest init` to scaffold `components.json` and `src/lib/utils.ts` (`cn` helper), and pull in only the primitives the page needs via `npx shadcn@latest add <component>`: `button`, `card`, `alert` (error view), and `textarea` (read-only transcript display). shadcn components are copied into `src/components/ui/` as owned source, not an npm dependency — matches the "own your UI code" model and avoids pulling in a full component library for a one-page app. Custom pieces (`Dropzone`, `TranscriptView`) are built on top of these primitives rather than styled from scratch.

## Risks / Trade-offs

- [Backend never returns `jobId` explicitly] → Mitigation: parse it from the presigned URL path (decision 2). If the backend later prefixes the S3 key or changes the URL shape, this breaks — call out clearly in code with a comment and keep the parsing in one isolated function so it's a single-point fix.
- [No CORS on backend outside of dev proxy] → Mitigation: Vite proxy solves local dev; production deployment will need either backend CORS headers or serving frontend from the same origin/API gateway path — explicitly out of scope, noted as an open question.
- [Polling forever if the job silently fails on the backend] → Mitigation: hard 3-minute wall-clock timeout regardless of how many polls actually fired.
- [User navigates away / refreshes mid-poll] → Mitigation: accepted as out of scope; state is in-memory only, refreshing restarts at the dropzone. No localStorage persistence.
- [S3 PUT CORS] → The S3 bucket must have a CORS policy allowing PUT from the frontend's origin; this is backend/infra config, not addressed by this change. Flagged as open question.

## Migration Plan

Net-new app, no migration. Deployment/hosting for the built frontend (S3+CloudFront, Vercel, etc.) is not decided here — out of scope for this change, which only covers local scaffolding and the page implementation.

## Open Questions

- Should the backend be changed to return `jobId` directly in the `/presigned-url` response instead of requiring the frontend to parse the S3 key out of the URL? (Recommended follow-up, not blocking this change.)
- Where/how will the built frontend be deployed, and does the target environment need backend CORS changes or an API gateway path that makes frontend and backend same-origin?
- Is the S3 bucket's CORS policy already configured to accept browser `PUT` requests from the frontend's dev/prod origins?
