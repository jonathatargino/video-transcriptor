## Why

The backend's `POST /api/v1/transcription/presigned-url` endpoint now accepts optional transcription options (`language`, `diarize`, `fillerWords`, `summarize`) that are forwarded to Deepgram, but the frontend still only sends `fileType` and uploads immediately on file drop. Users have no way to pick these options, and the upload starts before they get a chance to.

## What Changes

- Add a transcription options step between file selection and upload: after a valid `.mp4` is chosen, show a configuration screen instead of uploading immediately.
- Add controls for the four backend-supported options:
  - `language`: a searchable picker of BCP-47 language tags (e.g. `en-US`, `pt-BR`), defaulting to "Auto-detect" (omits the field, matching backend auto-detect behavior).
  - `diarize`: toggle for speaker diarization, default off.
  - `fillerWords`: toggle for keeping filler words ("um", "uh"), default off.
  - `summarize`: toggle for generating a summary, default off.
- Add an explicit "Transcribe" button that is the only way to start the upload; selecting/dropping a file no longer auto-starts the upload. A "Change file" action returns to the dropzone without losing the ability to pick a new file.
- Extend the presigned-url request to send the selected options alongside `fileType`.
- Visual/interaction polish pass ("juice it up"): icons per option, animated state transitions (using the already-installed `tw-animate-css`), refined empty/loading/error/done visuals — no new runtime dependencies, no behavior change beyond what's listed above.

## Capabilities

### New Capabilities
- `transcription-options`: the configuration screen (language, diarize, fillerWords, summarize controls) and the explicit transcribe action that gates the upload.

### Modified Capabilities
- `video-upload`: file acceptance no longer immediately triggers the presigned-url request/upload — it now waits for the user to confirm via the "Transcribe" action from `transcription-options`, and the presigned-url request body includes the selected options.

## Impact

- `src/App.tsx`: new `configuring` state between `idle` and `uploading`, holding the selected `File` and chosen options.
- `src/components/Dropzone.tsx`: `onFileAccepted` now hands off to the configuration step instead of starting the upload mutation directly.
- New `src/components/TranscriptionOptionsForm.tsx` (or similar): renders the option controls and the "Transcribe" / "Change file" actions.
- `src/api/transcription.ts`: `getPresignedUrl` signature extended to accept the optional fields and include them in the JSON body.
- New shadcn primitives added under `src/components/ui/` as needed for the form controls (e.g. switch, select/combobox, label) — sourced via the existing `shadcn` CLI already configured in `components.json`.
- No backend changes; this change is frontend-only.
