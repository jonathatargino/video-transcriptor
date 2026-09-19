## ADDED Requirements

### Requirement: Transcription options screen
After a valid `.mp4` file is accepted and before any upload starts, the system SHALL present a transcription options screen showing controls for language, speaker diarization, filler words, and summarization, along with a "Transcribe" action and a "Change file" action.

#### Scenario: Options screen shown after file selection
- **WHEN** a valid `.mp4` file is accepted by the dropzone
- **THEN** the system shows the transcription options screen with all four option controls and the "Transcribe" and "Change file" actions, and does not start the upload

### Requirement: Language selection uses BCP-47 tags
The system SHALL let the user pick a transcription language from a fixed list of BCP-47 language tags plus an "Auto-detect" option, defaulting to "Auto-detect". Selecting "Auto-detect" SHALL omit the `language` field entirely when the presigned-url request is sent; selecting any other option SHALL send its exact BCP-47 tag (e.g. `pt-BR`, `en-US`) as `language`.

#### Scenario: Default is Auto-detect
- **WHEN** the transcription options screen is first shown
- **THEN** the language control is set to "Auto-detect"

#### Scenario: User picks a specific language
- **WHEN** the user selects a language other than "Auto-detect" (e.g. "Portuguese (Brazil)")
- **THEN** the system stores its BCP-47 tag (e.g. `pt-BR`) as the selected language, to be sent as `language` on "Transcribe"

### Requirement: Speaker diarization toggle
The system SHALL let the user enable or disable speaker diarization via a toggle, defaulting to disabled, and SHALL send its boolean state as `diarize` on "Transcribe".

#### Scenario: Diarization defaults off
- **WHEN** the transcription options screen is first shown
- **THEN** the diarization toggle is off

#### Scenario: User enables diarization
- **WHEN** the user turns the diarization toggle on and presses "Transcribe"
- **THEN** the presigned-url request includes `diarize: true`

### Requirement: Filler words toggle
The system SHALL let the user enable or disable keeping filler words (e.g. "um", "uh") via a toggle, defaulting to disabled, and SHALL send its boolean state as `fillerWords` on "Transcribe".

#### Scenario: Filler words default off
- **WHEN** the transcription options screen is first shown
- **THEN** the filler words toggle is off

#### Scenario: User enables filler words
- **WHEN** the user turns the filler words toggle on and presses "Transcribe"
- **THEN** the presigned-url request includes `fillerWords: true`

### Requirement: Summarization toggle
The system SHALL let the user enable or disable summarization via a toggle, defaulting to disabled, and SHALL send its boolean state as `summarize` on "Transcribe".

#### Scenario: Summarization defaults off
- **WHEN** the transcription options screen is first shown
- **THEN** the summarization toggle is off

#### Scenario: User enables summarization
- **WHEN** the user turns the summarization toggle on and presses "Transcribe"
- **THEN** the presigned-url request includes `summarize: true`

### Requirement: Explicit transcribe action gates the upload
The system SHALL NOT request a presigned URL or start uploading the selected file until the user presses "Transcribe" on the transcription options screen.

#### Scenario: No upload before confirmation
- **WHEN** the transcription options screen is shown and the user has not yet pressed "Transcribe"
- **THEN** the system has not called the presigned-url endpoint and has not started uploading

#### Scenario: Transcribe starts the upload
- **WHEN** the user presses "Transcribe"
- **THEN** the system requests a presigned URL with the current option selections and, on success, proceeds to upload the file

### Requirement: Change file action discards the current selection
The system SHALL let the user return to the dropzone from the transcription options screen via a "Change file" action, discarding the currently selected file and any chosen options.

#### Scenario: User changes their mind about the file
- **WHEN** the user presses "Change file" on the transcription options screen
- **THEN** the system returns to the initial dropzone state with no file selected and no upload started
