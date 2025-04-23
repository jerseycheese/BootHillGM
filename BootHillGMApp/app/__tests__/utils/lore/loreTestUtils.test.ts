/**
 * Tests for lore test utilities
 */

import { 
  verifyFactCategory,
  verifyFactTag,
  verifyFactVersions,
  applyActions
} from './loreTestUtils';
import { createTestState } from './loreTestFixtures';
import { LoreStore, LoreAction } from '../../../types/narrative/lore.types';
import { loreReducer } from '../../../reducers/loreReducer';
import { ActionTypes } from '../../../types/actionTypes';

describe('loreTestUtils', () => {
  let testState: LoreStore;
  
  beforeEach(() => {
    testState = createTestState();
  });
  
  it('should verify fact category correctly', () => {
    // Fact 1 should be in 'location' category
    expect(() => verifyFactCategory(testState, 'fact-1', 'location', true)).not.toThrow();
    expect(() => verifyFactCategory(testState, 'fact-1', 'character', true)).toThrow();
    
    // Test negative verification
    expect(() => verifyFactCategory(testState, 'fact-1', 'location', false)).toThrow();
    expect(() => verifyFactCategory(testState, 'fact-1', 'character', false)).not.toThrow();
  });
  
  it('should verify fact tags correctly', () => {
    // Fact 1 should have 'redemption' tag
    expect(() => verifyFactTag(testState, 'fact-1', 'redemption', true)).not.toThrow();
    expect(() => verifyFactTag(testState, 'fact-1', 'non-existent-tag', true)).toThrow();
    
    // Test negative verification
    expect(() => verifyFactTag(testState, 'fact-1', 'redemption', false)).toThrow();
    expect(() => verifyFactTag(testState, 'fact-1', 'non-existent-tag', false)).not.toThrow();
  });
  
  it('should verify fact versions correctly', () => {
    // Fact 1 should have one version
    expect(() => verifyFactVersions(testState, 'fact-1', 1)).not.toThrow();
    expect(() => verifyFactVersions(testState, 'fact-1', 2)).toThrow();
    
    // Test with non-existent fact
    expect(() => verifyFactVersions(testState, 'non-existent-fact', 1)).toThrow();
  });
  
  it('should apply multiple actions sequentially', () => {
    const actions: LoreAction[] = [
      {
        type: ActionTypes.ADD_LORE_FACT,
        payload: {
          content: 'Test fact content',
          category: 'concept',
          confidence: 5,
          importance: 5,
          isValid: true,
          relatedFactIds: [],
          tags: ['test']
        }
      },
      {
        type: ActionTypes.ADD_FACT_TAGS,
        payload: {
          factId: 'fact-1',
          tags: ['new-tag']
        }
      },
      {
        type: ActionTypes.ADD_LORE_FACT,
        payload: {
          content: 'Another test fact',
          category: 'location',
          confidence: 6,
          importance: 6,
          isValid: true,
          tags: ['another-test']
        }
      }
    ];
    
    // Apply actions to test state
    const resultState = applyActions(testState, actions, loreReducer);
    
    // Verify results
    // Should have two more facts
    expect(Object.keys(resultState.facts).length).toBe(
      Object.keys(testState.facts).length + 2
    );
    
    // fact-1 should have the new tag
    expect(() => verifyFactTag(resultState, 'fact-1', 'new-tag', true)).not.toThrow();
  });
});
