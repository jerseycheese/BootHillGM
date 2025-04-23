/**
 * Lore Relation Handlers
 * 
 * This file contains handlers for managing relationships between lore facts.
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
interface AddRelatedFactsPayload {
  factId: string;
  relatedIds: string[];
}

type AddRelatedFactsAction = {
  type: typeof ActionTypes.ADD_RELATED_FACTS;
  payload: AddRelatedFactsPayload;
} & Omit<LoreAction, 'type' | 'payload'>;

interface RemoveRelatedFactsPayload {
  factId: string;
  relatedIds: string[];
}

type RemoveRelatedFactsAction = {
  type: typeof ActionTypes.REMOVE_RELATED_FACTS;
  payload: RemoveRelatedFactsPayload;
} & Omit<LoreAction, 'type' | 'payload'>;


/**
 * Handle ADD_RELATED_FACTS action
 */
export function handleAddRelatedFacts(
  state: LoreStore,
  action: LoreAction, // Use base LoreAction type
  timestamp: number
): LoreStore {
  // Type guard
  if (action.type !== ActionTypes.ADD_RELATED_FACTS) {
    return state;
  }
  // Use type assertion after guard
  const { factId, relatedIds } = (action as AddRelatedFactsAction).payload;
  const existingFact = state.facts[factId];

  // If fact doesn't exist, return state unchanged
  if (!existingFact) {
    return state;
  }

  // Create a set of unique related IDs
  const uniqueRelatedIds = Array.from(
    new Set([...existingFact.relatedFactIds, ...relatedIds])
  );

  // Create the updated fact
  const updatedFact: LoreFact = {
    ...existingFact,
    relatedFactIds: uniqueRelatedIds,
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
 * Handle REMOVE_RELATED_FACTS action
 */
export function handleRemoveRelatedFacts(
  state: LoreStore,
  action: LoreAction, // Use base LoreAction type
  timestamp: number
): LoreStore {
   // Type guard
  if (action.type !== ActionTypes.REMOVE_RELATED_FACTS) {
    return state;
  }
  // Use type assertion after guard
  const { factId, relatedIds } = (action as RemoveRelatedFactsAction).payload;
  const existingFact = state.facts[factId];

  // If fact doesn't exist, return state unchanged
  if (!existingFact) {
    return state;
  }

  // Filter out the IDs to remove
  const updatedRelatedIds = existingFact.relatedFactIds.filter(
    id => !relatedIds.includes(id)
  );

  // Create the updated fact
  const updatedFact: LoreFact = {
    ...existingFact,
    relatedFactIds: updatedRelatedIds,
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