/**
 * Initialization Diagnostics
 * 
 * Utilities for diagnosing and repairing state inconsistencies during initialization and reset.
 * Helps ensure proper character persistence and state structure after reset operations.
 * 
 * This module re-exports functionality from the diagnostics directory for backward compatibility.
 * New code should import directly from the diagnostics modules.
 */

// Re-export all diagnostics modules from initialization directory
import diagnosticsUtil from './initialization/diagnostics';

// Re-export all named exports
export * from './initialization/diagnostics';

// Export default object for import convenience
export default diagnosticsUtil;