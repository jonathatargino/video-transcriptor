## ADDED Requirements

### Requirement: Fixed-interval polling
Once a job id is known, the system SHALL poll `GET /api/v1/transcription/:jobId` every 10 seconds using React Query until a transcription is available, the 3-minute timeout is reached, or the user resets the page.

#### Scenario: Poll returns not-ready
- **WHEN** a poll to `GET /api/v1/transcription/:jobId` returns a 404 or a response without a transcription
- **THEN** the system schedules the next poll 10 seconds later and stays in the polling/loading view

#### Scenario: Poll returns a transcription
- **WHEN** a poll to `GET /api/v1/transcription/:jobId` returns a response containing a non-empty `transcription`
- **THEN** the system stops polling and transitions to the transcript view

### Requirement: Three-minute timeout
The system SHALL measure elapsed wall-clock time from the moment polling starts and SHALL stop polling and show an error state if no transcription has been returned within 3 minutes.

#### Scenario: Transcription ready within timeout
- **WHEN** a transcription becomes available before 3 minutes have elapsed since polling started
- **THEN** the system shows the transcript view instead of an error

#### Scenario: Transcription not ready after timeout
- **WHEN** 3 minutes have elapsed since polling started and no transcription has been returned
- **THEN** the system stops polling and displays an error message on screen
