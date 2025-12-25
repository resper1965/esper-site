/**
 * Security Logger - OWASP A09 Compliance
 * Centralized logging for security events
 */

type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    };
    console.log(formatLog(entry));
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
    };
    console.warn(formatLog(entry));
  },

  error: (message: string, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
    };
    console.error(formatLog(entry));
  },

  /**
   * Log security-relevant events (auth failures, rate limits, suspicious activity)
   */
  security: (message: string, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'security',
      message,
      context,
    };
    // In production, this could send to a SIEM or security monitoring system
    console.warn(`[SECURITY] ${formatLog(entry)}`);
  },

  /**
   * Log API request for audit trail
   */
  apiRequest: (
    method: string,
    path: string,
    status: number,
    durationMs: number,
    context?: Record<string, unknown>
  ) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `${method} ${path} ${status} ${durationMs}ms`,
      context,
    };
    console.log(formatLog(entry));
  },
};
