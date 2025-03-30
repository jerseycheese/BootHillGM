/**
 * Lore Fact Handlers
 * 
 * This file contains handlers for adding and updating lore facts.
 */

import {
  LoreAction,
  LoreStore,
  LoreFact,
  isValidLoreCategory
} from '../../../types/narrative/lore.types';

import {
  generateFactId,
  addFactToCategory,
  removeFactFromCategory,
  addFactToTags,
  removeFactFromTags,
  updateFactVersionHistory,
  updateFactInStore,
  createUpdatedState
} from '../loreReducerUtils';

/**
 * Handle ADD_LORE_FACT action
 */
export function handleAddLoreFact(
  state: LoreStore,
  action: Extract<LoreAction, { type: 'ADD_LORE_FACT' }>,
  timestamp: number
): LoreStore {
  const factId = generateFactId();
  
  // Validate category and default to 'concept' if invalid
  const category = isValidLoreCategory(action.payload.category) 
    ? action.payload.category 
    : 'concept';
  
  const newFact: LoreFact = {
    id: factId,
    content: action.payload.content,
    category: category, // Use the validated/normalized category
    createdAt: timestamp,
    updatedAt: timestamp,
    confidence: action.payload.confidence ?? 5,
    importance: action.payload.importance ?? 5,
    version: 1,
    isValid: action.payload.isValid ?? true,
    relatedFactIds: action.payload.relatedFactIds ?? [],
    tags: action.payload.tags ?? [],
    sourceId: action.payload.sourceId
  };

  // Create version history
  const factVersions = updateFactVersionHistory(state, factId, newFact);

  // Add to category index
  const categorizedFacts = addFactToCategory(state, factId, newFact.category);

  // Add to tag indexes
  const factsByTag = addFactToTags(state, factId, newFact.tags);

  return createUpdatedState(
    state,
    {
      facts: updateFactInStore(state, factId, newFact),
      categorizedFacts,
      factsByTag,
      factVersions
    },
    timestamp
  );
}

/**
 * Handle UPDATE_LORE_FACT action
 */
export function handleUpdateLoreFact(
  state: LoreStore,
  action: Extract<LoreAction, { type: 'UPDATE_LORE_FACT' }>,
  timestamp: number
): LoreStore {
  const { id, updates } = action.payload;
  const existingFact = state.facts[id];

  // If fact doesn't exist, return state unchanged
  if (!existingFact) {
    return state;
  }
  
  // Validate category if it's being updated
  const validatedUpdates = {...updates};
  if (updates.category && !isValidLoreCategory(updates.category)) {
    validatedUpdates.category = 'concept';
  }

  // Create the updated fact
  const updatedFact: LoreFact = {
    ...existingFact,
    ...validatedUpdates,
    id, // Ensure ID doesn't change
    updatedAt: timestamp,
    version: existingFact.version + 1
  };

  // Update category index if category changed
  let categorizedFacts = state.categorizedFacts;
  if (validatedUpdates.category && validatedUpdates.category !== existingFact.category) {
    categorizedFacts = removeFactFromCategory(state, id, existingFact.category);
    categorizedFacts = addFactToCategory({ ...state, categorizedFacts }, id, validatedUpdates.category);
  }

  // Update tag indexes if tags changed
  let factsByTag = state.factsByTag;
  if (validatedUpdates.tags) {
    // Remove from old tags
    factsByTag = removeFactFromTags(state, id, existingFact.tags);
    // Add to new tags
    factsByTag = addFactToTags({ ...state, factsByTag }, id, validatedUpdates.tags);
  }

  // Update version history
  const factVersions = updateFactVersionHistory(state, id, updatedFact);

  return createUpdatedState(
    state,
    {
      facts: updateFactInStore(state, id, updatedFact),
      categorizedFacts,
      factsByTag,
      factVersions
    },
    timestamp
  );
}