## ADDED Requirements

### Requirement: Transcript display
When a transcription becomes available, the system SHALL replace the dropzone/polling view with a view that displays the full transcript text.

#### Scenario: Transcript is shown after polling succeeds
- **WHEN** the polling flow receives a non-empty transcription
- **THEN** the system displays the transcript text in the transcript view

### Requirement: Copy to clipboard
The transcript view SHALL include a button that copies the full transcript text to the clipboard when clicked.

#### Scenario: User copies the transcript
- **WHEN** the user clicks the copy button on the transcript view
- **THEN** the full transcript text is written to the clipboard

### Requirement: Reset to upload another video
The transcript view SHALL include a button that resets the page back to its initial state (dropzone visible, no file, no job id, no transcript) so the user can upload another video.

#### Scenario: User uploads another video
- **WHEN** the user clicks the "upload another video" button on the transcript view
- **THEN** the system clears the current file, job id, and transcript, and shows the initial dropzone view
