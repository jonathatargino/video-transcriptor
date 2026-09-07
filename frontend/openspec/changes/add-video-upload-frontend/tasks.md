## 1. Project scaffold

- [x] 1.1 Scaffold Vite React+TypeScript app in the current `frontend/` directory (`npm create vite@latest . -- --template react-ts`)
- [x] 1.2 Install dependencies: `@tanstack/react-query`
- [x] 1.3 Configure `vite.config.ts` with a dev proxy for `/api` (routes are mounted under `/api/v1`) → `http://localhost:3009`
- [x] 1.4 Add `VITE_API_BASE_URL` support (`.env.example`) with relative `/api/v1/transcription` fallback
- [x] 1.5 Strip default Vite/React boilerplate (logo, sample counter) from `src/App.tsx` and `src/index.css`
- [x] 1.6 Wrap `src/main.tsx` with `QueryClientProvider`
- [x] 1.7 Install and configure Tailwind CSS for Vite (`tailwindcss`, `@tailwindcss/vite`), set up path alias (`@/*`) in `tsconfig.json`/`vite.config.ts`
- [x] 1.8 Run `npx shadcn@latest init` to scaffold `components.json` and `src/lib/utils.ts`
- [x] 1.9 Add shadcn components needed for the page: `npx shadcn@latest add button card alert textarea`

## 2. API client

- [x] 2.1 Add `src/api/transcription.ts` with `getPresignedUrl(fileType: string): Promise<{ presignedUrl: string }>` calling `POST {base}/presigned-url` (`base` defaults to `/api/v1/transcription`)
- [x] 2.2 Add `getTranscription(jobId: string): Promise<{ transcription: string } | null>` calling `GET {base}/:jobId`, returning `null` on 404 instead of throwing
- [x] 2.3 Add `uploadFileToPresignedUrl(url: string, file: File): Promise<void>` doing a `PUT` with `Content-Type: file.type`
- [x] 2.4 Add `parseJobIdFromPresignedUrl(url: string): string` extracting the last path segment before the query string

## 3. Upload flow (video-upload capability)

- [x] 3.1 Build `src/components/Dropzone.tsx` using shadcn `Card`/`Button`: drag-and-drop area + hidden file input, accepts `.mp4`/`video/mp4` only, shows a validation message (shadcn `Alert`) for rejected files
- [x] 3.2 Wire file selection to a `useMutation` that calls `getPresignedUrl` then `uploadFileToPresignedUrl`
- [x] 3.3 On upload success, derive `jobId` via `parseJobIdFromPresignedUrl` and transition app state to `polling`
- [x] 3.4 On presigned-url or upload failure, transition app state to `error` with a message

## 4. Polling flow (transcription-status-polling capability)

- [x] 4.1 Add `src/hooks/useTranscriptionPolling.ts` wrapping `useQuery` with `refetchInterval: 10_000`, `enabled` gated on `polling` state and a `jobId`
- [x] 4.2 Track the polling start timestamp (e.g. `useRef`) and compare against `Date.now()` inside the query function; throw/return a timeout signal once 3 minutes have elapsed
- [x] 4.3 Stop refetching and transition to `error` state when the timeout signal is hit
- [x] 4.4 Transition to `done` state with the transcript text when a poll returns a non-empty `transcription`
- [x] 4.5 Show a loading/polling indicator view while in the `polling` state

## 5. Transcript view (transcript-viewer capability)

- [x] 5.1 Build `src/components/TranscriptView.tsx` displaying the transcript text in a shadcn `Card`/`Textarea` (read-only)
- [x] 5.2 Add a copy-to-clipboard shadcn `Button` using `navigator.clipboard.writeText`
- [x] 5.3 Add an "upload another video" shadcn `Button` that resets all app state (file, jobId, transcript, error) back to `idle`

## 6. Page composition & error view

- [x] 6.1 Build `src/App.tsx` as a state machine (`idle | uploading | polling | error | done`) rendering `Dropzone`, a polling indicator, an error view, or `TranscriptView` based on state
- [x] 6.2 Build a simple error view using shadcn `Alert` with the failure message and a retry/reset `Button` back to `idle`

## 7. Verification

- [x] 7.1 Run `npm run build` (passes) and `npm run dev`; verified the dev server serves the app and that the frontend correctly reaches the backend's `POST /api/v1/transcription/presigned-url` route through the Vite proxy (confirmed via the backend logs: request received, jobId generated). Did **not** verify the full happy path end-to-end (real S3 PUT + polling to a real transcript) — the local backend fails before that point with `Error: Region is missing` (AWS SDK region not configured in this sandbox), which is a local environment/credentials issue, not a frontend bug. No browser tool was available this session either, so click/drag interactions and the transcript/copy UI were not visually exercised — please verify those manually with `npm run dev` and a properly configured backend.
- [x] 7.2 Not verified interactively (no browser tool available this session). Validation logic (non-mp4 rejection), error transitions, and the 3-minute timeout are implemented and typecheck/build cleanly, but should be manually exercised in a browser before considering this change fully done.
