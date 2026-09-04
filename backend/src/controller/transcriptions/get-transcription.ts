import { Request, Response } from "express";
import { getTranscriptionByJobId } from "../../usecases/transcription/get-transcription-by-job-id.js";
import { StatusCodes } from "http-status-codes";

export async function getTranscription(req: Request, res: Response) {
  const jobId = req.params.jobId as string;
  const transcription = await getTranscriptionByJobId({ jobId });

  return res.status(StatusCodes.OK).send({ transcription });
}
