import { Router } from "express";
import { TranscriptionController } from "../controller/transcriptions/index.js";

export function getTranscriptionRouter() {
  const router = Router();

  router.get("/:jobId", TranscriptionController.getTranscription);
  router.post("/presigned-url", TranscriptionController.getFilePresignedUrl);

  return router;
}
