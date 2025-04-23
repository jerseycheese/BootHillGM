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

import { ActionTypes } from '../../../types/actionTypes'; // Import ActionTypes
import {
  updateFactVersionHistory,
  updateFactInStore,
  createUpdatedState
} from '../loreReducerUtils';

// Define payload and action types locally
type InvalidateLoreFactPayload = string; // Payload is just the factId

type InvalidateLoreFactAction = {
  type: typeof ActionTypes.INVALIDATE_LORE_FACT;
  payload: InvalidateLoreFactPayload;
} & Omit<LoreAction, 'type' | 'payload'>;

type ValidateLoreFactPayload = string; // Payload is just the factId

type ValidateLoreFactAction = {
  type: typeof ActionTypes.VALIDATE_LORE_FACT;
  payload: ValidateLoreFactPayload;
} & Omit<LoreAction, 'type' | 'payload'>;


/**
 * Handle INVALIDATE_LORE_FACT action
 */
export function handleInvalidateLoreFact(
  state: LoreStore,
  action: LoreAction, // Use base LoreAction type
  timestamp: number
): LoreStore {
  // Type guard
  if (action.type !== ActionTypes.INVALIDATE_LORE_FACT) {
    return state;
  }
  // Use type assertion after guard
  const factId = (action as InvalidateLoreFactAction).payload;
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
  action: LoreAction, // Use base LoreAction type
  timestamp: number
): LoreStore {
  // Type guard
  if (action.type !== ActionTypes.VALIDATE_LORE_FACT) {
    return state;
  }
  // Use type assertion after guard
  const factId = (action as ValidateLoreFactAction).payload;
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