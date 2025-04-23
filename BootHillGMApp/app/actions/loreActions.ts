/**
 * Lore Action Creators
 * 
 * This file contains action creators for the lore system.
 */

import { 
  LoreAction, 
  LoreFact,
  LoreExtractionResult
} from '../types/narrative/lore.types';
import { ActionTypes } from '../types/actionTypes';

/**
 * Action creator for adding a new lore fact.
 * @param fact - The lore fact data (will be assigned an ID and timestamps automatically)
 * @returns Lore action object
 */
export const addLoreFact = (
  fact: Omit<LoreFact, 'id' | 'createdAt' | 'updatedAt' | 'version'>
): LoreAction => ({
  type: ActionTypes.ADD_LORE_FACT,
  payload: fact
});

/**
 * Action creator for updating an existing lore fact.
 * @param id - ID of the fact to update
 * @param updates - Partial updates to apply to the fact
 * @returns Lore action object
 */
export const updateLoreFact = (
  id: string,
  updates: Partial<LoreFact>
): LoreAction => ({
  type: ActionTypes.UPDATE_LORE_FACT,
  payload: { id, updates }
});

/**
 * Action creator for invalidating a lore fact.
 * @param id - ID of the fact to invalidate
 * @returns Lore action object
 */
export const invalidateLoreFact = (id: string): LoreAction => ({
  type: ActionTypes.INVALIDATE_LORE_FACT,
  payload: id
});

/**
 * Action creator for validating a lore fact.
 * @param id - ID of the fact to validate
 * @returns Lore action object
 */
export const validateLoreFact = (id: string): LoreAction => ({
  type: ActionTypes.VALIDATE_LORE_FACT,
  payload: id
});

/**
 * Action creator for adding related facts to a fact.
 * @param factId - ID of the fact to add related facts to
 * @param relatedIds - IDs of the related facts to add
 * @returns Lore action object
 */
export const addRelatedFacts = (
  factId: string,
  relatedIds: string[]
): LoreAction => ({
  type: ActionTypes.ADD_RELATED_FACTS,
  payload: { factId, relatedIds }
});

/**
 * Action creator for removing related facts from a fact.
 * @param factId - ID of the fact to remove related facts from
 * @param relatedIds - IDs of the related facts to remove
 * @returns Lore action object
 */
export const removeRelatedFacts = (
  factId: string,
  relatedIds: string[]
): LoreAction => ({
  type: ActionTypes.REMOVE_RELATED_FACTS,
  payload: { factId, relatedIds }
});

/**
 * Action creator for adding tags to a fact.
 * @param factId - ID of the fact to add tags to
 * @param tags - Tags to add
 * @returns Lore action object
 */
export const addFactTags = (
  factId: string,
  tags: string[]
): LoreAction => ({
  type: ActionTypes.ADD_FACT_TAGS,
  payload: { factId, tags }
});

/**
 * Action creator for removing tags from a fact.
 * @param factId - ID of the fact to remove tags from
 * @param tags - Tags to remove
 * @returns Lore action object
 */
export const removeFactTags = (
  factId: string,
  tags: string[]
): LoreAction => ({
  type: ActionTypes.REMOVE_FACT_TAGS,
  payload: { factId, tags }
});

/**
 * Action creator for processing extraction results from AI.
 * @param extractionResult - The extraction result containing new and updated facts
 * @returns Lore action object
 */
export const processLoreExtraction = (
  extractionResult: LoreExtractionResult
): LoreAction => ({
  type: ActionTypes.PROCESS_LORE_EXTRACTION,
  payload: extractionResult
});