/**
 * Tests for the lore reducer
 */

import { loreReducer } from '../../reducers/loreReducer';
import { 
  initialLoreState, 
  LoreAction,
  LoreCategory
} from '../../types/narrative/lore.types';
import { ActionTypes } from '../../types/actionTypes';

// Import test fixtures and utilities
import { 
  NOW,
  createTestFactPayload,
  createTestState,
  testLoreExtractions
} from '../utils/lore/loreTestFixtures';

import { 
  verifyFactCategory,
  verifyFactTag,
  verifyFactVersions,
} from '../utils/lore/loreTestUtils';

describe('loreReducer', () => {
  // Mock Date.now for predictable timestamps
  let originalDateNow: () => number;

  beforeAll(() => {
    originalDateNow = Date.now;
    Date.now = jest.fn(() => NOW);
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  describe('ADD_LORE_FACT', () => {
    it('should add a new fact to the store', () => {
      const payload = createTestFactPayload();
      const action: LoreAction = { type: ActionTypes.ADD_LORE_FACT, payload };
      const result = loreReducer(initialLoreState, action);

      // Check basic fact properties
      expect(Object.keys(result.facts).length).toBe(1);
      const factId = Object.keys(result.facts)[0];
      const fact = result.facts[factId];
      
      expect(fact).toMatchObject({
        content: payload.content,
        category: payload.category,
        confidence: payload.confidence,
        importance: payload.importance,
        version: 1,
        createdAt: NOW,
        updatedAt: NOW
      });
      
      // Check indexing
      verifyFactCategory(result, factId, 'character');
      verifyFactTag(result, factId, 'sheriff johnson');
      verifyFactTag(result, factId, 'redemption');
      verifyFactTag(result, factId, 'law');
      
      // Check version history and timestamp
      verifyFactVersions(result, factId, 1);
      expect(result.latestUpdate).toBe(NOW);
    });
  });

  describe('UPDATE_LORE_FACT', () => {
    it('should update an existing fact', () => {
      const initialState = createTestState();
      const factId = 'fact-1';
      const updates = {
        content: 'Redemption was founded in 1868 by silver miners.',
        confidence: 6,
        importance: 7
      };
      
      const action: LoreAction = { 
        type: ActionTypes.UPDATE_LORE_FACT, 
        payload: { id: factId, updates } 
      };
      const result = loreReducer(initialState, action);

      // Verify updated fact
      expect(result.facts[factId]).toMatchObject({
        ...initialState.facts[factId],
        ...updates,
        version: 2,
        updatedAt: NOW
      });
      
      // Verify version history preserves old version
      expect(result.factVersions[factId][0]).toBe(initialState.facts[factId]);
      expect(result.factVersions[factId][1]).toBe(result.facts[factId]);
      expect(result.latestUpdate).toBe(NOW);
    });

    it('should handle category changes and update indexes', () => {
      const initialState = createTestState();
      const factId = 'fact-1';
      const updates = {
        category: 'history' as const,
        tags: ['redemption', 'founding', 'history']
      };
      
      const action: LoreAction = { 
        type: ActionTypes.UPDATE_LORE_FACT, 
        payload: { id: factId, updates } 
      };
      const result = loreReducer(initialState, action);

      // Verify category indexes updated
      verifyFactCategory(result, factId, 'location', false);
      verifyFactCategory(result, factId, 'history', true);
      
      // Verify tag indexes updated
      verifyFactTag(result, factId, 'gold rush', false);
      verifyFactTag(result, factId, 'founding', true);
    });

    it('should not modify state if fact does not exist', () => {
      const initialState = createTestState();
      const action: LoreAction = { 
        type: ActionTypes.UPDATE_LORE_FACT, 
        payload: { 
          id: 'non-existent-fact', 
          updates: { content: 'This should not be added' } 
        } 
      };
      
      const result = loreReducer(initialState, action);
      expect(result).toBe(initialState);
    });
  });

  describe('Fact validity management', () => {
    it('should toggle fact validity states', () => {
      const initialState = createTestState();
      const factId = 'fact-1';
      
      // First invalidate the fact
      const invalidateAction: LoreAction = { 
        type: ActionTypes.INVALIDATE_LORE_FACT, 
        payload: factId 
      };
      const invalidState = loreReducer(initialState, invalidateAction);
      
      expect(invalidState.facts[factId].isValid).toBe(false);
      verifyFactVersions(invalidState, factId, 2);
      
      // Then validate it again
      const validateAction: LoreAction = { 
        type: ActionTypes.VALIDATE_LORE_FACT, 
        payload: factId 
      };
      const revalidatedState = loreReducer(invalidState, validateAction);
      
      expect(revalidatedState.facts[factId].isValid).toBe(true);
      verifyFactVersions(revalidatedState, factId, 3);
    });
  });

  describe('Fact relationship management', () => {
    it('should add and remove related fact IDs', () => {
      const initialState = createTestState();
      const factId = 'fact-1';
      const relatedIds = ['fact-2', 'fact-3'];
      
      // Add related facts
      const addAction: LoreAction = { 
        type: ActionTypes.ADD_RELATED_FACTS, 
        payload: { factId, relatedIds } 
      };
      const stateWithRelated = loreReducer(initialState, addAction);
      
      expect(stateWithRelated.facts[factId].relatedFactIds).toContain('fact-2');
      expect(stateWithRelated.facts[factId].relatedFactIds).toContain('fact-3');
      verifyFactVersions(stateWithRelated, factId, 2);
      
      // Remove a related fact
      const removeAction: LoreAction = { 
        type: ActionTypes.REMOVE_RELATED_FACTS, 
        payload: { factId, relatedIds: ['fact-2'] } 
      };
      const finalState = loreReducer(stateWithRelated, removeAction);
      
      expect(finalState.facts[factId].relatedFactIds).not.toContain('fact-2');
      expect(finalState.facts[factId].relatedFactIds).toContain('fact-3');
      verifyFactVersions(finalState, factId, 3);
    });
  });

  describe('Fact tag management', () => {
    it('should add and remove tags', () => {
      const initialState = createTestState();
      const factId = 'fact-1';
      
      // Add tags
      const addTagsAction: LoreAction = { 
        type: ActionTypes.ADD_FACT_TAGS, 
        payload: { factId, tags: ['western', 'town'] } 
      };
      const stateWithTags = loreReducer(initialState, addTagsAction);
      
      expect(stateWithTags.facts[factId].tags).toContain('western');
      expect(stateWithTags.facts[factId].tags).toContain('town');
      verifyFactTag(stateWithTags, factId, 'western', true);
      verifyFactTag(stateWithTags, factId, 'town', true);
      
      // Remove tags
      const removeTagsAction: LoreAction = { 
        type: ActionTypes.REMOVE_FACT_TAGS, 
        payload: { factId, tags: ['history'] } 
      };
      const finalState = loreReducer(stateWithTags, removeTagsAction);
      
      expect(finalState.facts[factId].tags).not.toContain('history');
      verifyFactTag(finalState, factId, 'history', false);
    });
  });

  describe('Lore extraction processing', () => {
    it('should process lore extraction with new facts', () => {
      const action: LoreAction = { 
        type: ActionTypes.PROCESS_LORE_EXTRACTION, 
        payload: testLoreExtractions.withNewFacts
      };
      const result = loreReducer(initialLoreState, action);

      expect(Object.keys(result.facts).length).toBe(2);
      expect(result.categorizedFacts.location.length).toBe(1);
      expect(result.categorizedFacts.character.length).toBe(1);
      verifyFactTag(result, result.categorizedFacts.location[0], 'population');
      verifyFactTag(result, result.categorizedFacts.character[0], 'deputy williams');
    });

    it('should process lore extraction with updated facts', () => {
      const initialState = createTestState();
      const action: LoreAction = { 
        type: ActionTypes.PROCESS_LORE_EXTRACTION, 
        payload: testLoreExtractions.withUpdatedFacts
      };
      const result = loreReducer(initialState, action);

      expect(result.facts['fact-1'].content).toBe('Redemption was founded in 1865 by gold prospectors.');
      expect(result.facts['fact-1'].confidence).toBe(7);
      verifyFactVersions(result, 'fact-1', 2);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid categories and missing fields', () => {
      // Test invalid category
      const invalidCategoryAction: LoreAction = { 
        type: ActionTypes.ADD_LORE_FACT, 
        payload: {
          ...createTestFactPayload(),
          category: 'invalid-category' as unknown as LoreCategory
        }
      };
      const resultWithInvalidCategory = loreReducer(
        initialLoreState, 
        invalidCategoryAction
      );
      
      const factId = Object.keys(resultWithInvalidCategory.facts)[0];
      expect(resultWithInvalidCategory.facts[factId].category).toBe('concept');
      verifyFactCategory(resultWithInvalidCategory, factId, 'concept');
      
      // Test missing fields in extraction
      const missingFieldsAction: LoreAction = { 
        type: ActionTypes.PROCESS_LORE_EXTRACTION, 
        payload: testLoreExtractions.withMinimalFact
      };
      const resultWithMinimalFact = loreReducer(
        initialLoreState, 
        missingFieldsAction
      );
      
      const minimalFactId = Object.keys(resultWithMinimalFact.facts)[0];
      const minimalFact = resultWithMinimalFact.facts[minimalFactId];
      
      expect(minimalFact.confidence).toBe(5); // Default value
      expect(minimalFact.importance).toBe(5); // Default value
      expect(minimalFact.tags).toEqual([]); // Default value
      expect(minimalFact.relatedFactIds).toEqual([]); // Default value
    });
  });
});
