/**
 * Lore Extraction Handlers
 * 
 * This file contains handlers for processing lore extraction from AI responses.
 */

import {
  LoreAction,
  LoreStore,
  LoreCategory // Import LoreCategory
} from '../../../types/narrative/lore.types';
import { ActionTypes } from '../../../types/actionTypes';

// Define payload structure locally if not exported from types
interface LoreFactData {
  content: string;
  category: LoreCategory; // Use LoreCategory type
  confidence?: number;
  importance?: number;
  relatedFactIds?: string[];
  tags?: string[];
}

interface LoreFactUpdate {
  id: string;
  content?: string; // Make content optional for updates
  confidence?: number;
  importance?: number;
  // Add other updatable fields as needed
}

interface ProcessLoreExtractionPayload {
  newFacts: LoreFactData[];
  updatedFacts: LoreFactUpdate[];
}

// Define the specific action type using Extract or as a type alias
// Using a type alias for clarity:
type ProcessLoreExtractionAction = {
  type: typeof ActionTypes.PROCESS_LORE_EXTRACTION;
  payload: ProcessLoreExtractionPayload;
} & Omit<LoreAction, 'type' | 'payload'>; // Combine with base properties if needed, excluding conflicting ones
// Alternatively, using Extract (simpler if LoreAction is a discriminated union):
// type ProcessLoreExtractionAction = Extract<LoreAction, { type: typeof ActionTypes.PROCESS_LORE_EXTRACTION }>;

/**
 * Handle PROCESS_LORE_EXTRACTION action
 */
export function handleProcessLoreExtraction(
  state: LoreStore,
  action: LoreAction,
  loreReducerFn: (state: LoreStore, action: LoreAction) => LoreStore
): LoreStore {
  if (action.type !== ActionTypes.PROCESS_LORE_EXTRACTION) {
    return state;
  }
  const { newFacts, updatedFacts } = (action as ProcessLoreExtractionAction).payload;
  let updatedState = { ...state };

  // Process new facts
  if (newFacts && newFacts.length > 0) {
    newFacts.forEach((factData: LoreFactData) => {
      // Create action to add the fact
      const addAction: LoreAction = {
        type: ActionTypes.ADD_LORE_FACT,
        payload: {
          content: factData.content,
          category: factData.category,
          confidence: factData.confidence ?? 5,
          importance: factData.importance ?? 5,
          relatedFactIds: factData.relatedFactIds ?? [],
          tags: factData.tags ?? [],
          isValid: true
        }
      };

      // Apply the action
      updatedState = loreReducerFn(updatedState, addAction);
    });
  }

  // Process updated facts
  if (updatedFacts && updatedFacts.length > 0) {
    updatedFacts.forEach((factUpdate: LoreFactUpdate) => {
      // Only proceed if the fact exists
      if (updatedState.facts[factUpdate.id]) {
        // Create action to update the fact
        const updateAction: LoreAction = {
          type: ActionTypes.UPDATE_LORE_FACT,
          payload: {
            id: factUpdate.id,
            updates: {
              content: factUpdate.content,
              confidence: factUpdate.confidence,
              importance: factUpdate.importance
            }
          }
        };

        // Apply the action
        updatedState = loreReducerFn(updatedState, updateAction);
      }
    });
  }

  return updatedState;
}