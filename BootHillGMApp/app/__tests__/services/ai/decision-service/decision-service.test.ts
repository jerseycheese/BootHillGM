import DecisionService, { AIDecisionGenerator } from '../../../../services/ai/decision-service';
import { NarrativeState, NarrativeDisplayMode, StoryPoint } from '../../../../types/narrative.types';
import { Character } from '../../../../types/character';
import { LocationType } from '../../../../services/locationService';
import { DecisionImportance } from '../../../../types/narrative/decision.types';
import { FetchMockProperties, AbortSignalTimeoutMock, ServiceError } from '../../../../types/testing/test-types';
import { DecisionResponse, DecisionPrompt } from '../../../../types/ai-service.types';
import { DecisionHistoryManager, AIClient } from '../../../../types/decision-service/decision-service.types';

// Mock fetch globally with proper typing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
// Mock AbortSignal.timeout
global.AbortSignal.timeout = jest.fn().mockReturnValue({}) as AbortSignalTimeoutMock;

// Add debug properties to fetch mock for error testing
(global.fetch as unknown as { _mockImplementationCallCount: number })._mockImplementationCallCount = 0;
(global.fetch as unknown as { _mockRejectedValueOnce: boolean })._mockRejectedValueOnce = false;

// Define a proper StoryPoint object
const testStoryPoint: StoryPoint = {
  id: 'test-story-point',
  title: 'Saloon Entrance',
  content: 'The sheriff eyes you suspiciously as you enter the saloon.',
  type: 'narrative',
  locationChange: 'SALOON' as unknown as LocationType
};

// Mock data for testing with all required properties
const mockNarrativeState: NarrativeState = {
  currentStoryPoint: testStoryPoint,
  narrativeHistory: [
    'You arrived in town on a dusty afternoon.',
    'The locals seem wary of strangers these days.'
  ],
  narrativeContext: {
    worldContext: 'There have been several robberies in town recently.',
    characterFocus: [],
    themes: [],
    importantEvents: [],
    storyPoints: {},
    narrativeArcs: {},
    impactState: {
      reputationImpacts: {},
      relationshipImpacts: {},
      worldStateImpacts: {},
      storyArcImpacts: {},
      lastUpdated: 0
    },
    narrativeBranches: {},
    pendingDecisions: [],
    decisionHistory: []
  },
  visitedPoints: [],
  availableChoices: [],
  displayMode: 'standard' as NarrativeDisplayMode,
  context: ""
};

// Mock character with all required attributes
const mockCharacter: Character = {
  id: 'player-1',
  name: 'Buck Wilde',
  isNPC: false,
  isPlayer: true,
  inventory: { items: [] },
  attributes: {
    bravery: 9,
    speed: 7,
    gunAccuracy: 8,
    throwingAccuracy: 5,
    strength: 7,
    baseStrength: 7,
    experience: 0
  },
  minAttributes: {
    bravery: 0,
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 0,
    baseStrength: 0,
    experience: 0
  },
  maxAttributes: {
    bravery: 10,
    speed: 10,
    gunAccuracy: 10,
    throwingAccuracy: 10,
    strength: 10,
    baseStrength: 10,
    experience: 10
  },
  wounds: [],
  isUnconscious: false
};

// Mock API response with proper importance and pacing types
const mockApiResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          decisionId: 'decision-123',
          prompt: 'How do you respond to the sheriff?',
          options: [
            {
              id: 'option-1',
              text: 'Tip your hat and smile',
              confidence: 0.9,
              traits: ['friendly', 'calm'],
              potentialOutcomes: ['Might ease tensions', 'Sheriff could warm up to you'],
              impact: 'Establish yourself as non-threatening'
            },
            {
              id: 'option-2',
              text: 'Ignore him and head to the bar',
              confidence: 0.7,
              traits: ['independent', 'aloof'],
              potentialOutcomes: ['Might appear suspicious', 'Sheriff could watch you closely'],
              impact: 'Establish yourself as independent but possibly suspicious'
            }
          ],
          relevanceScore: 0.85,
          metadata: {
            narrativeImpact: 'Sets the tone for town interactions',
            themeAlignment: 'Classic western standoff tension',
            pacing: 'medium',
            importance: 'significant'
          }
        })
      }
    }
  ]
};

