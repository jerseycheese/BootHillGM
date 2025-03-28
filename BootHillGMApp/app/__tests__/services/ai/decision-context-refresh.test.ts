import { DecisionService } from '../../../services/ai/decision-service';
import { createTestGameState, createMockApiResponse } from '../../../test/fixtures/aiDecisionResponses';

// Mock fetch globally
global.fetch = jest.fn();
// Mock AbortSignal.timeout
global.AbortSignal.timeout = jest.fn().mockReturnValue({});

describe('Decision Service - Context Refresh Integration', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
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

  it('should generate decisions aware of recent narrative changes', async () => {
    // Setup initial state
    const gameState = createTestGameState();
    
    // Mock API response based on prompt content
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      const bodyJson = JSON.parse(options.body);
      const promptContent = bodyJson.messages[1].content;
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(promptContent)),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      });
    });
    
    // Generate a decision
    const decision1 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // Should be a generic decision since no specific context yet
    expect(decision1.prompt).not.toContain('sheriff');
    expect(decision1.prompt).not.toContain('bartender');
    
    // Record a decision about the sheriff
    service.recordDecision(
      decision1.decisionId,
      decision1.options[0].id,
      'You decided to enter the saloon and look for the sheriff.'
    );
    
    // Update narrative history to include the sheriff
    gameState.narrative.narrativeHistory.push('Player: I enter the saloon and look for the sheriff.');
    gameState.narrative.narrativeHistory.push('Game Master: You see the sheriff sitting at a corner table, watching the room carefully.');
    
    // Generate another decision
    const decision2 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // Now the decision should be aware of the sheriff
    expect(decision2.prompt.toLowerCase()).toContain('sheriff');
    
    // Check that options are contextual to the sheriff
    const sheriffRelatedOption = decision2.options.find(
      option => option.text.toLowerCase().includes('sheriff') || 
                option.text.toLowerCase().includes('hat') ||
                option.text.toLowerCase().includes('robberies')
    );
    expect(sheriffRelatedOption).toBeDefined();
    
    // Update narrative again to switch context to bartender
    gameState.narrative.narrativeHistory.push('Player: I nod to the sheriff but head to the bar instead.');
    gameState.narrative.narrativeHistory.push('Game Master: The bartender looks up as you approach, wiping a glass with a rag.');
    
    // Explicitly modify the API response mock to ensure the bartender is included
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      const bodyJson = JSON.parse(options.body);
      const promptContent = bodyJson.messages[1].content;
      
      // Force the bartender mention in the response if it's in the prompt content
      const forceBartenderResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                decisionId: `decision-${Date.now()}`,
                prompt: 'What do you say to the bartender?',
                options: [
                  {
                    id: 'option-1',
                    text: 'Order a whiskey and introduce yourself',
                    confidence: 0.9,
                    traits: ['friendly', 'direct'],
                    potentialOutcomes: ['Establish rapport', 'Get information'],
                    impact: 'Make a connection with the bartender'
                  },
                  {
                    id: 'option-2',
                    text: 'Ask discreetly about the sheriff',
                    confidence: 0.8,
                    traits: ['cautious', 'strategic'],
                    potentialOutcomes: ['Learn about local politics', 'Stay low profile'],
                    impact: 'Gain information without drawing attention'
                  }
                ],
                relevanceScore: 0.85,
                metadata: {
                  narrativeImpact: 'Establishes relationship with key information source',
                  themeAlignment: 'Classic western information gathering',
                  pacing: 'medium',
                  importance: 'significant'
                }
              })
            }
          }
        ]
      };
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(
          promptContent.toLowerCase().includes('bartender') 
            ? forceBartenderResponse 
            : createMockApiResponse(promptContent)
        ),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      });
    });
    
    // Generate a third decision
    const decision3 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // This decision should now mention the bartender
    expect(decision3.prompt.toLowerCase()).toContain('bartender');
    
    // Check the most recent prompt sent to the API
    const lastCall = (global.fetch as jest.Mock).mock.calls.slice(-1)[0];
    const lastOptions = lastCall[1];
    const lastBody = JSON.parse(lastOptions.body);
    const lastPrompt = lastBody.messages[1].content;
    
    // Verify the prompt contains our most recent updates
    expect(lastPrompt).toContain('nod to the sheriff');
    expect(lastPrompt).toContain('bartender looks up');
  });

  it('should include previous decisions in new decision context', async () => {
    // Setup initial state
    const gameState = createTestGameState();
    
    // Mock API response based on prompt content
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      const bodyJson = JSON.parse(options.body);
      const promptContent = bodyJson.messages[1].content;
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(promptContent)),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      });
    });
    
    // Generate a decision
    const decision1 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // Record a decision with specific impact
    service.recordDecision(
      decision1.decisionId,
      decision1.options[0].id,
      'You entered confidently and several patrons turned to look at you. The atmosphere seems tense.'
    );
    
    // Add the decision to the narrative context
    if (gameState.narrative.narrativeContext) {
      gameState.narrative.narrativeContext.decisionHistory = [
        {
          decisionId: decision1.decisionId,
          selectedOptionId: decision1.options[0].id,
          timestamp: Date.now() - 30000,
          narrative: 'You entered confidently and several patrons turned to look at you. The atmosphere seems tense.',
          impactDescription: 'Your entrance has been noticed by everyone in the saloon.',
          tags: ['entrance', 'attention'],
          relevanceScore: 8
        }
      ];
    }
    
    // Update narrative history to reflect the decision
    gameState.narrative.narrativeHistory.push('Player: I walk into the saloon confidently, pushing the doors open.');
    gameState.narrative.narrativeHistory.push('Game Master: The piano music briefly stops as several patrons turn to look at you. The atmosphere seems tense.');
    
    // Update world state impacts
    if (gameState.narrative.narrativeContext?.impactState) {
      gameState.narrative.narrativeContext.impactState.worldStateImpacts.SaloonAttention = 75;
    }
    
    // Generate another decision and safely ignore it for ESLint
    await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // Verify the latest API call
    const lastCall = (global.fetch as jest.Mock).mock.calls.slice(-1)[0];
    const lastOptions = lastCall[1];
    const lastBody = JSON.parse(lastOptions.body);
    const lastPrompt = lastBody.messages[1].content;
    
    // Context should include the previous decision
    expect(lastPrompt).toContain(decision1.decisionId);
    
    // Context should include recent narrative updates
    expect(lastPrompt).toContain('piano music briefly stops');
    
    // Context should include world state updates
    expect(lastPrompt).toContain('SaloonAttention');
    expect(lastPrompt).toContain('75');
  });

  it('should handle narrative state with minimal context gracefully', async () => {
    // Create minimal state
    const gameState = createTestGameState();
    
    // Strip out most context
    gameState.narrative.currentStoryPoint = null;
    gameState.narrative.narrativeHistory = ['You are in the town of Redemption.'];
    gameState.narrative.narrativeContext = undefined;
    
    // Mock API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createMockApiResponse('minimal context')),
      headers: new Headers({
        'X-RateLimit-Remaining': '10',
        'X-RateLimit-Reset': '1600000000'
      })
    });
    
    // Should still work with minimal context
    const decision = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // Should generate a valid decision even with minimal context
    expect(decision.decisionId).toBeDefined();
    expect(decision.options.length).toBeGreaterThanOrEqual(2);
  });
});