import { Router } from "express";
import { getTranscriptionRouter } from "./transcription.js";

export function getAppRouter() {
  const router = Router();

  router.use("/transcription", getTranscriptionRouter());

  return router;
}
