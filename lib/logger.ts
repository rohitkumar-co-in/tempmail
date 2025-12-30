/**
 * Simple server-side logger for TempMail
 * Provides consistent log formatting with timestamps and log levels
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

const LOG_COLORS = {
  info: "\x1b[36m", // Cyan
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  debug: "\x1b[35m", // Magenta
  reset: "\x1b[0m",
};

/**
 * Format a log message with timestamp and level
 */
function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level];
  const reset = LOG_COLORS.reset;
  const levelStr = level.toUpperCase().padEnd(5);

  let logStr = `${color}[${timestamp}] [${levelStr}]${reset} ${message}`;

  if (context && Object.keys(context).length > 0) {
    logStr += ` ${JSON.stringify(context)}`;
  }

  return logStr;
}

/**
 * Logger instance with methods for each log level
 */
export const logger = {
  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    console.log(formatLog("info", message, context));
  },

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    console.warn(formatLog("warn", message, context));
  },

  /**
   * Log error messages
   */
  error(message: string, context?: LogContext): void {
    console.error(formatLog("error", message, context));
  },

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.log(formatLog("debug", message, context));
    }
  },

  /**
   * Log user actions
   */
  userAction(action: string, userId?: string, context?: LogContext): void {
    this.info(`[USER] ${action}`, { userId, ...context });
  },

  /**
   * Log Gmail operations
   */
  gmail(action: string, context?: LogContext): void {
    this.info(`[GMAIL] ${action}`, context);
  },

  /**
   * Log authentication events
   */
  auth(action: string, context?: LogContext): void {
    this.info(`[AUTH] ${action}`, context);
  },
};
