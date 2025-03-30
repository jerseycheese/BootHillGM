/**
 * Debug utilities for tracking and logging operations
 */

import { 
  inspectLoreStore, 
  getLoreStats, 
  findContradictions, 
  visualizeLoreRelations 
} from './loreDebug';
import { LoreStore, LoreCategory } from '../types/narrative/lore.types';

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
  private loreDebugEnabled: boolean = false;

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

  setLoreDebugEnabled(enabled: boolean) {
    this.loreDebugEnabled = enabled;
  }

  isLoreDebugEnabled(): boolean {
    return this.loreDebugEnabled;
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

// Create a logger for lore debugging
export const loreLogger = createLogger('lore');

/**
 * Debug lore store with various inspection tools
 * 
 * @param loreStore - The lore store to inspect
 * @param command - Command name to execute
 * @param options - Command options
 * @returns Result of the debug operation, or null if not enabled
 */
export function debugLore(
  loreStore: LoreStore,
  command: string,
  options: Record<string, unknown> = {}
): unknown {
  // Only run if lore debugging is enabled
  if (!debugTracker.isLoreDebugEnabled()) {
    loreLogger.warn('Lore debugging is disabled. Enable with enableLoreDebugging()');
    return null;
  }

  try {
    switch (command) {
      case 'inspect':
        return inspectLoreStore(loreStore, {
          factId: options.factId as string,
          category: options.category as LoreCategory,
          tag: options.tag as string,
          sortBy: options.sortBy as 'importance' | 'confidence' | 'recency',
          includeInvalid: options.includeInvalid as boolean
        });

      case 'stats':
        return getLoreStats(loreStore);

      case 'contradictions':
        return findContradictions(loreStore, {
          tags: options.tags as string[],
          categories: options.categories as LoreCategory[],
          minConfidence: options.minConfidence as number
        });

      case 'visualize':
        return visualizeLoreRelations(loreStore, {
          highlightContradictions: options.highlightContradictions as boolean,
          categories: options.categories as LoreCategory[]
        });

      default:
        loreLogger.warn(`Unknown lore debug command: ${command}`);
        return null;
    }
  } catch (error) {
    loreLogger.error(`Error in lore debug command: ${command}`, error);
    return null;
  }
}

/**
 * Enable lore debugging
 */
export function enableLoreDebugging(): void {
  debugTracker.setLoreDebugEnabled(true);
  loreLogger.info('Lore debugging enabled');
}

/**
 * Disable lore debugging
 */
export function disableLoreDebugging(): void {
  debugTracker.setLoreDebugEnabled(false);
  loreLogger.info('Lore debugging disabled');
}
