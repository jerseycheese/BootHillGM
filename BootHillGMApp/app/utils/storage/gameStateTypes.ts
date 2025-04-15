/**
 * GameStateTypes.ts
 * 
 * Type definitions related to game state storage and initialization.
 * Contains interfaces and types used by the gameStateStorage system.
 * 
 * @module GameStateTypes
 */

/**
 * Interface for narrative entry with optional title.
 * Used when initializing a new game with saved narrative.
 * 
 * @property content - The narrative content text
 * @property title - Optional title for the narrative entry
 */
export interface NarrativeEntry {
  content: string;
  title?: string;
}

/**
 * Namespace for gameStateTypes exports.
 * Provides type-safe access to the interfaces defined in this module.
 */
export const gameStateTypes = {
  // Type reference for use with the interface
  NarrativeEntry: {} as NarrativeEntry
};