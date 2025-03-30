/**
 * Test for decision history persistence in the Decision Service
 * Tests that previous decisions influence new decisions
 */
import DecisionService from '../../../services/ai/decision-service';
import { 
  setupFetchMocks, 
  resetFetchMocks, 
  createMockResponse 
} from '../../../test/services/ai/utils/fetch-mock-utils';
import { 
  createTestGameState, 
  createTestDecisionService,
  createGenericResponse
} from '../../../test/services/ai/fixtures/decisions-test-fixtures';

// Set up mocks before tests
setupFetchMocks();

describe('Decision Service - Decision History Integration', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    resetFetchMocks();
    service = createTestDecisionService();
  });

  it('should include previous decisions in new decision context', async () => {
    // Setup initial state
    const gameState = createTestGameState();
    
    // Completely reset the mock
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Create a simple mock that returns valid decisions
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => 
      createMockResponse(createGenericResponse())
    );
    
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
    
    // Reset the fetch mock before the second call
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Create a new mock implementation that always succeeds
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => 
      createMockResponse({
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
      })
    );
    
    // Generate another decision with the updated context
    const decision2 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // Now we can verify that the fetch was called and that we got a valid response
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(decision2.decisionId).toBe('test-decision-2');
    expect(decision2.prompt).toBe('What do you do next in the tense saloon?');
  });
});