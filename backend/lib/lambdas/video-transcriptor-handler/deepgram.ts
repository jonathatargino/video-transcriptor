import { DeepgramClient } from "@deepgram/sdk";
import { Readable } from "stream";
import { logger } from "../../logger/index.js";

const client = new DeepgramClient();

export async function readableToText(readable: Readable) {
  const response = await client.listen.v1.media.transcribeFile(readable, {
    model: "nova-3",
    detect_language: true,
    punctuate: true,
    smart_format: true,
    paragraphs: true,
  });

  logger.info({ deepgramResponse: response });

  if ("results" in response) {
    return (
      response?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""
    );
  }

  return "";
}
