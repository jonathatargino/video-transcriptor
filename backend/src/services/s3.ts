import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { logger } from "../lib/logger/index.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({});

export type GetPresignedUrl = (params: {
  fileType: string;
  jobId: string;
}) => Promise<string>;

export const getPresignedUrl: GetPresignedUrl = async ({ fileType, jobId }) => {
  const commandItem: PutObjectCommandInput = {
    Bucket: process.env.TRANSCRIPTIONS_VIDEO_BUCKET_NAME,
    Key: jobId,
    ContentType: fileType,
  };

  logger.info({
    message: "Generating presigned url to file",
    item: { ...commandItem },
  });

  const command = new PutObjectCommand(commandItem);

  const presignedUrl = await getSignedUrl(client, command, {
    expiresIn: 900,
  });

  logger.info({
    message: "Successfully generated presigned url to file",
    jobId,
    presignedUrl,
  });

  return presignedUrl;
};
