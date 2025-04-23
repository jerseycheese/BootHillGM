import DecisionService from '../../../../services/ai/decision-service';
import { DecisionImportance } from '../../../../types/narrative/decision.types';

describe('DecisionService - Conversion Functions', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize service with test configuration
    service = new DecisionService({
      minDecisionInterval: 0, // No delay for testing
      relevanceThreshold: 0.3
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
      // Mock fetch for this specific test
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                decisionId: 'decision-test',
                prompt: 'Test prompt',
                options: [],
                relevanceScore: 0.5,
                metadata: {
                  narrativeImpact: 'Test',
                  themeAlignment: 'Test',
                  pacing: 'medium',
                  importance: 'minor'
                }
              })
            }
          }]
        }),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      } as Response);
      
      // Record a decision
      service.recordDecision('decision-1', 'option-1', 'You greeted the sheriff politely.');
      
      // Create mock narrative state and character
      const mockState = {
        currentStoryPoint: {
          id: 'test',
          title: 'Test',
          content: 'Test content',
          type: 'narrative'
        },
        narrativeHistory: [],
        narrativeContext: {
          worldContext: '',
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
        displayMode: 'standard',
        context: ""
      };
      
      const mockChar = {
        id: 'test',
        name: 'Test',
        isNPC: false,
        isPlayer: true,
        inventory: { items: [] },
        attributes: {
          bravery: 5,
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          strength: 5,
          baseStrength: 5,
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
      
      // Generate a new decision after recording
      await service.generateDecision(mockState, mockChar);
      
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