type LogLevel = "info" | "warn" | "error" | "debug";

const formatMessage = (level: LogLevel, message: string, ...args: any[]): string => {
  const timestamp = new Date().toISOString();
  const formattedLevel = level.toUpperCase().padEnd(5);
  return `[${timestamp}] [${formattedLevel}] ${message}`;
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(formatMessage("info", message), ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(formatMessage("warn", message), ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(formatMessage("error", message), ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage("debug", message), ...args);
    }
  },
};

export default logger;
