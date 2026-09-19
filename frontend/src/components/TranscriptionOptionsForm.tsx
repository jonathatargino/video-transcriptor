import { FileText, Languages, MessageSquareText, TriangleAlert, Users } from 'lucide-react'
import { useState } from 'react'
import type { TranscriptionOptions } from '@/api/transcription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const AUTO_DETECT_VALUE = 'auto'
const ENGLISH_LANGUAGE_VALUES = new Set(['en-US', 'en-GB'])

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: AUTO_DETECT_VALUE, label: 'Auto-detect' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'es-419', label: 'Spanish (Latin America)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'pt-PT', label: 'Portuguese (Portugal)' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ru', label: 'Russian' },
]

interface ToggleOption {
  key: 'diarize' | 'fillerWords' | 'summarize'
  label: string
  description: string
  icon: typeof Users
}

const TOGGLE_OPTIONS: ToggleOption[] = [
  {
    key: 'diarize',
    label: 'Speaker diarization',
    description: 'Label who is speaking when multiple speakers are detected.',
    icon: Users,
  },
  {
    key: 'fillerWords',
    label: 'Filler words',
    description: 'Keep "um", "uh", and other filler words in the transcript.',
    icon: MessageSquareText,
  },
  {
    key: 'summarize',
    label: 'Summary',
    description: 'Generate a short summary alongside the full transcript.',
    icon: FileText,
  },
]

interface TranscriptionOptionsFormProps {
  fileName: string
  onConfirm: (options: TranscriptionOptions) => void
  onChangeFile: () => void
}

export function TranscriptionOptionsForm({ fileName, onConfirm, onChangeFile }: TranscriptionOptionsFormProps) {
  const [language, setLanguage] = useState<string>(AUTO_DETECT_VALUE)
  const [diarize, setDiarize] = useState(false)
  const [fillerWords, setFillerWords] = useState(false)
  const [summarize, setSummarize] = useState(false)

  const isEnglishSelected = ENGLISH_LANGUAGE_VALUES.has(language)

  function handleLanguageChange(value: string) {
    setLanguage(value)
    if (!ENGLISH_LANGUAGE_VALUES.has(value)) setSummarize(false)
  }

  function handleConfirm() {
    onConfirm({
      language: language === AUTO_DETECT_VALUE ? undefined : language,
      diarize,
      fillerWords,
      summarize,
    })
  }

  const toggleState: Record<ToggleOption['key'], boolean> = { diarize, fillerWords, summarize }
  const toggleSetters: Record<ToggleOption['key'], (value: boolean) => void> = {
    diarize: setDiarize,
    fillerWords: setFillerWords,
    summarize: setSummarize,
  }

  return (
    <Card className="w-full animate-in fade-in-0 slide-in-from-bottom-2">
      <CardHeader>
        <CardTitle>Transcription options</CardTitle>
        <p className="truncate text-sm text-muted-foreground" title={fileName}>
          {fileName}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="language-select" className="flex items-center gap-2 text-foreground">
            <Languages className="size-4 text-muted-foreground" />
            Video Language
          </Label>
          <Select value={language} onValueChange={(value) => handleLanguageChange(value as string)}>
            <SelectTrigger id="language-select" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {TOGGLE_OPTIONS.map((option) => {
          const Icon = option.icon
          const isSummarize = option.key === 'summarize'
          const disabled = isSummarize && !isEnglishSelected

          return (
            <div
              key={option.key}
              className={`flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors ${
                disabled ? 'opacity-60' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor={`${option.key}-switch`}>{option.label}</Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                  {disabled && (
                    <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <TriangleAlert className="size-3" />
                      Only available for English audio
                    </p>
                  )}
                </div>
              </div>
              <Switch
                id={`${option.key}-switch`}
                checked={toggleState[option.key]}
                onCheckedChange={toggleSetters[option.key]}
                disabled={disabled}
              />
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="justify-between">
        <Button type="button" variant="outline" onClick={onChangeFile}>
          Change file
        </Button>
        <Button type="button" onClick={handleConfirm}>
          Transcribe
        </Button>
      </CardFooter>
    </Card>
  )
}
