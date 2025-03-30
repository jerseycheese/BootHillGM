/**
 * Lore Reducer Utilities
 * 
 * This file contains utility functions used by the lore reducer handlers.
 */

import {
  LoreStore,
  LoreFact,
  isValidLoreCategory
} from '../../types/narrative/lore.types';

/**
 * Generate a unique ID for a lore fact
 */
export function generateFactId(): string {
  return `fact-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Helper function to add a fact ID to category index
 */
export function addFactToCategory(
  state: LoreStore,
  factId: string,
  category: string
): Record<string, string[]> {
  if (!isValidLoreCategory(category)) {
    category = 'concept'; // Default to concept for invalid categories
  }

  return {
    ...state.categorizedFacts,
    [category]: [...state.categorizedFacts[category as keyof typeof state.categorizedFacts], factId]
  };
}

/**
 * Helper function to remove a fact ID from category index
 */
export function removeFactFromCategory(
  state: LoreStore,
  factId: string,
  category: string
): Record<string, string[]> {
  if (!isValidLoreCategory(category)) {
    return state.categorizedFacts;
  }

  return {
    ...state.categorizedFacts,
    [category]: state.categorizedFacts[category as keyof typeof state.categorizedFacts]
      .filter(id => id !== factId)
  };
}

/**
 * Helper function to add a fact ID to tag indexes
 */
export function addFactToTags(
  state: LoreStore,
  factId: string,
  tags: string[]
): Record<string, string[]> {
  const updatedFactsByTag = { ...state.factsByTag };

  tags.forEach(tag => {
    if (!updatedFactsByTag[tag]) {
      updatedFactsByTag[tag] = [];
    }
    
    if (!updatedFactsByTag[tag].includes(factId)) {
      updatedFactsByTag[tag] = [...updatedFactsByTag[tag], factId];
    }
  });

  return updatedFactsByTag;
}

/**
 * Helper function to remove a fact ID from tag indexes
 */
export function removeFactFromTags(
  state: LoreStore,
  factId: string,
  tags: string[]
): Record<string, string[]> {
  const updatedFactsByTag = { ...state.factsByTag };

  tags.forEach(tag => {
    if (updatedFactsByTag[tag]) {
      updatedFactsByTag[tag] = updatedFactsByTag[tag].filter(id => id !== factId);
      
      // Remove tag if empty
      if (updatedFactsByTag[tag].length === 0) {
        delete updatedFactsByTag[tag];
      }
    }
  });

  return updatedFactsByTag;
}

/**
 * Helper function to update a fact's version history
 */
export function updateFactVersionHistory(
  state: LoreStore,
  factId: string,
  updatedFact: LoreFact
): Record<string, LoreFact[]> {
  return {
    ...state.factVersions,
    [factId]: [...(state.factVersions[factId] || []), updatedFact]
  };
}

/**
 * Helper function to update a fact in the store
 */
export function updateFactInStore(
  state: LoreStore,
  factId: string,
  updatedFact: LoreFact
): Record<string, LoreFact> {
  return {
    ...state.facts,
    [factId]: updatedFact
  };
}

/**
 * Create a standard updated state object with all fields set
 */
export function createUpdatedState(
  state: LoreStore,
  updates: Partial<LoreStore>,
  timestamp: number
): LoreStore {
  return {
    ...state,
    ...updates,
    latestUpdate: timestamp
  };
}
