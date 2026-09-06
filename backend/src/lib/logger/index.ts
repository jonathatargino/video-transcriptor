import { pino, destination, stdTimeFunctions, stdSerializers } from "pino";

export const logger = pino(
  {
    level: "info",
    timestamp: stdTimeFunctions.isoTime,
    serializers: {
      error: stdSerializers.err,
    },
  },
  destination({ sync: true }),
);
