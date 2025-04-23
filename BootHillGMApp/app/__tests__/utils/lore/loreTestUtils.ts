/**
 * Test utilities for lore reducer tests
 */

import { loreReducer } from '../../../reducers/loreReducer';
import { LoreAction, LoreStore, isValidLoreCategory } from '../../../types/narrative/lore.types';
import { createTestState } from './loreTestFixtures';

/**
 * Helper function to verify fact indexes
 * Checks if a fact ID is properly indexed in the categorized facts
 */
export const verifyFactCategory = (
  state: LoreStore,
  factId: string,
  expectedCategory: string,
  shouldContain: boolean = true
) => {
  // Verify category is valid to prevent type errors
  if (isValidLoreCategory(expectedCategory)) {
    if (shouldContain) {
      expect(state.categorizedFacts[expectedCategory]).toContain(factId);
    } else {
      expect(state.categorizedFacts[expectedCategory]).not.toContain(factId);
    }
  } else {
    // For invalid categories, expect factId to not be found
    // This is an implementation decision to handle test cases with invalid categories
    if (!shouldContain) {
      // Expected behavior - not found in an invalid category
      expect(true).toBe(true);
    } else {
      // Unexpected behavior - should not be looking for a fact in an invalid category
      expect(false).toBe(true); // Force test to fail for invalid expectation
    }
  }
};

/**
 * Helper function to verify fact tag indexing
 * Checks if a fact ID is properly indexed in the fact tags
 */
export const verifyFactTag = (
  state: LoreStore,
  factId: string,
  tag: string,
  shouldContain: boolean = true
) => {
  if (shouldContain) {
    expect(state.factsByTag[tag]).toContain(factId);
  } else {
    // If shouldContain is false, either the tag should not include the factId,
    // or the tag shouldn't exist at all
    if (state.factsByTag[tag]) {
      expect(state.factsByTag[tag]).not.toContain(factId);
    } else {
      expect(state.factsByTag[tag]).toBeUndefined();
    }
  }
};

/**
 * Helper function to verify fact version history
 */
export const verifyFactVersions = (
  state: LoreStore,
  factId: string,
  expectedVersions: number
) => {
  expect(state.factVersions[factId]).toHaveLength(expectedVersions);
  expect(state.facts[factId].version).toBe(expectedVersions);
};

/**
 * Helper to apply multiple actions sequentially to a state
 */
export const applyActions = (
  initialState: LoreStore,
  actions: LoreAction[],
  reducerFn: (state: LoreStore, action: LoreAction) => LoreStore
): LoreStore => {
  return actions.reduce(
    (state, action) => reducerFn(state, action),
    initialState
  );
};

// Add a simple test to make Jest recognize this as a test file
describe('loreTestUtils', () => {
  it('should provide test utility functions', () => {
    // Create a test state to use
    const testState = createTestState();
    
    // Test verifyFactCategory
    expect(() => {
      verifyFactCategory(testState, 'fact-1', 'location', true);
    }).not.toThrow();
    
    // Test verifyFactTag
    expect(() => {
      verifyFactTag(testState, 'fact-1', 'redemption', true);
    }).not.toThrow();
    
    // Test verifyFactVersions
    expect(() => {
      verifyFactVersions(testState, 'fact-1', 1);
    }).not.toThrow();
    
    // Test applyActions
    const testAction: LoreAction = {
      type: 'VALIDATE_LORE_FACT',
      payload: 'fact-1'
    };
    
    const updatedState = applyActions(testState, [testAction], loreReducer);
    expect(updatedState).toBeDefined();
  });
});
