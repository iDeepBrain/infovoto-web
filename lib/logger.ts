/**
 * Simple logger utility with timestamps and context.
 * Logs to console in dev, errors to sentry in prod (future).
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m",  // Green
  warn: "\x1b[33m",  // Yellow
  error: "\x1b[31m", // Red
};

const RESET = "\x1b[0m";

export class Logger {
  constructor(private context: string) {}

  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;

    if (typeof window === "undefined") {
      // Server-side (Node.js) - use terminal colors
      const color = LOG_LEVEL_COLORS[level];
      return `${color}${prefix}${RESET} ${message}${data ? ` ${JSON.stringify(data)}` : ""}`;
    } else {
      // Client-side (browser)
      return `${prefix} ${message}${data ? ` ${JSON.stringify(data)}` : ""}`;
    }
  }

  debug(message: string, data?: any) {
    console.debug(this.formatMessage("debug", message, data));
  }

  info(message: string, data?: any) {
    console.info(this.formatMessage("info", message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage("warn", message, data));
  }

  error(message: string, data?: any) {
    console.error(this.formatMessage("error", message, data));
    // TODO: Send to Sentry in production
  }
}

export const createLogger = (context: string) => new Logger(context);
