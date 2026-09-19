## Context

`src/api/transcription.ts`'s `getPresignedUrl(fileType)` calls `POST /api/v1/transcription/presigned-url` with `{ fileType }` only. The backend controller (`backend/src/controller/transcriptions/get-file-presigned-url.ts`) now reads `{ fileType, diarize, fillerWords, language, summarize }` from the body and forwards them as S3 object metadata; the transcription worker Lambda (`backend/lib/lambdas/video-transcriptor-handler/{index,deepgram}.ts`) turns that metadata into Deepgram `nova-3` options:

- `language` (string, BCP-47, e.g. `en-US`, `pt-BR`) — if omitted, Deepgram `detect_language` is used instead.
- `diarize` (boolean) — speaker diarization.
- `fillerWords` (boolean) — sent to Deepgram as `filler_words`.
- `summarize` (boolean) — sent to Deepgram as `summarize: "v2"` when true.

All four are optional and independent. Today `App.tsx`'s `Dropzone` calls `onFileAccepted` which immediately calls `uploadMutation.mutate(file)` — there is no point where the user is asked anything before the upload starts.

## Goals / Non-Goals

**Goals:**
- Insert a `configuring` step between file selection and upload where the user picks the four options, with sensible defaults (everything off / auto-detect).
- Make starting the upload an explicit action (`Transcribe` button), not a side effect of file selection.
- Send the selected options in the `POST /presigned-url` body.
- Add lightweight visual/motion polish using what's already installed (`tw-animate-css`, `lucide-react`, the existing shadcn/`@base-ui/react` setup) — no new runtime dependencies.

**Non-Goals:**
- No backend changes (already shipped).
- No free-text/combobox language search — the language control is a curated, fixed list of common BCP-47 tags plus "Auto-detect"; typing arbitrary codes is out of scope (would need a `cmdk`-style combobox dependency).
- No persistence of chosen options across page reloads or between uploads (matches the app's existing in-memory-only state model).
- No validation of the full set of languages Deepgram `nova-3` actually supports — the curated list only needs to produce valid BCP-47 tags, not be exhaustive.

## Decisions

1. **New `configuring` state in `App.tsx`'s state machine**: `idle | configuring | uploading | polling | error | done`. `Dropzone.onFileAccepted` now sets the selected `File` and moves to `configuring` instead of calling the upload mutation. A new `TranscriptionOptionsForm` renders in `configuring`, holding its own local `TranscriptionOptions` state (see below) until the user presses "Transcribe", which calls `uploadMutation.mutate({ file, options })`. A "Change file" action in that screen returns to `idle` and clears the selected file.
   - *Alternative considered*: keep the options form inside `Dropzone` itself. Rejected — `Dropzone`'s job is file acceptance/validation; mixing in transcription-option state would overload it and make `App.tsx`'s state machine harder to follow.

2. **Options data shape**: a `TranscriptionOptions` type in `src/api/transcription.ts`:
   ```ts
   interface TranscriptionOptions {
     language?: string
     diarize?: boolean
     fillerWords?: boolean
     summarize?: boolean
   }
   ```
   `getPresignedUrl` becomes `getPresignedUrl(fileType: string, options?: TranscriptionOptions)` and spreads `options` into the JSON body alongside `fileType`. `JSON.stringify` drops `undefined` values on its own, so leaving `language` unset (auto-detect) or a toggle `false` needs no extra filtering before sending — this matches the backend, which already treats a missing/false field as "off".

3. **Language control is a fixed `Select`, not a combobox**: a small curated list (`Auto-detect` plus common tags — `en-US`, `en-GB`, `es`, `es-419`, `pt-BR`, `pt-PT`, `fr`, `de`, `it`, `nl`, `ja`, `ko`, `zh`, `hi`, `ru`) covers the common case without pulling in a search/combobox dependency (`cmdk`) purely for this. `Auto-detect` maps to `language: undefined`, not a literal string, so it round-trips correctly to the backend's auto-detect path.
   - *Alternative considered*: free-text input validated against a BCP-47 regex. Rejected for now — riskier UX (users typing invalid/unsupported tags with no feedback) for a feature the backend doesn't validate either; flagged as an open question below.

4. **New shadcn primitives**: add `select`, `switch`, and `label` under `src/components/ui/` via the already-configured `shadcn` CLI (`components.json` → style `base-nova`, `@base-ui/react`), the same way `alert`/`button`/`card`/`textarea` were added. This keeps every primitive "owned" source consistent with the rest of `src/components/ui/`, and introduces no new npm dependency since `@base-ui/react` is already installed.
   - *Risk*: if the `base-nova` registry doesn't have one of these primitives (or its API differs from what's assumed here), fall back to hand-building a minimal owned component directly on `@base-ui/react` following `button.tsx`'s pattern — still zero new dependencies.

5. **Visual/motion polish stays CSS-only**: state transitions use `tw-animate-css` utility classes (already imported in `index.css`) — e.g. `animate-in fade-in-0 slide-in-from-bottom-2` — instead of adding a JS animation library. Icons per option (`Languages`, `Users`, `MessageSquareText`, `FileText`, `Sparkles`, etc.) come from `lucide-react`, already a dependency. Colors/spacing stay within the existing `oklch` design tokens in `index.css` (no hardcoded colors), so light/dark mode keeps working unmodified.

## Risks / Trade-offs

- [`base-nova` registry lacks `select`/`switch`, or its markup differs from assumptions here] → Mitigation: hand-roll the primitive on `@base-ui/react` (already a dependency) following the existing `button.tsx` pattern; verified at implementation time before deciding the exact form markup.
- [Fixed language list omits a language a user wants] → Mitigation: "Auto-detect" always works as a safe fallback; expanding the list later is a one-line data change, not a structural one.
- [Adding a mandatory confirmation step adds friction vs. today's "drop and go"] → Mitigation: this is the explicit point of the change (the backend needs the options before upload starts); defaults are all "off"/auto-detect so a user in a hurry can just press "Transcribe" immediately.

## Migration Plan

Frontend-only, no data migration. Ship as a normal frontend deploy; rollback is redeploying the previous build if needed.

## Open Questions

- Should the language control eventually become a searchable combobox (accepting arbitrary BCP-47 tags) instead of a fixed list? Deferred — would add a `cmdk`-style dependency.
- Should chosen options persist (e.g. in `localStorage`) across uploads in the same session? Deferred, not requested.
