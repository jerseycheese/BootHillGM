/**
 * Test fixtures for lore reducer tests
 */

import { LoreFact, LoreStore, initialLoreState, LoreCategory } from '../../../types/narrative/lore.types';

/**
 * Mock timestamp for consistent test results
 */
export const NOW = 1625097600000; // 2021-07-01T00:00:00Z

/**
 * Creates a test fact payload for adding new facts
 * @param customValues - Optional custom values to override defaults
 */
export const createTestFactPayload = (customValues?: {
  content?: string;
  category?: LoreCategory;
  confidence?: number;
  importance?: number;
  tags?: string[];
  isValid?: boolean;
}) => ({
  content: customValues?.content ?? 'Sheriff Johnson has been the law in Redemption for 15 years.',
  category: customValues?.category ?? 'character' as const,
  confidence: customValues?.confidence ?? 8,
  importance: customValues?.importance ?? 7,
  relatedFactIds: [],
  tags: customValues?.tags ?? ['sheriff johnson', 'redemption', 'law'],
  isValid: customValues?.isValid ?? true
});

/**
 * Creates an existing fact with the given ID
 */
export const createExistingFact = (id: string = 'fact-1'): LoreFact => ({
  id,
  content: 'Redemption was founded in 1867 by gold prospectors.',
  category: 'location',
  createdAt: NOW - 1000,
  updatedAt: NOW - 1000,
  confidence: 9,
  importance: 8,
  version: 1,
  isValid: true,
  relatedFactIds: [],
  tags: ['redemption', 'history', 'gold rush']
});

/**
 * Creates a test state with pre-populated facts
 */
export const createTestState = (): LoreStore => {
  const fact1 = createExistingFact('fact-1');
  const fact2: LoreFact = {
    ...createExistingFact('fact-2'),
    content: 'Sheriff Johnson is known for his fair but strict enforcement of the law.',
    category: 'character',
    tags: ['sheriff johnson', 'redemption', 'law']
  };

  return {
    ...initialLoreState,
    facts: {
      'fact-1': fact1,
      'fact-2': fact2
    },
    categorizedFacts: {
      ...initialLoreState.categorizedFacts,
      location: ['fact-1'],
      character: ['fact-2']
    },
    factsByTag: {
      'redemption': ['fact-1', 'fact-2'],
      'history': ['fact-1'],
      'gold rush': ['fact-1'],
      'sheriff johnson': ['fact-2'],
      'law': ['fact-2']
    },
    factVersions: {
      'fact-1': [fact1],
      'fact-2': [fact2]
    },
    latestUpdate: NOW - 1000
  };
};

/**
 * Test data for lore extraction
 */
export const testLoreExtractions = {
  withNewFacts: {
    newFacts: [
      {
        content: 'Redemption has a population of about 500 people.',
        category: 'location' as const,
        importance: 6,
        confidence: 7,
        tags: ['redemption', 'population']
      },
      {
        content: 'Sheriff Johnson has a deputy named Williams.',
        category: 'character' as const,
        importance: 5,
        confidence: 8,
        tags: ['sheriff johnson', 'deputy williams']
      }
    ]
  },
  withUpdatedFacts: {
    newFacts: [],
    updatedFacts: [
      {
        id: 'fact-1',
        content: 'Redemption was founded in 1865 by gold prospectors.',
        confidence: 7
      }
    ]
  },
  withMinimalFact: {
    newFacts: [
      {
        content: 'Minimal fact with defaults.',
        category: 'concept' as const
        // Missing other fields
      }
    ]
  }
};

// Add a simple test to make Jest recognize this as a test file
describe('loreTestFixtures', () => {
  it('should have valid test data', () => {
    // Test the fixture creation functions
    const payload = createTestFactPayload();
    expect(payload).toBeDefined();
    expect(payload.content).toBe('Sheriff Johnson has been the law in Redemption for 15 years.');
    
    const existingFact = createExistingFact('test-id');
    expect(existingFact.id).toBe('test-id');
    
    const testState = createTestState();
    expect(testState.facts['fact-1']).toBeDefined();
    expect(testState.facts['fact-2']).toBeDefined();
    
    // Test the extraction fixtures
    expect(testLoreExtractions.withNewFacts.newFacts.length).toBe(2);
    expect(testLoreExtractions.withUpdatedFacts.updatedFacts.length).toBe(1);
    expect(testLoreExtractions.withMinimalFact.newFacts.length).toBe(1);
  });
});
