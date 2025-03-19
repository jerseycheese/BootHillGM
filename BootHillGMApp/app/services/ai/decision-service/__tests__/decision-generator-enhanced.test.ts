import { AIDecisionGenerator } from '../decision-generator';
import { NarrativeState } from '../../../../types/narrative.types';
import { Character } from '../../../../types/character';
import { DecisionResponse, DecisionPrompt } from '../../../../types/ai-service.types';
import { DecisionHistoryManager, AIClient } from '../../../../types/decision-service/decision-service.types';

// Mock the dependencies
const mockAIClient: jest.Mocked<AIClient> = {
  makeRequest: jest.fn(),
  getRateLimitRemaining: jest.fn().mockReturnValue(10),
  getRateLimitResetTime: jest.fn().mockReturnValue(Date.now() + 60000)
};

const mockHistoryManager: jest.Mocked<DecisionHistoryManager> = {
  getDecisionHistory: jest.fn().mockReturnValue([
    {
      prompt: 'How do you respond to the sheriff?',
      choice: 'Tip your hat respectfully',
      outcome: 'The sheriff nods back, seemingly more at ease.',
      timestamp: Date.now() - 100000
    }
  ]),
  recordDecision: jest.fn()
};

// Sample narrative state for testing
const createMockNarrativeState = (override?: Partial<NarrativeState>): NarrativeState => ({
  currentStoryPoint: {
    id: 'story-point-1',
    content: 'You find yourself in the middle of a dusty street.',
    type: 'narrative',
    locationChange: 'TOWN_STREET'
  },
  visitedPoints: ['intro', 'town-entrance'],
  availableChoices: [],
  narrativeHistory: [
    'You arrived in town on a dusty afternoon.',
    'The sheriff eyed you suspiciously as you walked down the main street.',
    'A group of locals whispered as you passed by.',
    'You decided to head to the saloon for information.',
    'The bartender greeted you with a nod.'
  ],
  displayMode: 'standard',
  narrativeContext: {
    tone: 'serious',
    characterFocus: ['Sheriff', 'Bartender', 'Mysterious Stranger'],
    themes: ['justice', 'redemption', 'frontier-life'],
    worldContext: 'A town plagued by recent robberies and mysterious disappearances.',
    importantEvents: [
      'Sheriff mentioned missing gold shipments',
      'Bartender warned about strangers in town'
    ],
    storyPoints: {},
    narrativeArcs: {},
    impactState: {
      reputationImpacts: {
        'Sheriff': -10,
        'Bartender': 15
      },
      relationshipImpacts: {
        'Player': {
          'Sheriff': -10,
          'Bartender': 20
        }
      },
      worldStateImpacts: {
        'TownSuspicion': 40,
        'SheriffTrust': -5
      },
      storyArcImpacts: {},
      lastUpdated: Date.now() - 5000
    },
    narrativeBranches: {},
    decisionHistory: [
      {
        decisionId: 'decision-1',
        selectedOptionId: 'option-1',
        timestamp: Date.now() - 50000,
        narrative: 'You decided to approach the sheriff directly.',
        impactDescription: 'The sheriff seems cautious but willing to talk.',
        tags: ['sheriff', 'direct-approach'],
        relevanceScore: 8
      },
      {
        decisionId: 'decision-2',
        selectedOptionId: 'option-3',
        timestamp: Date.now() - 30000,
        narrative: 'You asked the bartender about recent events.',
        impactDescription: 'The bartender appreciates your discretion.',
        tags: ['bartender', 'gathering-info'],
        relevanceScore: 9
      }
    ]
  },
  ...override
});

// Sample character for testing
const mockCharacter: Character = {
  id: 'player-1',
  name: 'Buck Wilde',
  isNPC: false,
  attributes: {
    bravery: 8,
    speed: 6,
    gunAccuracy: 9
  }
};

