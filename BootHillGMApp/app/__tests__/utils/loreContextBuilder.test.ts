/**
 * Tests for lore context builder utilities
 */

import { 
  selectLoreForContext, 
  buildLoreContextPrompt, 
  extendContextWithLore 
} from '../../utils/loreContextBuilder';
import { 
  LoreStore, 
  LoreFact,
  initialLoreState
} from '../../types/narrative/lore.types';
import { NarrativeContext } from '../../types/narrative/context.types';

describe('loreContextBuilder', () => {
  // Helper to create a test fact
  const createTestFact = (
    id: string, 
    content: string, 
    category: 'character' | 'location' | 'history' | 'item' | 'concept',
    tags: string[] = [],
    importance: number = 5,
    confidence: number = 5,
    isValid: boolean = true
  ): LoreFact => ({
    id,
    content,
    category,
    createdAt: Date.now() - 1000,
    updatedAt: Date.now() - 1000,
    confidence,
    importance,
    version: 1,
    isValid,
    relatedFactIds: [],
    tags
  });

  // Helper to create a test lore store
  const createTestLoreStore = (): LoreStore => {
    const facts: Record<string, LoreFact> = {
      'fact-1': createTestFact(
        'fact-1', 
        'Redemption was founded in 1867 by gold prospectors.', 
        'location',
        ['redemption', 'history', 'gold rush'],
        8, // High importance
        9  // High confidence
      ),
      'fact-2': createTestFact(
        'fact-2', 
        'Sheriff Johnson has been the law in Redemption for 15 years.', 
        'character',
        ['sheriff johnson', 'redemption', 'law'],
        7, // High importance
        8  // High confidence
      ),
      'fact-3': createTestFact(
        'fact-3', 
        'The Broken Spur Saloon is owned by Meredith Winters.', 
        'location',
        ['broken spur', 'saloon', 'meredith winters', 'redemption'],
        6, // Medium importance
        7  // Medium-high confidence
      ),
      'fact-4': createTestFact(
        'fact-4', 
        'Redemption sits at the junction of two major cattle trails.', 
        'location',
        ['redemption', 'cattle', 'geography'],
        5, // Medium importance
        6  // Medium confidence
      ),
      'fact-5': createTestFact(
        'fact-5', 
        'The town has seen three major fires in its history.', 
        'history',
        ['redemption', 'fires', 'history'],
        4, // Medium-low importance
        8  // High confidence
      ),
      'fact-6': createTestFact(
        'fact-6', 
        'Invalid fact that should not be included.', 
        'concept',
        ['should-not-appear'],
        10, // Very high importance (but invalid)
        10, // Very high confidence (but invalid)
        false // Invalid
      )
    };

    // Create the test store
    return {
      ...initialLoreState,
      facts,
      categorizedFacts: {
        character: ['fact-2'],
        location: ['fact-1', 'fact-3', 'fact-4'],
        history: ['fact-5'],
        item: [],
        concept: ['fact-6'] // Invalid fact
      },
      factsByTag: {
        'redemption': ['fact-1', 'fact-2', 'fact-3', 'fact-4', 'fact-5'],
        'history': ['fact-1', 'fact-5'],
        'gold rush': ['fact-1'],
        'sheriff johnson': ['fact-2'],
        'law': ['fact-2'],
        'broken spur': ['fact-3'],
        'saloon': ['fact-3'],
        'meredith winters': ['fact-3'],
        'cattle': ['fact-4'],
        'geography': ['fact-4'],
        'fires': ['fact-5'],
        'should-not-appear': ['fact-6']
      },
      factVersions: {
        'fact-1': [facts['fact-1']],
        'fact-2': [facts['fact-2']],
        'fact-3': [facts['fact-3']],
        'fact-4': [facts['fact-4']],
        'fact-5': [facts['fact-5']],
        'fact-6': [facts['fact-6']]
      },
      latestUpdate: Date.now() - 1000
    };
  };

  // Default test impact state
  const defaultImpactState = {
    reputationImpacts: { /* Intentionally empty */ },
    relationshipImpacts: { /* Intentionally empty */ },
    worldStateImpacts: { /* Intentionally empty */ },
    storyArcImpacts: { /* Intentionally empty */ },
    lastUpdated: Date.now() - 1000
  };

  // Create a test narrative context
  const createTestContext = (): NarrativeContext => ({
    location: {
      type: 'town',
      name: 'Redemption'
    },
    characterFocus: ['Sheriff Johnson', 'Meredith Winters'],
    themes: ['justice', 'frontier life'],
    worldContext: 'Wild West frontier town',
    importantEvents: ['Recent shoot-out at the Broken Spur Saloon'],
    decisionHistory: [], 
    storyPoints: { /* Intentionally empty */ },
    narrativeArcs: { /* Intentionally empty */ },
    impactState: defaultImpactState,
    narrativeBranches: { /* Intentionally empty */ },
    pendingDecisions: [],
    currentTags: ['redemption', 'sheriff johnson', 'saloon'],
    sceneType: 'dialogue'
  });

  describe('selectLoreForContext', () => {
    it('should select facts based on relevance and token budget', () => {
      // Arrange
      const loreStore = createTestLoreStore();
      const context = createTestContext();
      const tokenBudget = 200; // Enough for a few facts

      // Act
      const result = selectLoreForContext(loreStore, context, tokenBudget);

      // Assert
      expect(result).toContain('Sheriff Johnson has been the law');
      expect(result).toContain('The Broken Spur Saloon');
      
      // Should not include invalid facts
      expect(result).not.toContain('Invalid fact');
    });

    it('should return empty string for zero token budget', () => {
      // Arrange
      const loreStore = createTestLoreStore();
      const context = createTestContext();
      const tokenBudget = 0;

      // Act
      const result = selectLoreForContext(loreStore, context, tokenBudget);

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string for empty lore store', () => {
      // Arrange
      const loreStore = initialLoreState;
      const context = createTestContext();
      const tokenBudget = 200;

      // Act
      const result = selectLoreForContext(loreStore, context, tokenBudget);

      // Assert
      expect(result).toBe('');
    });

    it('should prioritize facts related to the current context', () => {
      // Arrange
      const loreStore = createTestLoreStore();
      const context = createTestContext();
      
      // Modify context to focus only on Sheriff Johnson
      const sheriffContext: NarrativeContext = {
        ...context,
        characterFocus: ['Sheriff Johnson'],
        currentTags: ['sheriff johnson', 'law']
      };
      
      const tokenBudget = 100; // Limit to just one or two facts

      // Act
      const result = selectLoreForContext(loreStore, sheriffContext, tokenBudget);

      // Assert
      expect(result).toContain('Sheriff Johnson has been the law');
      // The sheriff fact should be prioritized over location facts
      // due to character focus in the context
    });

    it('should respect token budget constraints', () => {
      // Arrange
      const loreStore = createTestLoreStore();
      const context = createTestContext();
      
      // Try with different token budgets
      const smallBudget = 50; // Only enough for one fact
      const mediumBudget = 200; // Enough for a few facts
      const largeBudget = 1000; // Enough for all facts

      // Act
      const smallResult = selectLoreForContext(loreStore, context, smallBudget);
      const mediumResult = selectLoreForContext(loreStore, context, mediumBudget);
      const largeResult = selectLoreForContext(loreStore, context, largeBudget);

      // Assert
      // Small budget should have fewer facts
      expect(smallResult.split('\n').filter(Boolean).length).toBeLessThan(
        mediumResult.split('\n').filter(Boolean).length
      );
      
      // Medium budget should have fewer or equal facts compared to large budget
      expect(mediumResult.split('\n').filter(Boolean).length).toBeLessThanOrEqual(
        largeResult.split('\n').filter(Boolean).length
      );
    });
  });

  describe('buildLoreContextPrompt', () => {
    it('should format lore facts with a header in detailed format', () => {
      // Arrange
      const loreStore = createTestLoreStore();
      const context = createTestContext();
      const options = {
        tokenBudget: 500,
        header: 'Test Header:',
        format: 'detailed' as const
      };

      // Act
      const result = buildLoreContextPrompt(loreStore, context, options);

      // Assert
      expect(result).toContain('Test Header:');
      expect(result).toContain('Sheriff Johnson has been the law');
      expect(result).toContain('Please maintain consistency');
      
      // Should use newlines in detailed format
      expect(result.split('\n').length).toBeGreaterThan(3);
    });

    it('should format lore facts in concise format', () => {
      // Arrange
      const loreStore = createTestLoreStore();
      const context = createTestContext();
      const options = {
        tokenBudget: 500,
        format: 'concise' as const
      };

      // Act
      const result = buildLoreContextPrompt(loreStore, context, options);

      // Assert
      expect(result).toContain('Established World Facts:');
      expect(result).toContain('Sheriff Johnson has been the law');
      
      // Should be more compact in concise format
      // All facts should be on one line after the header
      const lines = result.trim().split('\n');
      expect(lines.length).toBeLessThanOrEqual(3);
    });

    it('should return empty string if no lore is selected', () => {
      // Arrange
      const loreStore = initialLoreState; // Empty store
      const context = createTestContext();
      
      // Act
      const result = buildLoreContextPrompt(loreStore, context);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('extendContextWithLore', () => {
    it('should add lore context to existing context string', () => {
      // Arrange
      const loreStore = createTestLoreStore();
      const narrativeContext = createTestContext();
      const existingContext = 'This is the original narrative context.';

      // Act
      const result = extendContextWithLore(existingContext, loreStore, narrativeContext);

      // Assert
      expect(result).toContain(existingContext);
      expect(result).toContain('Established World Facts:');
      expect(result).toContain('Sheriff Johnson');
    });

    it('should return original context if lore store is empty', () => {
      // Arrange
      const loreStore = initialLoreState; // Empty store
      const narrativeContext = createTestContext();
      const existingContext = 'This is the original narrative context.';

      // Act
      const result = extendContextWithLore(existingContext, loreStore, narrativeContext);

      // Assert
      expect(result).toBe(existingContext);
    });

    it('should allocate appropriate token budget based on existing context', () => {
      // Arrange
      const loreStore = createTestLoreStore();
      const narrativeContext = createTestContext();
      
      // Create contexts of different lengths
      const shortContext = 'Short context.'; // ~2 tokens
      const longContext = 'Long context. '.repeat(50); // ~100 tokens
      
      // Act
      const shortResult = extendContextWithLore(shortContext, loreStore, narrativeContext);
      const longResult = extendContextWithLore(longContext, loreStore, narrativeContext);
      
      // Assert
      // Longer context should lead to smaller lore section relatively
      // (Since we allocate based on percentage of total budget)
      // We can estimate this by comparing ratios of original to extended
      const shortRatio = shortResult.length / shortContext.length;
      const longRatio = longResult.length / longContext.length;
      
      // Short context should have more relative lore content added
      expect(shortRatio).toBeGreaterThan(longRatio);
    });
  });
});
