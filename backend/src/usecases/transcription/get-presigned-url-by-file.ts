import { GetPresignedUrl, getPresignedUrl } from "../../services/s3.js";
import { randomUUID } from "node:crypto";

interface GetPresignedUrlByFileParams {
  fileType: string;
  language?: string;
  summarize?: boolean;
  fillerWords?: boolean;
  diarize?: boolean;
}

type GetPresignedUrlByFile = (
  params: GetPresignedUrlByFileParams,
) => Promise<string>;

export function makeGetPresignedUrlByFile(
  getPresignedUrl: GetPresignedUrl,
): GetPresignedUrlByFile {
  return async ({ fileType, diarize, fillerWords, language, summarize }) => {
    const jobId = randomUUID();

    return await getPresignedUrl({
      fileType,
      jobId,
      diarize: diarize ? String(diarize) : undefined,
      fillerWords: fillerWords ? String(fillerWords) : undefined,
      summarize: summarize ? String(summarize) : undefined,
      language,
    });
  };
}

export const getPresignedUrlByFile = makeGetPresignedUrlByFile(getPresignedUrl);
