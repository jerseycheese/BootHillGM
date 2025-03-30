/**
 * Test for handling minimal context in the Decision Service
 * Tests that the service can function with limited narrative information
 */
import DecisionService from '../../../services/ai/decision-service';
import { 
  setupFetchMocks, 
  resetFetchMocks, 
  createMockResponse 
} from '../../../test/services/ai/utils/fetch-mock-utils';
import { 
  createTestGameState, 
  createTestDecisionService
} from '../../../test/services/ai/fixtures/decisions-test-fixtures';

// Set up mocks before tests
setupFetchMocks();

describe('Decision Service - Minimal Context Handling', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    resetFetchMocks();
    service = createTestDecisionService();
  });

  it('should handle narrative state with minimal context gracefully', async () => {
    // Create minimal state
    const gameState = createTestGameState();
    
    // Strip out most context
    gameState.narrative.currentStoryPoint = null;
    gameState.narrative.narrativeHistory = ['You are in the town of Redemption.'];
    gameState.narrative.narrativeContext = undefined;
    
    // Reset and set up a new mock
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Create a simple mock that always returns a specific decision
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => 
      createMockResponse({
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
      })
    );
    
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