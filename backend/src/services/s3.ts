import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { logger } from "../lib/logger/index.js";

const client = new S3Client({});

export type UploadVideo = (params: {
  fileBuffer: Buffer;
  jobId: string;
}) => Promise<void>;

export const uploadVideo: UploadVideo = async ({ jobId, fileBuffer }) => {
  const commandItem: PutObjectCommandInput = {
    Bucket: "videotranscriptorcloudfor-videostotranscript453c87-mdf1nqwvspmr",
    Key: jobId,
    Body: fileBuffer,
  };

  logger.info({
    message: "Uploading file to S3",
    item: { ...commandItem },
  });

  const command = new PutObjectCommand(commandItem);

  await client.send(command);

  logger.info({
    message: "Successfully uploaded file to S3",
    jobId,
  });
};
