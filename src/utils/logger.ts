// Centralized logging utility for production-ready error handling

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    const envLevel = import.meta.env.VITE_LOG_LEVEL || 'error';
    this.logLevel = envLevel as LogLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };

    if (data instanceof Error) {
      entry.stack = data.stack;
    }

    this.addLog(entry);

    if (this.shouldLog(level)) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      
      if (import.meta.env.DEV) {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '');
      } else {
        // In production, only log errors and critical warnings
        if (level === 'error' || level === 'warn') {
          console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
        }
      }
    }
  }

  debug(message: string, data?: any): void {
    this.formatMessage('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.formatMessage('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.formatMessage('warn', message, data);
  }

  error(message: string, error?: any): void {
    this.formatMessage('error', message, error);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
export default logger;