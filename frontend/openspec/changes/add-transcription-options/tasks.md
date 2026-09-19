## 1. shadcn primitives

- [x] 1.1 Add `select` primitive via `npx shadcn add select` (or hand-roll on `@base-ui/react` if unavailable in the `base-nova` registry), for the language control.
- [x] 1.2 Add `switch` primitive via `npx shadcn add switch` (or hand-roll), for the diarize/fillerWords/summarize toggles.
- [x] 1.3 Add `label` primitive via `npx shadcn add label` (or hand-roll), for accessible option labels.

## 2. API layer

- [x] 2.1 In `src/api/transcription.ts`, add a `TranscriptionOptions` type (`language?: string; diarize?: boolean; fillerWords?: boolean; summarize?: boolean`).
- [x] 2.2 Update `getPresignedUrl` to accept `(fileType: string, options?: TranscriptionOptions)` and spread `options` into the request body alongside `fileType`.

## 3. Transcription options form

- [x] 3.1 Create `src/components/TranscriptionOptionsForm.tsx` with local state for the four options, defaulting to "Auto-detect" / all toggles off.
- [x] 3.2 Add the BCP-47 language `Select` with a curated list (`Auto-detect`, `en-US`, `en-GB`, `es`, `es-419`, `pt-BR`, `pt-PT`, `fr`, `de`, `it`, `nl`, `ja`, `ko`, `zh`, `hi`, `ru`) mapping `Auto-detect` to `undefined`.
- [x] 3.3 Add `Switch` + `Label` rows for diarization, filler words, and summarization, each with a short helper description and a `lucide-react` icon.
- [x] 3.4 Add "Transcribe" (primary) and "Change file" (secondary) actions; "Transcribe" calls a passed-in `onConfirm(options)` prop, "Change file" calls a passed-in `onChangeFile()` prop.

## 4. Wire into the app state machine

- [x] 4.1 In `src/App.tsx`, add a `configuring` state and a `selectedFile` piece of state; extend `AppState` to `'idle' | 'configuring' | 'uploading' | 'polling' | 'error' | 'done'`.
- [x] 4.2 Update `Dropzone`'s `onFileAccepted` handler to store the file and set state to `configuring` instead of calling `uploadMutation.mutate` directly.
- [x] 4.3 Render `TranscriptionOptionsForm` in the `configuring` state; on `onConfirm(options)` call `uploadMutation.mutate({ file: selectedFile, options })`; on `onChangeFile()` reset back to `idle`.
- [x] 4.4 Update `uploadMutation`'s `mutationFn` to accept `{ file, options }` and pass `options` through to `getPresignedUrl`.
- [x] 4.5 Update `reset()` to also clear `selectedFile` and any in-progress options state.

## 5. Visual polish

- [x] 5.1 Add enter/exit transitions between app states using `tw-animate-css` utility classes (e.g. `animate-in fade-in-0 slide-in-from-bottom-2`) in `App.tsx`.
- [x] 5.2 Add per-option `lucide-react` icons (e.g. `Languages`, `Users`, `MessageSquareText`, `FileText`) in `TranscriptionOptionsForm`.
- [x] 5.3 Review spacing/hover/focus states on the new form controls and the existing dropzone/transcript views for visual consistency, using only existing design tokens from `index.css`.

## 6. Verification

- [x] 6.1 Run `npm run lint` and `npm run build` (`tsc -b && vite build`) and fix any errors.
- [ ] 6.2 Manually test in the dev server: drop an mp4 → options screen appears → toggling options and picking a language works → "Change file" returns to the dropzone → "Transcribe" sends the expected body (verify via browser network tab) → upload/polling/transcript flow still completes.
- [ ] 6.3 Manually verify the "Auto-detect" default omits `language` from the request body, and that unset toggles are omitted or sent as `false` without breaking the request.
