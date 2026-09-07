import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface TranscriptViewProps {
  transcript: string
  onReset: () => void
}

export function TranscriptView({ transcript, onReset }: TranscriptViewProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea value={transcript} readOnly className="min-h-64 resize-none" />
      </CardContent>
      <CardFooter className="justify-between">
        <Button type="button" variant="outline" onClick={handleCopy}>
          {copied ? <Check /> : <Copy />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button type="button" onClick={onReset}>
          Upload another video
        </Button>
      </CardFooter>
    </Card>
  )
}
