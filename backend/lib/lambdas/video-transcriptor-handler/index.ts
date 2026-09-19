import { SQSEvent, SQSHandler, S3Event } from "aws-lambda";
import { getS3VideoReadable } from "./get-s3-video-readable.js";
import { readableToText } from "./deepgram.js";
import {
  saveFailedTranscriptionExecution,
  saveTranscription,
} from "./dynamodb.js";

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const event: S3Event = JSON.parse(record.body);

    for (const payload of event.Records) {
      const objectKey = decodeURIComponent(
        payload.s3.object.key.replace(/\+/g, " "),
      );
      const jobId = objectKey.replace(/\.mp4$/, "");
      try {
        const { readable, metadata } = await getS3VideoReadable(payload.s3);
        const transcription = await readableToText(
          readable,
          metadata
            ? {
                language: metadata.language,
                summarize: metadata.summarize === "true" ? "v2" : undefined,
                filler_words: metadata.fillerwords === "true",
                diarize: metadata.diarize === "true",
              }
            : {},
        );

        await saveTranscription({
          jobId,
          transcription,
        });
      } catch (error) {
        await saveFailedTranscriptionExecution({ jobId });
      }
    }
  }
};
