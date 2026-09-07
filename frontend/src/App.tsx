import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPresignedUrl, parseJobIdFromPresignedUrl, uploadFileToPresignedUrl } from '@/api/transcription'
import { Dropzone } from '@/components/Dropzone'
import { TranscriptView } from '@/components/TranscriptView'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TranscriptionTimeoutError, useTranscriptionPolling } from '@/hooks/useTranscriptionPolling'

type AppState = 'idle' | 'uploading' | 'polling' | 'error' | 'done'

function App() {
  const [state, setState] = useState<AppState>('idle')
  const [jobId, setJobId] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { presignedUrl } = await getPresignedUrl(file.type)
      await uploadFileToPresignedUrl(presignedUrl, file)
      return parseJobIdFromPresignedUrl(presignedUrl)
    },
    onMutate: () => {
      setState('uploading')
    },
    onSuccess: (newJobId) => {
      setJobId(newJobId)
      setState('polling')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong while uploading the video.')
      setState('error')
    },
  })

  const pollingQuery = useTranscriptionPolling({ jobId, enabled: state === 'polling' })

  useEffect(() => {
    if (state !== 'polling') return

    if (pollingQuery.data?.transcription) {
      setTranscript(pollingQuery.data.transcription)
      setState('done')
      return
    }

    if (pollingQuery.error instanceof TranscriptionTimeoutError) {
      setErrorMessage('The transcription is taking longer than expected. Please try again later.')
      setState('error')
    }
  }, [state, pollingQuery.data, pollingQuery.error])

  function reset() {
    setState('idle')
    setJobId(null)
    setTranscript(null)
    setErrorMessage(null)
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Video Transcriptor</h1>

      {state === 'idle' && <Dropzone onFileAccepted={(file) => uploadMutation.mutate(file)} />}

      {state === 'uploading' && (
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="font-medium">Uploading your video…</p>
        </div>
      )}

      {state === 'polling' && (
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="font-medium">Transcribing your video…</p>
          <p className="text-sm text-muted-foreground">
            This can take a few minutes. We'll check for the transcript every 10 seconds.
          </p>
        </div>
      )}

      {state === 'error' && (
        <div className="flex w-full flex-col items-center gap-4">
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </div>
      )}

      {state === 'done' && transcript !== null && <TranscriptView transcript={transcript} onReset={reset} />}
    </main>
  )
}

export default App
