## Why

The backend already exposes routes to issue an S3 presigned URL for a video upload (`POST /api/v1/transcription/presigned-url`) and to fetch a transcription by job id (`GET /api/v1/transcription/:jobId`), but there is no client to drive that flow. Users need a minimal web page to upload an `.mp4`, wait for the transcription to complete, and read the result.

## What Changes

- Scaffold a new Vite + React + TypeScript frontend in the current `frontend/` directory, styled with Tailwind CSS and shadcn/ui components.
- Add a single-page UI with a dropzone that accepts only `.mp4` files.
- On file drop/select, request a presigned URL from the backend and `PUT` the file directly to S3.
- Derive the job id from the presigned URL (the S3 object key is the job id; no extra field is returned by the backend today) and start polling `GET /api/v1/transcription/:jobId` every 10s with React Query.
- Stop polling and show an error state if the transcription isn't ready after 3 minutes.
- On success, switch the view to a transcript screen with copy-to-clipboard and a "upload another video" action that resets the app to the initial dropzone state.

## Capabilities

### New Capabilities
- `video-upload`: Dropzone-based mp4 selection, presigned URL request, and direct-to-S3 upload.
- `transcription-status-polling`: Polling a transcription job on a fixed interval with a timeout-driven error state.
- `transcript-viewer`: Displaying a completed transcript with copy and reset actions.

### Modified Capabilities
- None (no existing specs in this repo).

## Impact

- New `frontend/` app: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `components.json` (shadcn), `src/` (components, `src/components/ui` for shadcn primitives, hooks, API client).
- Depends on backend endpoints `POST /api/v1/transcription/presigned-url` and `GET /api/v1/transcription/:jobId` (see `backend/src/routes/transcription.ts`) — no backend code changes are in scope for this change.
- Dev-time CORS/proxy: the backend (Express, port 3009) has no CORS middleware today, so local dev needs a Vite proxy for `/api` (routes are mounted under `/api/v1`) to avoid browser CORS errors; production deployment/CORS is out of scope here.
