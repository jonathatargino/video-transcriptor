import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { logger } from "../../logger/index.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

type SaveTranscription = (item: {
  jobId: string;
  transcription: string;
}) => Promise<void>;

export const saveTranscription: SaveTranscription = async (item) => {
  const commandItem = {
    job_id: item.jobId,
    transcription: item.transcription,
    createdAt: Date.now(),
  };

  logger.info({
    message: "Uploading transcription on DynamoDB",
    item: { ...commandItem },
  });

  const command = new PutCommand({
    TableName: "transcriptions",
    Item: commandItem,
  });

  await docClient.send(command);

  logger.info({
    message: "Transcription saved on DynamoDB!",
    jobId: item.jobId,
  });
};
