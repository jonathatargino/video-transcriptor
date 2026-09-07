## ADDED Requirements

### Requirement: MP4-only dropzone
The system SHALL present a dropzone on the initial page load that accepts a single file via drag-and-drop or a file picker, and SHALL reject any file whose type is not `video/mp4` (or extension is not `.mp4`) without contacting the backend.

#### Scenario: User drops a valid mp4 file
- **WHEN** the user drags a `.mp4` file onto the dropzone and drops it
- **THEN** the system accepts the file and begins the upload flow

#### Scenario: User drops a non-mp4 file
- **WHEN** the user drags a file that is not `.mp4` onto the dropzone and drops it
- **THEN** the system shows a validation message and does not start the upload flow

### Requirement: Presigned URL request
Once a valid mp4 file is selected, the system SHALL request a presigned upload URL from the backend by calling `POST /api/v1/transcription/presigned-url` with the file's MIME type, before attempting the upload.

#### Scenario: Presigned URL request succeeds
- **WHEN** a valid mp4 file is selected
- **THEN** the system calls `POST /api/v1/transcription/presigned-url` with `{ fileType: "video/mp4" }` and receives `{ presignedUrl }`

#### Scenario: Presigned URL request fails
- **WHEN** the presigned URL request fails (network error or non-2xx response)
- **THEN** the system shows an error state and does not attempt to upload the file

### Requirement: Direct-to-S3 upload
The system SHALL upload the selected file directly to S3 via an HTTP `PUT` to the presigned URL, using the file's MIME type as the `Content-Type` header, without routing the file bytes through the backend.

#### Scenario: Upload succeeds
- **WHEN** the `PUT` request to the presigned URL completes with a success status
- **THEN** the system derives the job id from the presigned URL and transitions to polling for the transcription status

#### Scenario: Upload fails
- **WHEN** the `PUT` request to the presigned URL fails (network error or non-2xx response)
- **THEN** the system shows an error state and does not start polling
