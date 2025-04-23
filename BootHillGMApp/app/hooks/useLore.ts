/**
 * useLore Hook
 * 
 * This hook provides components with access to lore functionality.
 */

import { useCallback } from 'react';
import { useNarrative } from '../hooks/narrative/NarrativeProvider';
import { 
  LoreFact, 
  LoreCategory, 
  LoreExtractionResult,
  initialLoreState
} from '../types/narrative/lore.types';
import {
  addLoreFact,
  updateLoreFact,
  invalidateLoreFact,
  validateLoreFact,
  addRelatedFacts,
  removeRelatedFacts,
  addFactTags,
  removeFactTags,
  processLoreExtraction
} from '../actions/loreActions';

/**
 * Hook for accessing and manipulating lore data
 * 
 * @returns Object with lore state and operations
 */
export function useLore() {
  const { state, dispatch } = useNarrative();
  // Update to access lore directly from state
  const loreStore = state.lore || initialLoreState;

  /**
   * Add a new lore fact
   */
  const addFact = useCallback((fact: Omit<LoreFact, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    dispatch(addLoreFact(fact));
  }, [dispatch]);

  /**
   * Update an existing lore fact
   */
  const updateFact = useCallback((id: string, updates: Partial<LoreFact>) => {
    dispatch(updateLoreFact(id, updates));
  }, [dispatch]);

  /**
   * Mark a fact as invalid
   */
  const invalidateFact = useCallback((id: string) => {
    dispatch(invalidateLoreFact(id));
  }, [dispatch]);

  /**
   * Mark a fact as valid
   */
  const validateFact = useCallback((id: string) => {
    dispatch(validateLoreFact(id));
  }, [dispatch]);

  /**
   * Add related facts to a fact
   */
  const addFactRelatedFacts = useCallback((factId: string, relatedIds: string[]) => {
    dispatch(addRelatedFacts(factId, relatedIds));
  }, [dispatch]);

  /**
   * Remove related facts from a fact
   */
  const removeFactRelatedFacts = useCallback((factId: string, relatedIds: string[]) => {
    dispatch(removeRelatedFacts(factId, relatedIds));
  }, [dispatch]);

  /**
   * Add tags to a fact
   */
  const addTagsToFact = useCallback((factId: string, tags: string[]) => {
    dispatch(addFactTags(factId, tags));
  }, [dispatch]);

  /**
   * Remove tags from a fact
   */
  const removeTagsFromFact = useCallback((factId: string, tags: string[]) => {
    dispatch(removeFactTags(factId, tags));
  }, [dispatch]);

  /**
   * Process lore extraction result from AI
   */
  const processExtraction = useCallback((extraction: LoreExtractionResult) => {
    dispatch(processLoreExtraction(extraction));
  }, [dispatch]);

  /**
   * Get facts by category
   */
  const getFactsByCategory = useCallback((category: LoreCategory) => {
    const factIds = loreStore.categorizedFacts[category] || [];
    return factIds.map(id => loreStore.facts[id]).filter(Boolean);
  }, [loreStore]);

  /**
   * Get facts by tag
   */
  const getFactsByTag = useCallback((tag: string) => {
    const factIds = loreStore.factsByTag[tag] || [];
    return factIds.map(id => loreStore.facts[id]).filter(Boolean);
  }, [loreStore]);

  /**
   * Get related facts
   */
  const getRelatedFacts = useCallback((id: string) => {
    const fact = loreStore.facts[id];
    if (!fact) return [];

    return fact.relatedFactIds
      .map((relatedId: string) => loreStore.facts[relatedId])
      .filter(Boolean);
  }, [loreStore]);

  /**
   * Get all facts sorted by importance
   */
  const getAllFactsSortedByImportance = useCallback((includeInvalid: boolean = false) => {
    return Object.values(loreStore.facts)
      .filter((fact: LoreFact) => includeInvalid || fact.isValid)
      .sort((a: LoreFact, b: LoreFact) => b.importance - a.importance);
  }, [loreStore]);

  return {
    loreStore,
    addFact,
    updateFact,
    invalidateFact,
    validateFact,
    addRelatedFacts: addFactRelatedFacts,
    removeRelatedFacts: removeFactRelatedFacts,
    addFactTags: addTagsToFact,
    removeFactTags: removeTagsFromFact,
    processLoreExtraction: processExtraction,
    getFactsByCategory,
    getFactsByTag,
    getRelatedFacts,
    getAllFactsSortedByImportance
  };
}
