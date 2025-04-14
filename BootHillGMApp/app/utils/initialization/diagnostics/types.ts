/**
 * Types for initialization diagnostics
 * 
 * This module defines the type system for game state diagnostics, validation,
 * and repair operations. These types ensure consistent data structures across
 * the diagnostics subsystem.
 */

import { Character } from '../../../types/character';

/**
 * Type for partial character with unknown properties
 * Allows for flexible character representation when reading from potentially
 * incomplete or corrupted storage.
 */
export interface PartialCharacter extends Partial<Character> {
  /** Additional properties that may exist but aren't defined in the Character type */
  [key: string]: unknown;
}

/**
 * Interface for key data in diagnostic snapshot
 * Captures the state and metadata of important localStorage keys
 */
export interface KeyDiagnosticData {
  /** Whether the key exists in localStorage */
  exists: boolean;
  
  /** Size of the value in characters/bytes */
  size: number;
  
  /** Character name if available in this key's data */
  characterName?: string;
  
  /** Whether there was an error parsing the JSON data */
  parseError?: boolean;
  
  /** Whether a character object was found in the data */
  hasCharacter?: boolean;
  
  /** Whether an inventory object was found in the data */
  hasInventory?: boolean;
  
  /** Number of items in the top-level inventory */
  inventoryCount?: number;
  
  /** Number of items in the character's inventory (may differ from top-level) */
  characterInventoryCount?: number;
}

/**
 * Interface for the state snapshot
 * Contains a complete diagnostic overview of the current game state
 */
export interface StateSnapshot {
  /** Timestamp when the snapshot was taken */
  timestamp: number;
  
  /** Total number of keys in localStorage */
  totalKeys: number;
  
  /** Detailed diagnostic data for important game state keys */
  gameStateKeys: Record<string, KeyDiagnosticData>;
}

/**
 * Interface for validation result
 * Contains the outcome of a state consistency validation operation
 */
export interface ValidationResult {
  /** Timestamp when validation was performed */
  timestamp: number;
  
  /** Whether the state is consistent across storage locations */
  isConsistent: boolean;
  
  /** List of specific issues found during validation */
  issues: string[];
  
  /** Error message if validation failed catastrophically */
  error?: string;
}

/**
 * Interface for repair result
 * Contains the outcome of a state repair operation
 */
export interface RepairResult {
  /** Timestamp when repair was performed */
  timestamp: number;
  
  /** Number of repair operations attempted */
  repairsAttempted: number;
  
  /** Number of repair operations that succeeded */
  repairsSucceeded: number;
  
  /** List of actions taken during repair */
  actions: string[];
  
  /** Error message if repair failed catastrophically */
  error?: string;
}