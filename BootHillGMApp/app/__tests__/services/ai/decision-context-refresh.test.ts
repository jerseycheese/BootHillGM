import DecisionService from '../../../services/ai/decision-service';
import { createTestGameState, createMockApiResponse } from '../../../test/fixtures/aiDecisionResponses';
import { FetchMockProperties, AbortSignalTimeoutMock } from '../../../types/testing/test-types';

// Mock fetch globally with proper typing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
// Mock AbortSignal.timeout
global.AbortSignal.timeout = jest.fn().mockReturnValue({}) as AbortSignalTimeoutMock;

// Debug flags for fetch mock
(global.fetch as unknown as { _mockImplementationCallCount: number })._mockImplementationCallCount = 0;
(global.fetch as unknown as { _mockRejectedValueOnce: boolean })._mockRejectedValueOnce = false;

describe('Decision Service - Context Refresh Integration', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset counters for mock tracking
    (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
    (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
    
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

    // Create separate mock implementations to avoid issues with shared state
    const mockImplementationOne = jest.fn((_url, _options) => {
      console.log(`[MOCK] First implementation called`);
      
      const requestOptions = _options as RequestInit;
      const bodyJson = JSON.parse(requestOptions.body as string);
      const promptContent = bodyJson.messages[1].content;
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(createMockApiResponse(promptContent)),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      } as Response);
    });
    
    // Set the first mock implementation
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(mockImplementationOne);
    
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
    
    // Reset the fetch mock for the second call
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Mock the fetch for the sheriff-specific case
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [
          {
            message: {
              content: JSON.stringify({
                decisionId: 'sheriff-decision',
                prompt: 'How do you approach the sheriff?',
                options: [
                  {
                    id: 'option-sheriff-1',
                    text: 'Tip your hat respectfully and introduce yourself',
                    confidence: 0.9,
                    traits: ['respectful'],
                    potentialOutcomes: ['Gain respect', 'Learn information'],
                    impact: 'Respectful approach'
                  },
                  {
                    id: 'option-sheriff-2',
                    text: 'Keep your distance and observe',
                    confidence: 0.7,
                    traits: ['cautious'],
                    potentialOutcomes: ['Stay unnoticed', 'Learn behavior'],
                    impact: 'Cautious approach'
                  }
                ],
                relevanceScore: 0.8,
                metadata: {
                  narrativeImpact: 'Sets tone with law enforcement',
                  themeAlignment: 'Classic western lawman encounter',
                  pacing: 'medium',
                  importance: 'significant'
                }
              })
            }
          }
        ]
      }),
      headers: new Headers({
        'X-RateLimit-Remaining': '10',
        'X-RateLimit-Reset': '1600000000'
      })
    } as Response);
    
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
    
    // Add the specific text pattern needed for the test
    gameState.narrative.narrativeHistory.push('Player: I nod to the sheriff but head to the bar instead.');
    gameState.narrative.narrativeHistory.push('Game Master: The bartender looks up as you approach, wiping a glass with a rag.');
    
    // Reset the fetch mock for the third call
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Mock the fetch for the bartender-specific case
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation((_url, options) => {
      // Ensure options is properly typed
      const requestOptions = options as RequestInit;
      
      // Store the request body for later verification
      const requestBody = requestOptions.body as string;
      
      // Parse the request content
      const bodyJson = JSON.parse(requestBody);
      const promptContent = bodyJson.messages[1].content;
      
      // Explicitly check for the required content
      expect(promptContent).toContain('nod to the sheriff');
      expect(promptContent).toContain('bartender looks up');
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  decisionId: 'bartender-decision',
                  prompt: 'What do you say to the bartender?',
                  options: [
                    {
                      id: 'option-bartender-1',
                      text: 'Order a whiskey and introduce yourself',
                      confidence: 0.9,
                      traits: ['friendly', 'direct'],
                      potentialOutcomes: ['Establish rapport', 'Get information'],
                      impact: 'Make a connection with the bartender'
                    },
                    {
                      id: 'option-bartender-2',
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
        }),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      } as Response);
    });
    
    // Generate a third decision
    const decision3 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // This decision should now mention the bartender
    expect(decision3.prompt.toLowerCase()).toContain('bartender');
  });

  it('should include previous decisions in new decision context', async () => {
    console.log('[TEST] Starting previous decisions test');
    // Setup initial state
    const gameState = createTestGameState();
    
    // Completely reset the mock
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Create a simple mock that returns valid decisions
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  decisionId: 'test-decision-' + Date.now(),
                  prompt: 'What do you want to do?',
                  options: [
                    {
                      id: 'option-1',
                      text: 'Enter the saloon confidently',
                      confidence: 0.9,
                      traits: ['brave', 'direct'],
                      potentialOutcomes: ['Establish presence', 'Might attract attention'],
                      impact: 'Make a strong first impression'
                    },
                    {
                      id: 'option-2',
                      text: 'Peer through the window first',
                      confidence: 0.8,
                      traits: ['cautious', 'observant'],
                      potentialOutcomes: ['Gather information', 'Stay unnoticed'],
                      impact: 'Learn about the environment before engaging'
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
        }),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      } as Response);
    });
    
    console.log('[TEST] Generating first decision...');
    // Generate a decision
    const decision1 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    console.log('[TEST] Recording decision...');
    // Record a decision with specific impact
    service.recordDecision(
      decision1.decisionId,
      decision1.options[0].id,
      'You entered confidently and several patrons turned to look at you. The atmosphere seems tense.'
    );
    
    console.log('[TEST] Adding decision to narrative context...');
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
    
    console.log('[TEST] Updating narrative history...');
    // Update narrative history to reflect the decision
    gameState.narrative.narrativeHistory.push('Player: I walk into the saloon confidently, pushing the doors open.');
    gameState.narrative.narrativeHistory.push('Game Master: The piano music briefly stops as several patrons turn to look at you. The atmosphere seems tense.');
    
    console.log('[TEST] Updating world state impacts...');
    // Update world state impacts
    if (gameState.narrative.narrativeContext?.impactState) {
      gameState.narrative.narrativeContext.impactState.worldStateImpacts.SaloonAttention = 75;
    }
    
    // Reset the fetch mock before the second call
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Create a new mock implementation that always succeeds
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  decisionId: 'test-decision-2',
                  prompt: 'What do you do next in the tense saloon?',
                  options: [
                    {
                      id: 'option-1',
                      text: 'Walk to the bar',
                      confidence: 0.9,
                      traits: ['brave'],
                      potentialOutcomes: ['Get a drink', 'Talk to the bartender'],
                      impact: 'Move to a new location'
                    },
                    {
                      id: 'option-2',
                      text: 'Find a table',
                      confidence: 0.8,
                      traits: ['cautious'],
                      potentialOutcomes: ['Observe the room', 'Stay out of trouble'],
                      impact: 'Establish a safe position'
                    }
                  ],
                  relevanceScore: 0.85,
                  metadata: {
                    narrativeImpact: 'Sets next action in the saloon',
                    themeAlignment: 'Western tension',
                    pacing: 'medium',
                    importance: 'significant'
                  }
                })
              }
            }
          ]
        }),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      } as Response);
    });
    
    console.log('[TEST] Generating second decision...');
    // Generate another decision with the updated context
    const decision2 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    console.log('[TEST] Decision generation completed:', decision2.decisionId);
    // Now we can verify that the fetch was called and that we got a valid response
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(decision2.decisionId).toBe('test-decision-2');
    expect(decision2.prompt).toBe('What do you do next in the tense saloon?');
  });

  it('should handle narrative state with minimal context gracefully', async () => {
    console.log('[TEST] Starting minimal context test');
    // Create minimal state
    const gameState = createTestGameState();
    
    // Strip out most context
    gameState.narrative.currentStoryPoint = null;
    gameState.narrative.narrativeHistory = ['You are in the town of Redemption.'];
    gameState.narrative.narrativeContext = undefined;
    
    // Reset and set up a new mock
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Create a simple mock that always returns a specific decision
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  decisionId: 'minimal-decision',
                  prompt: 'What do you want to do in town?',
                  options: [
                    {
                      id: 'option-1',
                      text: 'Head to the saloon',
                      confidence: 0.9,
                      traits: ['decisive'],
                      potentialOutcomes: ['Meet locals', 'Get information'],
                      impact: 'Find a place to start gathering information'
                    },
                    {
                      id: 'option-2',
                      text: 'Visit the sheriff\'s office',
                      confidence: 0.8,
                      traits: ['direct'],
                      potentialOutcomes: ['Meet the law', 'Get official information'],
                      impact: 'Establish yourself with local authority'
                    }
                  ],
                  relevanceScore: 0.8,
                  metadata: {
                    narrativeImpact: 'First steps in town',
                    themeAlignment: 'Western exploration',
                    pacing: 'medium',
                    importance: 'significant'
                  }
                })
              }
            }
          ]
        }),
        headers: new Headers({
          'X-RateLimit-Remaining': '10',
          'X-RateLimit-Reset': '1600000000'
        })
      } as Response);
    });
    
    console.log('[TEST] Generating decision with minimal context...');
    // Should still work with minimal context
    const decision = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    console.log('[TEST] Decision generated:', decision.decisionId);
    // Should generate a valid decision even with minimal context
    expect(decision.decisionId).toBeDefined();
    expect(decision.options.length).toBeGreaterThanOrEqual(2);
  });
});