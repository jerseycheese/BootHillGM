/**
 * Initialization Diagnostics
 * 
 * Utilities for diagnosing and repairing state inconsistencies during initialization and reset.
 * Helps ensure proper character persistence and state structure after reset operations.
 * 
 * This module provides:
 * - Diagnostic logging utilities
 * - State snapshot capture
 * - State consistency validation
 * - Automated state repair functionality
 */

export * from './types';
export * from './logging';
export * from './snapshots';
export * from './validation';
export * from './repair';

// Export a default object for import convenience
import { captureStateSnapshot } from './snapshots';
import { validateStateConsistency } from './validation';
import { repairStateConsistency } from './repair';
import { logDiagnostic } from './logging';

/**
 * Consolidated diagnostics utility object
 * Provides convenient access to all diagnostic functions
 * through a single import.
 */
const diagnosticsUtil = {
  captureStateSnapshot,
  validateStateConsistency,
  repairStateConsistency,
  logDiagnostic
};

export default diagnosticsUtil;