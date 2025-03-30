/**
 * Lore Reducer
 * 
 * This file contains the reducer function for handling lore state updates.
 * It follows the Redux pattern used throughout the application.
 * 
 * Implementation is split across multiple files for better maintainability:
 * - loreReducer.ts: Main entry point with action routing
 * - lore/loreReducerUtils.ts: Utility functions
 * - lore/loreReducerHandlers.ts: Individual action handlers
 */

import {
  LoreAction,
  LoreStore,
  initialLoreState
} from '../types/narrative/lore.types';

import {
  handleAddLoreFact,
  handleUpdateLoreFact,
  handleInvalidateLoreFact,
  handleValidateLoreFact,
  handleAddRelatedFacts,
  handleRemoveRelatedFacts,
  handleAddFactTags,
  handleRemoveFactTags,
  handleProcessLoreExtraction
} from './lore/loreReducerHandlers';

/**
 * Reducer function to handle lore-related state updates.
 * @param {LoreStore} state - The current lore state.
 * @param {LoreAction} action - The action to be processed.
 * @returns {LoreStore} The updated lore state.
 */
export function loreReducer(
  state: LoreStore = initialLoreState,
  action: LoreAction
): LoreStore {
  const timestamp = Date.now();

  switch (action.type) {
    case 'ADD_LORE_FACT':
      return handleAddLoreFact(state, action, timestamp);

    case 'UPDATE_LORE_FACT':
      return handleUpdateLoreFact(state, action, timestamp);

    case 'INVALIDATE_LORE_FACT':
      return handleInvalidateLoreFact(state, action, timestamp);

    case 'VALIDATE_LORE_FACT':
      return handleValidateLoreFact(state, action, timestamp);

    case 'ADD_RELATED_FACTS':
      return handleAddRelatedFacts(state, action, timestamp);

    case 'REMOVE_RELATED_FACTS':
      return handleRemoveRelatedFacts(state, action, timestamp);

    case 'ADD_FACT_TAGS':
      return handleAddFactTags(state, action, timestamp);

    case 'REMOVE_FACT_TAGS':
      return handleRemoveFactTags(state, action, timestamp);

    case 'PROCESS_LORE_EXTRACTION':
      // This action needs to call back into the reducer
      return handleProcessLoreExtraction(state, action, loreReducer);

    default:
      return state;
  }
}
