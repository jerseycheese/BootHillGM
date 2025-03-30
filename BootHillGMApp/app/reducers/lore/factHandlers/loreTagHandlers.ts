/**
 * Lore Tag Handlers
 * 
 * This file contains handlers for managing tags on lore facts.
 */

import {
  LoreAction,
  LoreStore,
  LoreFact
} from '../../../types/narrative/lore.types';

import {
  addFactToTags,
  removeFactFromTags,
  updateFactVersionHistory,
  updateFactInStore,
  createUpdatedState
} from '../loreReducerUtils';

/**
 * Handle ADD_FACT_TAGS action
 */
export function handleAddFactTags(
  state: LoreStore,
  action: Extract<LoreAction, { type: 'ADD_FACT_TAGS' }>,
  timestamp: number
): LoreStore {
  const { factId, tags } = action.payload;
  const existingFact = state.facts[factId];

  // If fact doesn't exist, return state unchanged
  if (!existingFact) {
    return state;
  }

  // Create a set of unique tags
  const uniqueTags = Array.from(new Set([...existingFact.tags, ...tags]));

  // Create the updated fact
  const updatedFact: LoreFact = {
    ...existingFact,
    tags: uniqueTags,
    updatedAt: timestamp,
    version: existingFact.version + 1
  };

  // Update tag indexes
  const factsByTag = addFactToTags(state, factId, tags);

  // Update version history
  const factVersions = updateFactVersionHistory(state, factId, updatedFact);

  return createUpdatedState(
    state,
    {
      facts: updateFactInStore(state, factId, updatedFact),
      factsByTag,
      factVersions
    },
    timestamp
  );
}

/**
 * Handle REMOVE_FACT_TAGS action
 */
export function handleRemoveFactTags(
  state: LoreStore,
  action: Extract<LoreAction, { type: 'REMOVE_FACT_TAGS' }>,
  timestamp: number
): LoreStore {
  const { factId, tags } = action.payload;
  const existingFact = state.facts[factId];

  // If fact doesn't exist, return state unchanged
  if (!existingFact) {
    return state;
  }

  // Filter out the tags to remove
  const updatedTags = existingFact.tags.filter(tag => !tags.includes(tag));

  // Create the updated fact
  const updatedFact: LoreFact = {
    ...existingFact,
    tags: updatedTags,
    updatedAt: timestamp,
    version: existingFact.version + 1
  };

  // Update tag indexes
  const factsByTag = removeFactFromTags(state, factId, tags);

  // Update version history
  const factVersions = updateFactVersionHistory(state, factId, updatedFact);

  return createUpdatedState(
    state,
    {
      facts: updateFactInStore(state, factId, updatedFact),
      factsByTag,
      factVersions
    },
    timestamp
  );
}