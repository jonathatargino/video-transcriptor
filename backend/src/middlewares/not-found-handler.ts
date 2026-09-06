import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(createHttpError.NotFound(`Route ${req.method} ${req.originalUrl} not found`));
}
