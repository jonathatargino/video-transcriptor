## MODIFIED Requirements

### Requirement: MP4-only dropzone
The system SHALL present a dropzone on the initial page load that accepts a single file via drag-and-drop or a file picker, and SHALL reject any file whose type is not `video/mp4` (or extension is not `.mp4`) without contacting the backend.

#### Scenario: User drops a valid mp4 file
- **WHEN** the user drags a `.mp4` file onto the dropzone and drops it
- **THEN** the system accepts the file and transitions to the transcription options step, without starting the upload

#### Scenario: User drops a non-mp4 file
- **WHEN** the user drags a file that is not `.mp4` onto the dropzone and drops it
- **THEN** the system shows a validation message and does not start the upload flow

### Requirement: Presigned URL request
Once the user confirms the selected mp4 file and its transcription options via the "Transcribe" action, the system SHALL request a presigned upload URL from the backend by calling `POST /api/v1/transcription/presigned-url` with the file's MIME type and the selected transcription options, before attempting the upload.

#### Scenario: Presigned URL request succeeds
- **WHEN** the user presses "Transcribe" for a valid mp4 file with a chosen `language`, `diarize`, `fillerWords`, and `summarize` selection
- **THEN** the system calls `POST /api/v1/transcription/presigned-url` with `{ fileType: "video/mp4", language, diarize, fillerWords, summarize }` (omitting `language` when "Auto-detect" is selected) and receives `{ presignedUrl }`

#### Scenario: Presigned URL request fails
- **WHEN** the presigned URL request fails (network error or non-2xx response)
- **THEN** the system shows an error state and does not attempt to upload the file
