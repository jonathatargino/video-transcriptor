const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1/transcription'

export class TranscriptionApiError extends Error {}

export async function getPresignedUrl(fileType: string): Promise<{ presignedUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/presigned-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileType }),
  })

  if (!response.ok) {
    throw new TranscriptionApiError('Failed to request a presigned upload URL')
  }

  return response.json()
}

export async function uploadFileToPresignedUrl(url: string, file: File): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!response.ok) {
    throw new TranscriptionApiError('Failed to upload the file to storage')
  }
}

export async function getTranscription(jobId: string): Promise<{ transcription: string } | null> {
  const response = await fetch(`${API_BASE_URL}/${jobId}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new TranscriptionApiError('Failed to fetch the transcription status')
  }

  return response.json()
}

export function parseJobIdFromPresignedUrl(presignedUrl: string): string {
  const { pathname } = new URL(presignedUrl)
  const fileName = pathname.split('/').pop()

  if (!fileName) {
    throw new TranscriptionApiError('Could not determine the job id from the upload URL')
  }

  return fileName.replace(/\.mp4$/, '')
}
