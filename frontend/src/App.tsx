import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getPresignedUrl,
  parseJobIdFromPresignedUrl,
  uploadFileToPresignedUrl,
  type TranscriptionOptions,
} from '@/api/transcription'
import { Dropzone } from '@/components/Dropzone'
import { TranscriptionOptionsForm } from '@/components/TranscriptionOptionsForm'
import { TranscriptView } from '@/components/TranscriptView'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TranscriptionTimeoutError, useTranscriptionPolling } from '@/hooks/useTranscriptionPolling'

type AppState = 'idle' | 'configuring' | 'uploading' | 'polling' | 'error' | 'done'

interface UploadMutationInput {
  file: File
  options: TranscriptionOptions
}

function App() {
  const [state, setState] = useState<AppState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async ({ file, options }: UploadMutationInput) => {
      const { presignedUrl } = await getPresignedUrl(file.type, options)
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
    setSelectedFile(null)
    setJobId(null)
    setTranscript(null)
    setErrorMessage(null)
  }

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_oklch,var(--primary),transparent_94%),transparent_55%),radial-gradient(circle_at_85%_0%,color-mix(in_oklch,var(--primary),transparent_96%),transparent_50%)]"
      />

      <h1 className="animate-in fade-in-0 text-2xl font-semibold">Video Transcriptor</h1>

      <div className="flex w-full max-w-2xl flex-col items-center">
        {state === 'idle' && (
          <div className="w-full animate-in fade-in-0 slide-in-from-bottom-2">
            <Dropzone
              onFileAccepted={(file) => {
                setSelectedFile(file)
                setState('configuring')
              }}
            />
          </div>
        )}

        {state === 'configuring' && selectedFile && (
          <TranscriptionOptionsForm
            fileName={selectedFile.name}
            onChangeFile={() => {
              setSelectedFile(null)
              setState('idle')
            }}
            onConfirm={(options) => uploadMutation.mutate({ file: selectedFile, options })}
          />
        )}

        {state === 'uploading' && (
          <div className="flex flex-col items-center gap-3 text-center animate-in fade-in-0">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="font-medium">Uploading your video…</p>
          </div>
        )}

        {state === 'polling' && (
          <div className="flex flex-col items-center gap-3 text-center animate-in fade-in-0">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="font-medium">Transcribing your video…</p>
            <p className="text-sm text-muted-foreground">
              This can take a few minutes. We'll check for the transcript every 10 seconds.
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex w-full flex-col items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-2">
            <Alert variant="destructive" className="w-full">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <Button type="button" onClick={reset}>
              Try again
            </Button>
          </div>
        )}

        {state === 'done' && transcript !== null && (
          <div className="w-full animate-in fade-in-0 slide-in-from-bottom-2">
            <TranscriptView transcript={transcript} onReset={reset} />
          </div>
        )}
      </div>
    </main>
  )
}

export default App
