import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { getTranscription } from '@/api/transcription'

const POLL_INTERVAL_MS = 10_000
const TIMEOUT_MS = 3 * 60_000

export class TranscriptionTimeoutError extends Error {
  constructor() {
    super('Transcription was not ready in time')
    this.name = 'TranscriptionTimeoutError'
  }
}

interface UseTranscriptionPollingOptions {
  jobId: string | null
  enabled: boolean
}

export function useTranscriptionPolling({ jobId, enabled }: UseTranscriptionPollingOptions) {
  const deadlineRef = useRef<number | null>(null)

  if (enabled && deadlineRef.current === null) {
    deadlineRef.current = Date.now() + TIMEOUT_MS
  }
  if (!enabled) {
    deadlineRef.current = null
  }

  return useQuery({
    queryKey: ['transcription', jobId],
    queryFn: async () => {
      if (deadlineRef.current !== null && Date.now() > deadlineRef.current) {
        throw new TranscriptionTimeoutError()
      }

      return getTranscription(jobId as string)
    },
    enabled: enabled && jobId !== null,
    refetchInterval: (query) => {
      if (query.state.data?.transcription) return false
      if (query.state.error instanceof TranscriptionTimeoutError) return false
      return POLL_INTERVAL_MS
    },
    retry: false,
  })
}
