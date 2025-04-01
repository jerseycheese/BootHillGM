/**
 * Test for narrative context awareness in the Decision Service
 * Tests that decisions update based on changes in the narrative
 */
import DecisionService from '../../../services/ai/decision-service';
import { 
  setupFetchMocks, 
  resetFetchMocks, 
  createRequestInspector 
} from '../../../test/services/ai/utils/fetch-mock-utils';
import { 
  createTestGameState, 
  createMockApiResponse, 
  createTestDecisionService,
  createSheriffResponse,
  createBartenderResponse
} from '../../../test/services/ai/fixtures/decisions-test-fixtures';

// Set up mocks before tests
setupFetchMocks();

describe('Decision Service - Context Refresh', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    resetFetchMocks();
    service = createTestDecisionService();
  });

  it('should generate decisions aware of recent narrative changes', async () => {
    // Setup initial state
    const gameState = createTestGameState();

    // Create separate mock implementations to avoid issues with shared state
    const mockImplementationOne = createRequestInspector((url, options) => {
      
      const requestOptions = options as RequestInit;
      const bodyJson = JSON.parse(requestOptions.body as string);
      const promptContent = bodyJson.messages[1].content;
      
      return createMockApiResponse(promptContent);
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
      json: () => Promise.resolve(createSheriffResponse()),
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
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url, options) => {
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
        json: () => Promise.resolve(createBartenderResponse()),
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
});