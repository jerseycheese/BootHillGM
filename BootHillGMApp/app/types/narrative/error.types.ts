/**
 * Narrative Error Types
 * 
 * This file defines types related to errors in the narrative system.
 */

/**
 * Types of errors that can occur in narrative operations
 */
export type NarrativeErrorType =
  | 'invalid_navigation'       // Invalid story point 
  | 'invalid_choice'           // Invalid choice selection
  | 'arc_not_found'            // Narrative arc not found
  | 'branch_not_found'         // Narrative branch not found
  | 'decision_not_found'       // Player decision not found
  | 'decision_mismatch'        // Decision ID mismatch
  | 'validation_failed'        // General validation failure
  | 'state_corruption'         // Corrupted state
  | 'system_error';            // System-level error

/**
 * Error information for narrative operations
 */
export interface NarrativeErrorInfo {
  code: NarrativeErrorType;
  message: string;
  context?: Record<string, unknown>;  // Changed from 'any' to 'unknown'
  timestamp: number;
}