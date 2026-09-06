import { GetPresignedUrl, getPresignedUrl } from "../../services/s3.js";
import { randomUUID } from "node:crypto";

type GetPresignedUrlByFile = (params: { fileType: string }) => Promise<string>;

export function makeGetPresignedUrlByFile(
  getPresignedUrl: GetPresignedUrl,
): GetPresignedUrlByFile {
  return async ({ fileType }) => {
    const jobId = randomUUID();

    return await getPresignedUrl({ fileType, jobId });
  };
}

export const getPresignedUrlByFile = makeGetPresignedUrlByFile(getPresignedUrl);
