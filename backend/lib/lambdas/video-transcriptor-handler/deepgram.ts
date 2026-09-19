import { DeepgramClient } from "@deepgram/sdk";
import { Readable } from "stream";
import { logger } from "../../logger/index.js";
import { MediaTranscribeRequestOctetStream } from "@deepgram/sdk/listen/v1";
import { SPEAKER_LABEL_BY_LANGUAGE } from "./speaker-labels.js";

const client = new DeepgramClient();

type ReadableToTextOptions = Pick<
  MediaTranscribeRequestOctetStream,
  "language" | "summarize" | "filler_words" | "diarize"
>;

export async function readableToText(
  readable: Readable,
  options: ReadableToTextOptions,
) {
  const shouldDetectLanguage = !options.language;

  const transcribeOptions: MediaTranscribeRequestOctetStream = {
    model: "nova-3",
    detect_language: shouldDetectLanguage,
    punctuate: true,
    smart_format: true,
    paragraphs: true,
    utterances: options.diarize,
    ...options,
  };

  logger.info({
    message: "Transcribing readable",
    transcribeOptions,
  });

  const response = await client.listen.v1.media.transcribeFile(
    readable,
    transcribeOptions,
  );

  if ("results" in response) {
    const utterances = response?.results?.utterances;

    const languageCode = (
      options.language ??
      response?.results?.channels?.[0]?.detected_language ??
      "en"
    )
      .split("-")[0]
      .toLowerCase();

    const speakerLabel = SPEAKER_LABEL_BY_LANGUAGE[languageCode] ?? "Speaker";

    const transcription =
      options.diarize && utterances?.length
        ? utterances
            .map(
              (utterance) =>
                `${speakerLabel} ${(utterance.speaker ?? 0) + 1}: ${utterance.transcript}`,
            )
            .join("\n")
        : (response?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "");

    logger.info({
      message: "Successfully transcripted the readable",
      transcription,
    });

    return transcription;
  }

  return "";
}
