/**
 * Tests for lore test fixtures
 */

import { 
  NOW,
  createTestState,
  createTestFactPayload,
  testLoreExtractions
} from './loreTestFixtures';

describe('loreTestFixtures', () => {
  it('should define a NOW constant for predictable timestamps', () => {
    expect(NOW).toBeDefined();
    expect(typeof NOW).toBe('number');
  });

  it('should create a test state with predefined facts', () => {
    const state = createTestState();
    
    // Check basic structure
    expect(state.facts).toBeDefined();
    expect(state.categorizedFacts).toBeDefined();
    expect(state.factsByTag).toBeDefined();
    expect(state.factVersions).toBeDefined();
    
    // Check that it contains expected facts
    expect(Object.keys(state.facts).length).toBeGreaterThan(0);
    expect(Object.keys(state.facts)).toContain('fact-1');
    expect(Object.keys(state.facts)).toContain('fact-2');
    
    // Check fact properties
    expect(state.facts['fact-1'].category).toBe('location');
    expect(state.facts['fact-1'].isValid).toBe(true);
  });

  it('should create test fact payload with default values', () => {
    const factPayload = createTestFactPayload();
    
    // Check that payload has required properties
    expect(factPayload.content).toBeDefined();
    expect(factPayload.category).toBeDefined();
    expect(factPayload.confidence).toBeDefined();
    expect(factPayload.importance).toBeDefined();
    expect(factPayload.tags).toBeDefined();
    
    // Check payload matches expected defaults
    expect(factPayload.category).toBe('character');
    expect(factPayload.confidence).toBe(8);
    expect(factPayload.importance).toBe(7);
    
    // Custom values should override defaults
    const customPayload = createTestFactPayload({
      content: 'Custom content',
      category: 'history',
      confidence: 5,
      importance: 6
    });
    
    expect(customPayload.content).toBe('Custom content');
    expect(customPayload.category).toBe('history');
    expect(customPayload.confidence).toBe(5);
    expect(customPayload.importance).toBe(6);
  });

  it('should provide test lore extraction data', () => {
    // Check different extraction scenarios exist
    expect(testLoreExtractions.withNewFacts).toBeDefined();
    expect(testLoreExtractions.withUpdatedFacts).toBeDefined();
    expect(testLoreExtractions.withMinimalFact).toBeDefined();
    
    // Check new facts scenario
    expect(testLoreExtractions.withNewFacts.newFacts.length).toBeGreaterThan(0);
    
    // Check updated facts scenario
    expect(testLoreExtractions.withUpdatedFacts.updatedFacts?.length).toBeGreaterThan(0);
    
    // Check minimal fact scenario
    expect(testLoreExtractions.withMinimalFact.newFacts.length).toBeGreaterThan(0);
    const minimalFact = testLoreExtractions.withMinimalFact.newFacts[0];
    expect(minimalFact.content).toBeDefined();
    expect(minimalFact.category).toBeDefined();
    expect(minimalFact.confidence).toBeUndefined(); // Should be minimal
    expect(minimalFact.importance).toBeUndefined(); // Should be minimal
  });
});