// For Enhanced Context Tests
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

// Sample narrative state for testing with all required properties
const createMockNarrativeState = (override?: Partial<NarrativeState>): NarrativeState => ({
  currentStoryPoint: {
    id: 'story-point-1',
    title: 'Arrival in Town',
    content: 'You find yourself in the middle of a dusty street.',
    type: 'narrative',
    locationChange: 'TOWN_STREET' as unknown as LocationType
  },
  visitedPoints: ['intro', 'town-entrance'],
  availableChoices: [],
  displayMode: 'standard' as NarrativeDisplayMode,
  context: "",
  narrativeHistory: [
    'You arrived in town on a dusty afternoon.',
    'The sheriff eyed you suspiciously as you walked down the main street.',
    'A group of locals whispered as you passed by.',
    'You decided to head to the saloon for information.',
    'The bartender greeted you with a nod.'
  ],
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
    pendingDecisions: [],
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

// Mock AI response with proper pacing type
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

describe('DecisionService', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset counter for tracking mock implementation calls
    (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
    (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
    
    // Setup fetch mock with proper typing
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
      headers: new Headers({
        'X-RateLimit-Remaining': '10',
        'X-RateLimit-Reset': '1600000000'
      })
    } as Response);
    
    // Initialize service with test configuration
    service = new DecisionService({
      minDecisionInterval: 0, // No delay for testing
      relevanceThreshold: 0.3,
      apiConfig: {
        apiKey: 'test-key',
        endpoint: 'https://test-endpoint.com',
        modelName: 'test-model',
        maxRetries: 1,
        timeout: 1000,
        rateLimit: 10
      }
    });
  });
  
  describe('detectDecisionPoint', () => {
    it('should detect when a decision point is appropriate', () => {
      // Create a properly typed story point with dialogue type
      const dialogueStoryPoint: StoryPoint = {
        id: 'dialogue-point',
        title: 'Sheriff Question',
        content: 'The sheriff asks "What brings you to town, stranger?" as he eyes you suspiciously.',
        type: 'dialogue',
        locationChange: 'SALOON' as unknown as LocationType
      };
      
      // Create state with the properly typed story point
      const state: NarrativeState = {
        ...mockNarrativeState,
        currentStoryPoint: dialogueStoryPoint
      };
      
      const result = service.detectDecisionPoint(state, mockCharacter);
      
      expect(result.shouldPresent).toBe(true);
      expect(result.score).toBeGreaterThan(0.3);
      expect(result.reason).toContain('Narrative context indicates decision point');
    });
    
    it('should respect minimum decision interval', () => {
      // Create service with a longer interval
      const intervalService = new DecisionService({
        minDecisionInterval: 60000, // 1 minute
        relevanceThreshold: 0.3
      });
      
      // Set the last decision time manually
      intervalService.lastDecisionTime = Date.now();
      
      // Run the detection again - should fail due to timing
      const result = intervalService.detectDecisionPoint(mockNarrativeState, mockCharacter);
      
      expect(result.shouldPresent).toBe(false);
      expect(result.reason).toContain('Too soon since last decision');
    });
  });
  
  describe('generateDecision', () => {
    it('should generate a valid decision', async () => {
      const decision = await service.generateDecision(mockNarrativeState, mockCharacter);
      
      expect(decision.decisionId).toBe('decision-123');
      expect(decision.options.length).toBe(2);
      expect(decision.prompt).toBe('How do you respond to the sheriff?');
      expect(decision.relevanceScore).toBe(0.85);
      expect(decision.metadata.importance).toBe('significant');
    });
    
    it('should call the AI service with the correct prompt', async () => {
      await service.generateDecision(mockNarrativeState, mockCharacter);
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      const [url, requestOptions] = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      expect(url).toBe('https://test-endpoint.com');
      
      if (requestOptions && requestOptions.body) {
        const body = JSON.parse(requestOptions.body as string);
        expect(body.model).toBe('test-model');
        expect(body.messages[1].content).toContain('NARRATIVE CONTEXT');
        expect(body.messages[1].content).toContain('CHARACTER INFORMATION');
        expect(body.messages[1].content).toContain('GAME STATE');
      }
    });
    
    it('should handle API errors gracefully', async () => {
      
      // Reset fetch mock to ensure we get a clean state
      (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
      
      // Set flag to indicate this is the API error test
      (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = true;
      
      // Mock the fetch to throw the specific error
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
        code: 'AI_SERVICE_ERROR',
        message: 'API connection error',
        retryable: true
      } as ServiceError);
      
      console.log('[TEST] Mock setup complete, calling generateDecision...');
      
      try {
        await service.generateDecision(mockNarrativeState, mockCharacter);
        console.log('[TEST] Failed: generateDecision did not throw an error');
        expect(true).toBe(false);
      } catch (error) {
        console.log('[TEST] Caught error:', error);
        const serviceError = error as ServiceError;
        console.log('[TEST] Error code:', serviceError.code);
        console.log('[TEST] Error message:', serviceError.message);
        expect(serviceError.code).toBe('AI_SERVICE_ERROR');
        expect(serviceError.message).toBe('API connection error');
      }
    });
  });
  
  describe('toPlayerDecision', () => {
    it('should convert AI decision to player decision format', async () => {
      // Mock a specific decision response for this test with proper types
      const aiDecision = {
        decisionId: 'decision-123',
        prompt: 'How do you respond to the sheriff?',
        options: [
          {
            id: 'option-1',
            text: 'Tip your hat and smile',
            confidence: 0.9,
            traits: ['friendly', 'calm'],
            potentialOutcomes: ['Might ease tensions', 'Sheriff could warm up to you'],
            impact: 'Establish yourself as non-threatening'
          },
          {
            id: 'option-2',
            text: 'Ignore him and head to the bar',
            confidence: 0.7,
            traits: ['independent', 'aloof'],
            potentialOutcomes: ['Might appear suspicious', 'Sheriff could watch you closely'],
            impact: 'Establish yourself as independent but possibly suspicious'
          }
        ],
        relevanceScore: 0.85,
        metadata: {
          narrativeImpact: 'Sets the tone for town interactions',
          themeAlignment: 'Classic western standoff tension',
          pacing: 'medium' as const,
          importance: 'significant' as DecisionImportance
        }
      };
      
      const playerDecision = service.toPlayerDecision(aiDecision, 'SALOON');
      
      expect(playerDecision.id).toBe('decision-123');
      expect(playerDecision.prompt).toBe('How do you respond to the sheriff?');
      expect(playerDecision.options).toHaveLength(2);
      expect(playerDecision.options[0].id).toBe('option-1');
      expect(playerDecision.options[0].text).toBe('Tip your hat and smile');
      expect(playerDecision.options[0].tags).toContain('friendly');
      expect(playerDecision.location).toBe('SALOON');
      expect(playerDecision.importance).toBe('significant');
      expect(playerDecision.aiGenerated).toBe(true);
      expect(playerDecision.timestamp).toBeDefined();
    });
  });
  
  describe('recordDecision', () => {
    it('should record decisions and include them in future prompts', async () => {
      // Reset fetch mock to ensure we get a clean state
      (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      } as Response);
      
      // Record a decision
      service.recordDecision('decision-1', 'option-1', 'You greeted the sheriff politely.');
      
      // Generate a new decision after recording
      await service.generateDecision(mockNarrativeState, mockCharacter);
      
      // Check that the fetch was called with previous decision included
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const requestOptions = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0][1];
      
      if (requestOptions && requestOptions.body) {
        const body = JSON.parse(requestOptions.body as string);
        const prompt = body.messages[1].content;
        
        expect(prompt).toContain('PREVIOUS DECISIONS');
        expect(prompt).toContain('You greeted the sheriff politely');
      }
    });
  });
});

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
      // Use toContain for string matching
      expect(prompt.characterInfo.relationships.Sheriff).toContain('unfriendly');
      expect(prompt.characterInfo.relationships.Bartender).toContain('friendly');
    });

    it('should include more detailed recent events', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check that recent events include more entries and proper formatting
      expect(prompt.gameState.recentEvents.length).toBeGreaterThanOrEqual(5);
      // Use toContain for array testing
      expect(prompt.gameState.recentEvents).toContain('You decided to head to the saloon for information.');
      expect(prompt.gameState.recentEvents).toContain('The bartender greeted you with a nod.');
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