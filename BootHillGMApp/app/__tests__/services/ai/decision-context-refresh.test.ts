/**
 * Decision Service - Context Refresh Integration Tests
 * 
 * Tests the decision service's ability to maintain and refresh context
 * across multiple decisions.
 */

import { FetchMockProperties, AbortSignalTimeoutMock } from '../../../types/testing/test-types';
import { createTestGameState } from '../../../test/fixtures/aiDecisionResponses';
import { createTestDecisionService } from '../../../test/services/ai/fixtures/decisions-test-fixtures';
import DecisionService from '../../../services/ai/decision-service';

// Import test helpers from the app/test/helpers directory
import {
  setupMocksForNarrativeChangesTest,
  updateNarrativeWithSheriffContext,
  mockFetchForSheriffDecision,
  verifySheriffDecisionContext,
  updateNarrativeWithBartenderContext,
  resetAndSetupBartenderMock,
  setupFetchMockForDecisionHistoryTest,
  recordDecisionWithImpact,
  resetAndSetupSecondDecisionMock,
  verifySecondDecisionResponse,
  createMinimalGameState,
  setupMockForMinimalContextTest,
  verifyMinimalContextDecision
} from '../../../test/helpers/decision-context.helpers';

// Flag to control test debugging output
const DEBUG_TESTS = false;

/**
 * Helper function for conditional logging to avoid ESLint errors with expressions
 * @param message Message to log
 * @param data Optional data to log
 */
function conditionalLog(message: string, data?: unknown): void {
  if (DEBUG_TESTS) {
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}

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
    service = createTestDecisionService();
  });

  it('should generate decisions aware of recent narrative changes', async () => {
    // Setup initial state
    const gameState = createTestGameState();
    const { mockImplementationOne } = setupMocksForNarrativeChangesTest();
    
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
    updateNarrativeWithSheriffContext(gameState);
    
    // Reset the fetch mock for the second call
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
    
    // Mock the fetch for the sheriff-specific case
    mockFetchForSheriffDecision();
    
    // Generate another decision
    const decision2 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // Verify sheriff-related context is reflected in the decision
    verifySheriffDecisionContext(decision2);
    
    // Update narrative to include bartender context
    updateNarrativeWithBartenderContext(gameState);
    
    // Reset and setup fetch mock for bartender context
    resetAndSetupBartenderMock();
    
    // Generate a third decision
    const decision3 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    // This decision should now mention the bartender
    expect(decision3.prompt.toLowerCase()).toContain('bartender');
  });

  it('should include previous decisions in new decision context', async () => {
    conditionalLog('Starting previous decisions test');
    
    // Setup initial state
    const gameState = createTestGameState();
    
    // Configure fetch mock for decisions test
    setupFetchMockForDecisionHistoryTest();
    
    conditionalLog('Generating first decision...');
    // Generate a decision
    const decision1 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    conditionalLog('Recording decision...');
    // Record a decision with specific impact
    recordDecisionWithImpact(service, decision1, gameState);
    
    // Reset the fetch mock before the second call
    resetAndSetupSecondDecisionMock();
    
    conditionalLog('Generating second decision...');
    // Generate another decision with the updated context
    const decision2 = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    conditionalLog('Decision generation completed:', decision2.decisionId);
    // Verify the fetch was called and we got a valid response
    verifySecondDecisionResponse(decision2);
  });

  it('should handle narrative state with minimal context gracefully', async () => {
    conditionalLog('Starting minimal context test');
    
    // Create minimal state with stripped context
    const gameState = createMinimalGameState();
    
    // Setup mock for minimal context test
    setupMockForMinimalContextTest();
    
    conditionalLog('Generating decision with minimal context...');
    // Should still work with minimal context
    const decision = await service.generateDecision(
      gameState.narrative, 
      gameState.character
    );
    
    conditionalLog('Decision generated:', decision.decisionId);
    // Verify valid decision generation with minimal context
    verifyMinimalContextDecision(decision);
  });
});