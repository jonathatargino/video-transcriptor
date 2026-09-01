import { SQSEvent, SQSHandler, S3Event } from "aws-lambda";
import { getS3VideoReadable } from "./get-s3-video-readable.js";
import { readableToText } from "./deepgram.js";
import { saveTranscription } from "./dynamodb.js";
import { randomUUID } from "node:crypto";

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const event: S3Event = JSON.parse(record.body);

    for (const payload of event.Records) {
      const readable = await getS3VideoReadable(payload.s3);
      const transcription = await readableToText(readable);

      await saveTranscription({
        jobId: randomUUID(),
        transcription,
      });
    }
  }
};
