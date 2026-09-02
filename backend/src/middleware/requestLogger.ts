import morgan, { StreamOptions } from "morgan";
import { logger } from "../utils/logger";
import { env } from "../config/env";

const stream: StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

const skip = () => {
  return env.isTest;
};

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export default requestLogger;
