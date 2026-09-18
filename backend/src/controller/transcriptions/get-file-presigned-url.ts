import { Request, Response } from "express";
import { getPresignedUrlByFile } from "../../usecases/transcription/get-presigned-url-by-file.js";
import { StatusCodes } from "http-status-codes";

export async function getFilePresignedUrl(req: Request, res: Response) {
  const { fileType, diarize, fillerWords, language, summarize } = req.body;

  const presignedUrl = await getPresignedUrlByFile({
    fileType,
    diarize,
    fillerWords,
    language,
    summarize,
  });

  return res.status(StatusCodes.OK).json({ presignedUrl });
}
