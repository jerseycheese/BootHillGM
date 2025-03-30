/**
 * Additional type definitions for narrative context building
 * 
 * These types supplement the main context.types.ts definitions
 * with specialized internal types needed by the context builder.
 */

import { ContextElementType, ContextBlockType, ScoredContextElement } from '../../types/narrative/context.types';

/**
 * Type for token allocation percentages across different context sections
 * Used for budgeting available tokens in the context
 */
export interface TokenAllocation {
  /** Percentage of tokens allocated to narrative history (0-100) */
  narrativeHistory?: number;
  /** Percentage of tokens allocated to decision history (0-100) */
  decisionHistory?: number;
  /** Percentage of tokens allocated to world state (0-100) */
  worldState?: number;
  /** Percentage of tokens allocated to character relationships (0-100) */
  relationships?: number;
  /** Percentage of tokens allocated to story context (0-100) */
  storyContext?: number;
  /** Percentage of tokens allocated to lore (0-100) */
  lore?: number;
}

/**
 * Type for organizing context elements by their block type
 * Used during token allocation process
 */
export interface BlockGroups {
  /** Map of block type to array of context elements */
  [key: string]: ScoredContextElement[];
}

/**
 * Type for block metadata information
 * Used to store additional information about context blocks
 */
export interface BlockMetadata {
  /** Number of elements in the block */
  elements: number;
  /** Character associated with the block, if any */
  character?: string;
  /** Location associated with the block, if any */
  location?: string;
  /** Additional metadata properties */
  [key: string]: unknown;
}

/**
 * Mapping from element types to block types
 * Used to convert element types to their appropriate block categories
 */
export const contextTypeMapping: Record<ContextElementType, ContextBlockType> = {
  'narrative': 'narrative_history',
  'decision': 'decision',
  'character': 'character',
  'location': 'location',
  'event': 'narrative_history',
  'world_state': 'world_state',
  'story_point': 'story_progression',
  'lore': 'lore' // Add lore mapping
};

/**
 * Section titles for different block types
 * Used when formatting context sections with appropriate headers
 */
export const blockSectionTitles: Record<ContextBlockType, string> = {
  'narrative_history': 'Narrative History',
  'decision': 'Decisions',
  'character': 'Character Relationships',
  'location': 'Locations',
  'world_state': 'World State',
  'story_progression': 'Story Progression',
  'instruction': 'Instructions',
  'lore': 'Established World Facts' // Add lore title
};