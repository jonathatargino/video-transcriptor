import createHttpError from "http-errors";
import { getTranscription, GetTranscription } from "../../services/dynamodb.js";

type GetTranscriptionByJobId = (params: { jobId: string }) => Promise<string>;

export const makeGetTranscriptionByJobId = (
  getTranscription: GetTranscription,
): GetTranscriptionByJobId => {
  return async ({ jobId }) => {
    const transcription = await getTranscription({ jobId });

    if (!transcription) {
      throw createHttpError.NotFound("Transcription not found");
    }

    return transcription;
  };
};

export const getTranscriptionByJobId =
  makeGetTranscriptionByJobId(getTranscription);
