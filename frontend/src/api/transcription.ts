const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1/transcription'

export class TranscriptionApiError extends Error {}

export interface TranscriptionOptions {
  language?: string
  diarize?: boolean
  fillerWords?: boolean
  summarize?: boolean
}

export async function getPresignedUrl(
  fileType: string,
  options?: TranscriptionOptions,
): Promise<{ presignedUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/presigned-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileType, ...options }),
  })

  if (!response.ok) {
    throw new TranscriptionApiError('Failed to request a presigned upload URL')
  }

  return response.json()
}

export async function uploadFileToPresignedUrl(
  url: string,
  file: File,
  options?: TranscriptionOptions,
): Promise<void> {
  const headers = new Headers({ 'Content-Type': file.type })

  if (options?.language) headers.set('x-amz-meta-language', options.language)
  if (options?.diarize) headers.set('x-amz-meta-diarize', String(options.diarize))
  if (options?.fillerWords) headers.set('x-amz-meta-fillerWords', String(options.fillerWords))
  if (options?.summarize) headers.set('x-amz-meta-summarize', String(options.summarize))

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: file,
  })

  if (!response.ok) {
    throw new TranscriptionApiError('Failed to upload the file to storage')
  }
}

export type TranscriptionStatus = 'success' | 'error'

export interface Transcription {
  jobId: string
  transcription: string
  createdAt: number
  status: TranscriptionStatus
  ttl: number
}

export async function getTranscription(jobId: string): Promise<Transcription | null> {
  const response = await fetch(`${API_BASE_URL}/${jobId}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new TranscriptionApiError('Failed to fetch the transcription status')
  }

  const { transcription } = (await response.json()) as { transcription: Transcription | null }
  return transcription
}

export function parseJobIdFromPresignedUrl(presignedUrl: string): string {
  const { pathname } = new URL(presignedUrl)
  const fileName = pathname.split('/').pop()

  if (!fileName) {
    throw new TranscriptionApiError('Could not determine the job id from the upload URL')
  }

  return fileName.replace(/\.mp4$/, '')
}
