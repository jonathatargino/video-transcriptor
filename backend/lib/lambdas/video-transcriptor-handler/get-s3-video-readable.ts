import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3EventRecord } from "aws-lambda";
import { Readable } from "node:stream";

const s3Client = new S3Client({});

interface GetS3VideoReadableResponse {
  readable: Readable;
  metadata?: Record<string, string>;
}

export async function getS3VideoReadable(
  params: S3EventRecord["s3"],
): Promise<GetS3VideoReadableResponse> {
  const bucketName = params.bucket.name;
  const objectRawKey = params.object.key;

  const objectKey = decodeURIComponent(objectRawKey.replace(/\+/g, " "));

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  const response = await s3Client.send(command);

  const readable = response.Body;

  if (!readable) {
    throw new Error("Conteúdo do arquivo S3 veio vazio.");
  }

  return {
    readable: readable as Readable,
    metadata: response.Metadata,
  };
}
