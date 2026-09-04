import { pino, destination } from "pino";

export const logger = pino(
  {
    level: "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  destination({ sync: true }),
);