// Mock AI response
const mockResponse: DecisionResponse = {
  decisionId: 'decision-123',
  prompt: 'How do you proceed?',
  options: [
    {
      id: 'option-1',
      text: 'Confront the sheriff about the rumors',
      confidence: 0.8,
      traits: ['brave', 'direct'],
      potentialOutcomes: ['Gain sheriff\'s respect', 'Might provoke hostility'],
      impact: 'Direct approach could clarify situation but risks confrontation'
    },
    {
      id: 'option-2',
      text: 'Continue gathering information discreetly',
      confidence: 0.9,
      traits: ['cautious', 'observant'],
      potentialOutcomes: ['Learn more details', 'Maintain low profile'],
      impact: 'Safer approach but might take longer to get answers'
    }
  ],
  relevanceScore: 0.85,
  metadata: {
    narrativeImpact: 'Sets approach to investigation',
    themeAlignment: 'Classic western mystery',
    pacing: 'medium',
    importance: 'significant'
  }
};

describe('AIDecisionGenerator - Enhanced Context', () => {
  let generator: AIDecisionGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAIClient.makeRequest.mockResolvedValue(mockResponse);
    generator = new AIDecisionGenerator(mockAIClient, mockHistoryManager, 4);
  });

  describe('Context Extraction', () => {
    it('should extract comprehensive context from multiple sources', async () => {
      const narrativeState = createMockNarrativeState();
      
      // Call generateDecision to trigger the context extraction
      await generator.generateDecision(narrativeState, mockCharacter);
      
      // Check that makeRequest was called correctly
      expect(mockAIClient.makeRequest).toHaveBeenCalledTimes(1);
      
      // Get the prompt that was passed to makeRequest
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Verify the narrative context includes elements from different sources
      expect(prompt.narrativeContext).toContain('You find yourself');  // From current story point
      expect(prompt.narrativeContext).toContain('saloon for information'); // From narrative history
      expect(prompt.narrativeContext).toContain('town plagued by recent robberies'); // From world context
    });

    it('should extract recent narrative history even when story point is not available', async () => {
      const narrativeState = createMockNarrativeState({ currentStoryPoint: null });
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Should still include narrative history
      expect(prompt.narrativeContext).toContain('saloon for information');
      expect(prompt.narrativeContext).toContain('bartender greeted you');
    });

    it('should extract character relationships from impact state', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check that relationships were extracted
      expect(prompt.characterInfo.relationships).toHaveProperty('Sheriff');
      expect(prompt.characterInfo.relationships).toHaveProperty('Bartender');
      // Fix: Use toContainEqual for string matching
      expect(prompt.characterInfo.relationships.Sheriff).toContain('unfriendly');
      expect(prompt.characterInfo.relationships.Bartender).toContain('friendly');
    });

    it('should include more detailed recent events', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check that recent events include more entries and proper formatting
      expect(prompt.gameState.recentEvents.length).toBeGreaterThanOrEqual(5);
      // Fix: Use toContainEqual for array testing
      expect(prompt.gameState.recentEvents).toContainEqual('You decided to head to the saloon for information.');
      expect(prompt.gameState.recentEvents).toContainEqual('The bartender greeted you with a nod.');
    });

    it('should include decision history with additional context', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check that previousDecisions include expected properties
      expect(prompt.previousDecisions).toHaveLength(1);
      expect(prompt.previousDecisions[0]).toHaveProperty('prompt');
      expect(prompt.previousDecisions[0]).toHaveProperty('choice');
      expect(prompt.previousDecisions[0]).toHaveProperty('outcome');
      
      // Should also include additional properties
      expect(prompt.previousDecisions[0]).toHaveProperty('timestamp');
    });
  });

  describe('Context Refreshing', () => {
    it('should refresh narrative context before generating a decision', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check for markers of refreshed context
      expect(prompt.narrativeContext).toContain('Current scene:');
      expect(prompt.narrativeContext).toContain('Recent events:');
      expect(prompt.narrativeContext).toContain('Selected');
      expect(prompt.narrativeContext).toContain('World state:');
    });

    it('should handle missing narrative context gracefully', async () => {
      const narrativeState = createMockNarrativeState({ narrativeContext: undefined });
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Should still have basic context
      expect(prompt.narrativeContext).toContain('You find yourself');
      expect(prompt.narrativeContext).toContain('dusty afternoon');
    });

    it('should handle empty narrative history gracefully', async () => {
      const narrativeState = createMockNarrativeState({ 
        narrativeHistory: [],
        currentStoryPoint: null
      });
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      // Should not throw an error
      expect(mockAIClient.makeRequest).toHaveBeenCalled();
    });
  });
});