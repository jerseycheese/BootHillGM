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

import {
  updateFactVersionHistory,
  updateFactInStore,
  createUpdatedState
} from '../loreReducerUtils';

/**
 * Handle ADD_RELATED_FACTS action
 */
export function handleAddRelatedFacts(
  state: LoreStore,
  action: Extract<LoreAction, { type: 'ADD_RELATED_FACTS' }>,
  timestamp: number
): LoreStore {
  const { factId, relatedIds } = action.payload;
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
  action: Extract<LoreAction, { type: 'REMOVE_RELATED_FACTS' }>,
  timestamp: number
): LoreStore {
  const { factId, relatedIds } = action.payload;
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