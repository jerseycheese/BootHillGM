/**
 * Lore Validity Handlers
 * 
 * This file contains handlers for managing lore fact validity status.
 */

import {
  LoreAction,
  LoreStore,
  LoreFact
} from '../../../types/narrative/lore.types';

import {
  updateFactVersionHistory,
  updateFactInStore,
  createUpdatedState
} from '../loreReducerUtils';

/**
 * Handle INVALIDATE_LORE_FACT action
 */
export function handleInvalidateLoreFact(
  state: LoreStore,
  action: Extract<LoreAction, { type: 'INVALIDATE_LORE_FACT' }>,
  timestamp: number
): LoreStore {
  const factId = action.payload;
  const existingFact = state.facts[factId];

  // If fact doesn't exist, return state unchanged
  if (!existingFact) {
    return state;
  }

  // Create the updated fact with isValid set to false
  const updatedFact: LoreFact = {
    ...existingFact,
    isValid: false,
    updatedAt: timestamp,
    version: existingFact.version + 1
  };

  // Update version history
  const factVersions = updateFactVersionHistory(state, factId, updatedFact);

  return createUpdatedState(
    state,
    {
      facts: updateFactInStore(state, factId, updatedFact),
      factVersions
    },
    timestamp
  );
}

/**
 * Handle VALIDATE_LORE_FACT action
 */
export function handleValidateLoreFact(
  state: LoreStore,
  action: Extract<LoreAction, { type: 'VALIDATE_LORE_FACT' }>,
  timestamp: number
): LoreStore {
  const factId = action.payload;
  const existingFact = state.facts[factId];

  // If fact doesn't exist, return state unchanged
  if (!existingFact) {
    return state;
  }

  // Create the updated fact with isValid set to true
  const updatedFact: LoreFact = {
    ...existingFact,
    isValid: true,
    updatedAt: timestamp,
    version: existingFact.version + 1
  };

  // Update version history
  const factVersions = updateFactVersionHistory(state, factId, updatedFact);

  return createUpdatedState(
    state,
    {
      facts: updateFactInStore(state, factId, updatedFact),
      factVersions
    },
    timestamp
  );
}