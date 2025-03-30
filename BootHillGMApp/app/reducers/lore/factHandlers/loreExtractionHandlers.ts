/**
 * Lore Extraction Handlers
 * 
 * This file contains handlers for processing lore extraction from AI responses.
 */

import {
  LoreAction,
  LoreStore
} from '../../../types/narrative/lore.types';

/**
 * Handle PROCESS_LORE_EXTRACTION action
 */
export function handleProcessLoreExtraction(
  state: LoreStore,
  action: Extract<LoreAction, { type: 'PROCESS_LORE_EXTRACTION' }>,
  loreReducerFn: (state: LoreStore, action: LoreAction) => LoreStore
): LoreStore {
  const { newFacts, updatedFacts } = action.payload;
  let updatedState = { ...state };

  // Process new facts
  if (newFacts && newFacts.length > 0) {
    newFacts.forEach(factData => {
      // Create action to add the fact
      const addAction: LoreAction = {
        type: 'ADD_LORE_FACT',
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
    updatedFacts.forEach(factUpdate => {
      // Only proceed if the fact exists
      if (updatedState.facts[factUpdate.id]) {
        // Create action to update the fact
        const updateAction: LoreAction = {
          type: 'UPDATE_LORE_FACT',
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