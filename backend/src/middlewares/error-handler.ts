import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { logger } from "../lib/logger/index.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const isHttpError = createHttpError.isHttpError(err);
  const statusCode = isHttpError
    ? err.statusCode
    : StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    isHttpError && err.expose
      ? err.message
      : ReasonPhrases.INTERNAL_SERVER_ERROR;

  logger.error({
    message: "Unhandled error in request",
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: err,
  });

  res.status(statusCode).send({ error: message });
}
