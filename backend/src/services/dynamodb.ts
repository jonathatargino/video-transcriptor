import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Transcription } from "../types/transcription.js";
import { logger } from "../lib/logger/index.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export type GetTranscription = (params: {
  jobId: string;
}) => Promise<string | undefined>;

export const getTranscription: GetTranscription = async ({ jobId }) => {
  try {
    const commandItem: GetCommandInput = {
      TableName: "transcriptions",
      Key: {
        job_id: jobId,
      },
    };

    logger.info({
      message: "Fetching transcription in DynamoDB",
      item: { ...commandItem },
    });

    const command = new GetCommand(commandItem);

    const result = await docClient.send(command);
    const transcriptionObject = result.Item as Transcription;

    if (!transcriptionObject.transcription) {
      logger.error({
        message: "Didn't receive transcription on DynamoDB request",
        jobId,
      });
      return undefined;
    }

    return transcriptionObject.transcription;
  } catch (error) {
    logger.error({
      message: "Couldn't find transcription",
      jobId,
      error,
    });
    return undefined;
  }
};
