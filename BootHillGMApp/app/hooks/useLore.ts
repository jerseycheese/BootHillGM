/**
 * useLore Hook
 * 
 * This hook provides components with access to lore functionality.
 */

import { useCallback } from 'react';
import { useNarrative } from '../context/NarrativeContext';
import { 
  LoreFact, 
  LoreCategory, 
  LoreExtractionResult,
  initialLoreState
} from '../types/narrative/lore.types';

/**
 * Hook for accessing and manipulating lore data
 * 
 * @returns Object with lore state and operations
 */
export function useLore() {
  const { state, dispatch } = useNarrative();
  const loreStore = state.narrative?.lore || initialLoreState; // Access via narrative slice

  /**
   * Add a new lore fact
   */
  const addFact = useCallback((fact: Omit<LoreFact, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    dispatch({
      type: 'ADD_LORE_FACT',
      payload: fact
    });
  }, [dispatch]);

  /**
   * Update an existing lore fact
   */
  const updateFact = useCallback((id: string, updates: Partial<LoreFact>) => {
    dispatch({
      type: 'UPDATE_LORE_FACT',
      payload: { id, updates }
    });
  }, [dispatch]);

  /**
   * Mark a fact as invalid
   */
  const invalidateFact = useCallback((id: string) => {
    dispatch({
      type: 'INVALIDATE_LORE_FACT',
      payload: id
    });
  }, [dispatch]);

  /**
   * Mark a fact as valid
   */
  const validateFact = useCallback((id: string) => {
    dispatch({
      type: 'VALIDATE_LORE_FACT',
      payload: id
    });
  }, [dispatch]);

  /**
   * Add related facts to a fact
   */
  const addRelatedFacts = useCallback((factId: string, relatedIds: string[]) => {
    dispatch({
      type: 'ADD_RELATED_FACTS',
      payload: { factId, relatedIds }
    });
  }, [dispatch]);

  /**
   * Remove related facts from a fact
   */
  const removeRelatedFacts = useCallback((factId: string, relatedIds: string[]) => {
    dispatch({
      type: 'REMOVE_RELATED_FACTS',
      payload: { factId, relatedIds }
    });
  }, [dispatch]);

  /**
   * Add tags to a fact
   */
  const addFactTags = useCallback((factId: string, tags: string[]) => {
    dispatch({
      type: 'ADD_FACT_TAGS',
      payload: { factId, tags }
    });
  }, [dispatch]);

  /**
   * Remove tags from a fact
   */
  const removeFactTags = useCallback((factId: string, tags: string[]) => {
    dispatch({
      type: 'REMOVE_FACT_TAGS',
      payload: { factId, tags }
    });
  }, [dispatch]);

  /**
   * Process lore extraction result from AI
   */
  const processLoreExtraction = useCallback((extraction: LoreExtractionResult) => {
    dispatch({
      type: 'PROCESS_LORE_EXTRACTION',
      payload: extraction
    });
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
  const getRelatedFacts = useCallback((factId: string) => {
    const fact = loreStore.facts[factId];
    if (!fact) return [];

    return fact.relatedFactIds
      .map(id => loreStore.facts[id])
      .filter(Boolean);
  }, [loreStore]);

  /**
   * Get all facts sorted by importance
   */
  const getAllFactsSortedByImportance = useCallback((includeInvalid: boolean = false) => {
    return Object.values(loreStore.facts)
      .filter(fact => includeInvalid || fact.isValid)
      .sort((a, b) => b.importance - a.importance);
  }, [loreStore]);

  return {
    loreStore,
    addFact,
    updateFact,
    invalidateFact,
    validateFact,
    addRelatedFacts,
    removeRelatedFacts,
    addFactTags,
    removeFactTags,
    processLoreExtraction,
    getFactsByCategory,
    getFactsByTag,
    getRelatedFacts,
    getAllFactsSortedByImportance
  };
}
