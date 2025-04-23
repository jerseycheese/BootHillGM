/**
 * Lore Types System
 * 
 * This file defines the type interfaces for the lore management system,
 * which tracks and maintains world facts and lore details.
 */

import { ActionTypes } from '../actionTypes';

/**
 * Categories for organizing lore facts
 */
export type LoreCategory = 
  | 'character'    // Information about NPCs and PCs
  | 'location'     // Places, landmarks, regions
  | 'history'      // Past events of significance
  | 'item'         // Notable objects and artifacts
  | 'concept';     // Abstract ideas, rules, customs

/**
 * Lore fact with metadata
 */
export interface LoreFact {
  id: string;                     // Unique identifier
  content: string;                // The actual factual statement
  category: LoreCategory;         // Categorical classification
  createdAt: number;              // Timestamp of creation
  updatedAt: number;              // Timestamp of last update
  sourceId?: string;              // Original source (journal entry, AI response)
  confidence: number;             // Confidence score (1-10)
  importance: number;             // Importance score (1-10)
  version: number;                // Version number
  isValid: boolean;               // Validation status
  relatedFactIds: string[];       // Related facts by ID
  tags: string[];                 // Searchable tags
}

/**
 * The lore store structure
 */
export interface LoreStore {
  facts: Record<string, LoreFact>;             // All facts by ID
  categorizedFacts: Record<LoreCategory, string[]>; // Fact IDs by category
  factsByTag: Record<string, string[]>;        // Fact IDs by tag
  factVersions: Record<string, LoreFact[]>;    // Version history by fact ID
  latestUpdate: number;                        // Timestamp of last update
}

/**
 * Lore extraction result from AI
 */
export interface LoreExtractionResult {
  newFacts: Array<{
    content: string;
    category: LoreCategory;
    importance?: number;
    confidence?: number;
    relatedFactIds?: string[];
    tags?: string[];
  }>;
  updatedFacts?: Array<{
    id: string;
    content: string;
    importance?: number;
    confidence?: number;
  }>;
}

/**
 * Lore actions using standardized ActionTypes
 */
export type LoreAction = 
  | { type: typeof ActionTypes.ADD_LORE_FACT; payload: Omit<LoreFact, 'id' | 'createdAt' | 'updatedAt' | 'version'> }
  | { type: typeof ActionTypes.UPDATE_LORE_FACT; payload: { id: string; updates: Partial<LoreFact> } }
  | { type: typeof ActionTypes.INVALIDATE_LORE_FACT; payload: string }
  | { type: typeof ActionTypes.VALIDATE_LORE_FACT; payload: string }
  | { type: typeof ActionTypes.ADD_RELATED_FACTS; payload: { factId: string; relatedIds: string[] } }
  | { type: typeof ActionTypes.REMOVE_RELATED_FACTS; payload: { factId: string; relatedIds: string[] } }
  | { type: typeof ActionTypes.ADD_FACT_TAGS; payload: { factId: string; tags: string[] } }
  | { type: typeof ActionTypes.REMOVE_FACT_TAGS; payload: { factId: string; tags: string[] } }
  | { type: typeof ActionTypes.PROCESS_LORE_EXTRACTION; payload: LoreExtractionResult };

/**
 * Initial lore state
 */
export const initialLoreState: LoreStore = {
  facts: { /* Intentionally empty */ },
  categorizedFacts: {
    character: [],
    location: [],
    history: [],
    item: [],
    concept: []
  },
  factsByTag: { /* Intentionally empty */ },
  factVersions: { /* Intentionally empty */ },
  latestUpdate: 0
};

/**
 * Type guard for LoreFact
 */
export function isLoreFact(obj: unknown): obj is LoreFact {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).content === 'string' &&
    typeof (obj as Record<string, unknown>).category === 'string' &&
    typeof (obj as Record<string, unknown>).createdAt === 'number' &&
    typeof (obj as Record<string, unknown>).updatedAt === 'number' &&
    typeof (obj as Record<string, unknown>).confidence === 'number' &&
    typeof (obj as Record<string, unknown>).importance === 'number' &&
    typeof (obj as Record<string, unknown>).version === 'number' &&
    typeof (obj as Record<string, unknown>).isValid === 'boolean' &&
    Array.isArray((obj as Record<string, unknown>).relatedFactIds) &&
    Array.isArray((obj as Record<string, unknown>).tags)
  );
}

/**
 * Type guard for LoreCategory
 */
export function isValidLoreCategory(category: unknown): category is LoreCategory {
  return (
    typeof category === 'string' &&
    ['character', 'location', 'history', 'item', 'concept'].includes(category)
  );
}
