/**
 * Debug utilities
 * 
 * Provides centralized logging functionality with namespaces and conditional compilation.
 */

/**
 * Create a debug logger for a specific namespace
 * @param namespace Name of the component or system
 * @returns Logger function
 */
export function createLogger(namespace: string) {
  return (message: string, data?: unknown) => {
    // Only log in development or if debug is explicitly enabled
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_ENABLED === 'true') {
      const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
      
      // Log with timestamp, namespace, and message
      console.log(`[${timestamp}] [${namespace}] ${message}`);
      
      // Log data if provided
      if (data !== undefined) {
        console.log(data);
      }
    }
  };
}

/**
 * Types of logs for different severity levels
 */
export type LoggerFunctions = {
  log: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
};

/**
 * Create a comprehensive logger with different log levels
 * @param namespace Name of the component or system
 * @returns Object with different log level functions
 */
export function createDetailedLogger(namespace: string): LoggerFunctions {
  return {
    log: (message: string, data?: unknown) => 
      createLogger(`${namespace}`)(message, data),
    warn: (message: string, data?: unknown) => 
      process.env.NODE_ENV !== 'production' && console.warn(`[${namespace}] ${message}`, data),
    error: (message: string, data?: unknown) => 
      console.error(`[${namespace}] ${message}`, data),
    info: (message: string, data?: unknown) => 
      process.env.NODE_ENV !== 'production' && console.info(`[${namespace}] ${message}`, data),
    debug: (message: string, data?: unknown) => 
      process.env.NODE_ENV !== 'production' && 
      (process.env.DEBUG_LEVEL === 'verbose' || process.env.DEBUG_ENABLED === 'true') && 
      console.debug(`[${namespace}] ${message}`, data)
  };
}
