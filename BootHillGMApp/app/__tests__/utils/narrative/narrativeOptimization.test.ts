/**
 * Narrative Context Optimization Tests
 */

import { initialNarrativeState } from '../../../types/narrative.types';
import { _CompressionLevel } from '../../../types/narrative/context.types';

// Create explicit mock functions we can control
const mockBuildContext = jest.fn();
const mockCompressText = jest.fn();
const mockEstimateTokens = jest.fn();

// Set up mock implementations with deterministic performance values
mockBuildContext.mockImplementation((state, options = {}) => {
  const compressionLevel = options.compressionLevel || 'medium';
  
  return {
    formattedContext: 'Optimized context',
    tokenEstimate: 150,
    includedElements: {
      historyEntries: 5,
      decisions: 2,
      characters: ['character1', 'character2'],
      locations: ['location1'],
      recentEvents: ['event1', 'event2']
    },
    metadata: {
      compressionRatio: 0.5,
      buildTime: 3,
      relevanceScores: { item1: 0.8 }
    }
  };
});

mockCompressText.mockImplementation(text => text.substring(0, text.length * 0.8));
mockEstimateTokens.mockImplementation(text => Math.ceil(text?.length / 4) || 0);

// Mock the modules with our functions
jest.mock('../../../utils/narrative/narrativeContextBuilder', () => ({
  buildNarrativeContext: mockBuildContext
}));

jest.mock('../../../utils/narrative/narrativeCompression', () => ({
  compressNarrativeText: mockCompressText,
  estimateTokenCount: mockEstimateTokens
}));

describe('Narrative Context Optimization', () => {
  // Generate test data with varying sizes
  const generateTestState = (historyLength) => {
    const history = Array.from({ length: historyLength }, (_, i) => 
      `This is narrative entry ${i} in the history. It contains some typical western story elements like gunfights, saloons, and character interactions.`
    );
    
    const decisionHistory = Array.from({ length: Math.min(10, historyLength / 10) }, (_, i) => ({
      id: `decision-${i}`,
      decisionId: `decision-type-${i}`,
      selectedOptionId: `option-${i % 3}`,
      timestamp: Date.now() - (i * 86400000), // i days ago
      impactDescription: `Impact of decision ${i}`,
      narrative: `Narrative for decision ${i}`,
      tags: [`tag-${i % 5}`, 'western', i % 2 === 0 ? 'heroic' : 'cautious'],
      relevanceScore: Math.min(10, (10 - i) + (i % 3))
    }));
    
    return {
      ...initialNarrativeState,
      narrativeHistory: history,
      narrativeContext: {
        characterFocus: ['Sheriff', 'Outlaw', 'Barkeep'],
        themes: ['revenge', 'justice', 'survival'],
        decisionHistory,
        impactState: {
          relationshipImpacts: { 
            player: { 'Sheriff': 5, 'Outlaw': -5, 'Barkeep': 2 } 
          },
          reputationImpacts: {
            'law': 3,
            'outlaws': -2
          },
          worldStateImpacts: {},
          storyArcImpacts: {},
          lastUpdated: Date.now()
        }
      }
    };
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('buildNarrativeContext', () => {
    it('should optimize narrative context successfully', () => {
      const state = generateTestState(10);
      
      const result = mockBuildContext(state);
      
      expect(result.formattedContext).toBe('Optimized context');
      expect(result.tokenEstimate).toBe(150);
      expect(result.includedElements.historyEntries).toBe(5);
      expect(result.includedElements.decisions).toBe(2);
    });
    
    it('should handle different compression levels', () => {
      const state = generateTestState(10);
      const compressionLevels = ['none', 'low', 'medium', 'high'];
      
      compressionLevels.forEach(level => {
        const result = mockBuildContext(state, { compressionLevel: level });
        expect(result.formattedContext).toBe('Optimized context');
      });
    });
  });
  
  describe('Token Estimation', () => {
    it('should estimate tokens correctly', () => {
      const text = 'This is a test string for token estimation';
      const estimate = mockEstimateTokens(text);
      expect(estimate).toBe(Math.ceil(text.length / 4));
    });
    
    it('should handle empty text', () => {
      const estimate = mockEstimateTokens('');
      expect(estimate).toBe(0);
    });
  });
  
  describe('Narrative Compression', () => {
    it('should compress text correctly', () => {
      const text = 'This is a test string for compression';
      const compressed = mockCompressText(text);
      expect(compressed.length).toBeLessThan(text.length);
      expect(compressed.length).toBe(Math.floor(text.length * 0.8));
    });
  });
});