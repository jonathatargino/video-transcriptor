import { UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const ACCEPTED_MIME_TYPE = 'video/mp4'
const ACCEPTED_EXTENSION = '.mp4'

interface DropzoneProps {
  onFileAccepted: (file: File) => void
  disabled?: boolean
}

function isMp4File(file: File): boolean {
  return file.type === ACCEPTED_MIME_TYPE || file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION)
}

export function Dropzone({ onFileAccepted, disabled }: DropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File | undefined) {
    if (!file) return

    if (!isMp4File(file)) {
      setValidationError('Only .mp4 files are supported. Please choose a different file.')
      return
    }

    setValidationError(null)
    onFileAccepted(file)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Card
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDraggingOver(false)
          if (disabled) return
          handleFile(event.dataTransfer.files[0])
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed transition-colors ${
          isDraggingOver ? 'border-primary bg-muted/50' : 'border-border'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <UploadCloud className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Drag and drop your video here</p>
            <p className="text-sm text-muted-foreground">or click to browse (.mp4 only)</p>
          </div>
          <Button type="button" variant="secondary" disabled={disabled}>
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={`${ACCEPTED_MIME_TYPE},${ACCEPTED_EXTENSION}`}
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              handleFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </CardContent>
      </Card>

      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
