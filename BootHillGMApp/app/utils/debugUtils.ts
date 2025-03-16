/**
 * Debug utilities for tracking and logging operations
 */

// Original text cleaning debug interface
interface TextCleaningDebugEntry {
  originalText: string;
  cleanedText: string;
  source: string;
  cleaningFunction: string;
  timestamp: number;
}

/**
 * Singleton class for tracking text cleaning operations
 */
class DebugTracker {
  private static instance: DebugTracker;
  private entries: TextCleaningDebugEntry[] = [];

  private constructor() {}

  static getInstance(): DebugTracker {
    if (!DebugTracker.instance) {
      DebugTracker.instance = new DebugTracker();
    }
    return DebugTracker.instance;
  }

  addEntry(entry: TextCleaningDebugEntry) {
    this.entries.push(entry);
  }

  getEntries(): TextCleaningDebugEntry[] {
    return [...this.entries];
  }

  clear() {
    this.entries = [];
  }
}

export const debugTracker = DebugTracker.getInstance();

/**
 * Track text cleaning operations for debugging
 */
export const trackTextCleaning = (
  originalText: string,
  cleanedText: string,
  source: string,
  cleaningFunction: string
) => {
  debugTracker.addEntry({
    originalText,
    cleanedText,
    source,
    cleaningFunction,
    timestamp: Date.now()
  });
};

/**
 * Log levels for controlling verbosity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Get the current log level from environment or defaults
 */
const getCurrentLogLevel = (): LogLevel => {
  if (typeof process === 'undefined' || !process.env) {
    return LogLevel.WARN; // Default for client-side
  }
  
  if (process.env.NODE_ENV === 'production') {
    return LogLevel.ERROR; // Only show errors in production
  }
  
  const levelStr = process.env.DEBUG_LEVEL;
  
  switch (levelStr) {
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    case 'none': return LogLevel.NONE;
    default: return LogLevel.DEBUG; // Default for development
  }
};

/**
 * Logger interface for different log methods
 */
export interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

/**
 * Create a logger for a specific module or component
 * 
 * @param namespace - Module/component name for log identification
 * @returns Logger object with different severity methods
 */
export function createLogger(namespace: string): Logger {
  const logLevel = getCurrentLogLevel();
  
  const formatMessage = (level: string, message: string) => {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    return `[${timestamp}] [${level}] [${namespace}] ${message}`;
  };
  
  return {
    debug: (message: string, data?: unknown) => {
      if (logLevel <= LogLevel.DEBUG) {
        console.debug(formatMessage('DEBUG', message), data);
      }
    },
    
    info: (message: string, data?: unknown) => {
      if (logLevel <= LogLevel.INFO) {
        console.info(formatMessage('INFO', message), data);
      }
    },
    
    warn: (message: string, data?: unknown) => {
      if (logLevel <= LogLevel.WARN) {
        console.warn(formatMessage('WARN', message), data);
      }
    },
    
    error: (message: string, data?: unknown) => {
      if (logLevel <= LogLevel.ERROR) {
        console.error(formatMessage('ERROR', message), data);
      }
    }
  };
}
