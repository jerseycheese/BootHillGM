/**
 * Diagnostic logging utilities
 * 
 * This module provides functions for logging diagnostic information
 * during game initialization and operation. Logs are stored in localStorage
 * for later analysis and debugging.
 */

/**
 * Logs diagnostic information during game operations
 * Stores diagnostic entries in localStorage with timestamp and category
 * for later analysis. Maintains a rolling history of recent entries.
 * 
 * @param category Diagnostic category (e.g., 'initialization', 'repair', 'validation')
 * @param message Diagnostic message describing the event or issue
 * @param data Optional structured data related to the diagnostic event
 * @returns void
 */
export const logDiagnostic = (category: string, message: string, data?: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  
  const timestamp = new Date().toISOString();
  
  // Store in diagnostics history if needed
  try {
    const diagHistory = JSON.parse(localStorage.getItem('diagnostic-history') || '[]');
    diagHistory.push({
      category,
      timestamp,
      message,
      data
    });
    
    // Keep only the last 100 entries
    if (diagHistory.length > 100) {
      diagHistory.shift();
    }
    
    localStorage.setItem('diagnostic-history', JSON.stringify(diagHistory));
  } catch {
    // Silently fail if storage is unavailable
  }
};