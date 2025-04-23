/**
 * Decision Context Test Helpers
 * 
 * Helper functions and mocks for decision context refresh integration tests.
 * This file is not a test file, but a utility file for tests.
 */

// Add Jest types to avoid TypeScript errors with Jest globals
/// <reference types="jest" />

import { DecisionResponse } from '../../types/ai-service.types';
import { FetchMockProperties } from '../../types/testing/test-types';
import DecisionService from '../../services/ai/decision-service';

// Import common fixtures from test directories
import { 
  createTestGameState, 
  createMockApiResponse,
} from '../fixtures/aiDecisionResponses';

// Import decision-specific fixtures
import {
  createSheriffResponse,
  createBartenderResponse,
  createGenericResponse
} from '../services/ai/fixtures/decisions-test-fixtures';

// Constants for test data
const TEST_RATE_LIMIT = {
  remaining: '10',
  reset: '1600000000'
};

/**
 * Set up the test environment by resetting mock counters
 */
export function setupTestEnvironment() {
  jest.clearAllMocks();
  
  // Reset counters for mock tracking
  (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
  (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
}

/**
 * Create a mock implementation for fetch
 * @param handler Custom handler function for the fetch mock
 * @returns Mocked fetch implementation
 */
export function createFetchMock(handler: (url: string, options: RequestInit) => Promise<Response>) {
  return (url: string, options: RequestInit) => handler(url, options);
}

/**
 * Setup mocks for narrative changes test
 * @returns Object containing mock implementations
 */
export function setupMocksForNarrativeChangesTest() {
  const mockImplementationOne = jest.fn((_url, _options) => {
    // Debug log removed
    
    const requestOptions = _options as RequestInit;
    const bodyJson = JSON.parse(requestOptions.body as string);
    const promptContent = bodyJson.messages[1].content;
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(createMockApiResponse(promptContent)),
      headers: new Headers({
        'X-RateLimit-Remaining': TEST_RATE_LIMIT.remaining,
        'X-RateLimit-Reset': TEST_RATE_LIMIT.reset
      })
    } as Response);
  });
  
  return { mockImplementationOne };
}

/**
 * Safely update narrative context in a game state
 * @param gameState Current game state
 * @param updater Function to update the context
 */
export function updateNarrativeContext(
  gameState: ReturnType<typeof createTestGameState>, 
  updater: (context: NonNullable<typeof gameState.narrative.narrativeContext>) => void
) {
  if (gameState.narrative.narrativeContext) {
    updater(gameState.narrative.narrativeContext);
  }
}

/**
 * Update narrative with sheriff context
 * @param gameState Current game state to update
 */
export function updateNarrativeWithSheriffContext(gameState: ReturnType<typeof createTestGameState>) {
  gameState.narrative.narrativeHistory.push('Player: I enter the saloon and look for the sheriff.');
  gameState.narrative.narrativeHistory.push('Game Master: You see the sheriff sitting at a corner table, watching the room carefully.');
}

/**
 * Mock fetch for sheriff-specific decision case
 * 
 * Sets up a mock implementation of global.fetch that returns a sheriff-themed
 * decision response. This is used in the narrative context refresh test to
 * verify that decisions incorporate recent sheriff-related narrative events.
 */
export function mockFetchForSheriffDecision() {
  (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(createSheriffResponse()),
    headers: new Headers({
      'X-RateLimit-Remaining': TEST_RATE_LIMIT.remaining,
      'X-RateLimit-Reset': TEST_RATE_LIMIT.reset
    })
  } as Response);
}

/**
 * Verify sheriff-related context is reflected in the decision
 * @param decision Decision to verify
 */
export function verifySheriffDecisionContext(decision: DecisionResponse) {
  expect(decision.prompt.toLowerCase()).toContain('sheriff');
  
  const sheriffRelatedOption = decision.options.find(
    option => option.text.toLowerCase().includes('sheriff') || 
              option.text.toLowerCase().includes('hat') ||
              option.text.toLowerCase().includes('robberies')
  );
  expect(sheriffRelatedOption).toBeDefined();
}

/**
 * Update narrative with bartender context
 * @param gameState Current game state to update
 */
export function updateNarrativeWithBartenderContext(gameState: ReturnType<typeof createTestGameState>) {
  gameState.narrative.narrativeHistory.push('Player: I nod to the sheriff but head to the bar instead.');
  gameState.narrative.narrativeHistory.push('Game Master: The bartender looks up as you approach, wiping a glass with a rag.');
}

/**
 * Reset fetch mock and set up for bartender context
 * 
 * Sets up a mock implementation of global.fetch that returns a bartender-themed
 * decision response. This is used to verify that decisions incorporate recent
 * bartender-related narrative events.
 */
export function resetAndSetupBartenderMock() {
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
      json: () => Promise.resolve(createBartenderResponse()),
      headers: new Headers({
        'X-RateLimit-Remaining': TEST_RATE_LIMIT.remaining,
        'X-RateLimit-Reset': TEST_RATE_LIMIT.reset
      })
    } as Response);
  });
}

/**
 * Setup fetch mock for decision history test
 * 
 * Creates a mock implementation that returns valid decision responses
 * for testing decision history integration.
 */
export function setupFetchMockForDecisionHistoryTest() {
  // Completely reset the mock
  (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
  
  // Create a simple mock that returns valid decisions
  (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(createGenericResponse()),
      headers: new Headers({
        'X-RateLimit-Remaining': TEST_RATE_LIMIT.remaining,
        'X-RateLimit-Reset': TEST_RATE_LIMIT.reset
      })
    } as Response);
  });
}

/**
 * Record decision with impact in the game state
 * @param service Decision service instance
 * @param decision Decision to record
 * @param gameState Game state to update
 */
export function recordDecisionWithImpact(
  service: DecisionService, 
  decision: DecisionResponse, 
  gameState: ReturnType<typeof createTestGameState>
) {
  // Record a decision with specific impact
  service.recordDecision(
    decision.decisionId,
    decision.options[0].id,
    'You entered confidently and several patrons turned to look at you. The atmosphere seems tense.'
  );
  
  // Use the safe update function for narrative context
  updateNarrativeContext(gameState, (context) => {
    context.decisionHistory = [
      {
        decisionId: decision.decisionId,
        selectedOptionId: decision.options[0].id,
        timestamp: Date.now() - 30000,
        narrative: 'You entered confidently and several patrons turned to look at you. The atmosphere seems tense.',
        impactDescription: 'Your entrance has been noticed by everyone in the saloon.',
        tags: ['entrance', 'attention'],
        relevanceScore: 8
      }
    ];
  });
  
  // Update narrative history to reflect the decision
  gameState.narrative.narrativeHistory.push('Player: I walk into the saloon confidently, pushing the doors open.');
  gameState.narrative.narrativeHistory.push('Game Master: The piano music briefly stops as several patrons turn to look at you. The atmosphere seems tense.');
  
  // Update world state impacts using the safe update function
  updateNarrativeContext(gameState, (context) => {
    // Initialize impactState if it doesn't exist
    if (!context.impactState) {
      context.impactState = {
        worldStateImpacts: { /* Intentionally empty */ },
        reputationImpacts: { /* Intentionally empty */ },
        relationshipImpacts: { /* Intentionally empty */ },
        storyArcImpacts: { /* Intentionally empty */ },
        lastUpdated: Date.now()
      };
    }
    
    // Initialize worldStateImpacts if it doesn't exist
    if (!context.impactState.worldStateImpacts) {
      context.impactState.worldStateImpacts = { /* Intentionally empty */ };
    }
    
    // Now safely set the value
    context.impactState.worldStateImpacts.SaloonAttention = 75;
  });
}

/**
 * Reset and setup mock for second decision test
 * 
 * Creates a mock implementation that returns a specific decision response
 * with a fixed ID for verification in tests.
 */
export function resetAndSetupSecondDecisionMock() {
  // Reset the fetch mock before the second call
  (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
  
  // Create a new mock implementation that always succeeds
  (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(createGenericResponse('test-decision-2')),
      headers: new Headers({
        'X-RateLimit-Remaining': TEST_RATE_LIMIT.remaining,
        'X-RateLimit-Reset': TEST_RATE_LIMIT.reset
      })
    } as Response);
  });
}

/**
 * Verify the second decision response
 * @param decision Decision to verify
 */
export function verifySecondDecisionResponse(decision: DecisionResponse) {
  // Verify that the fetch was called and that we got a valid response
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(decision.decisionId).toBe('test-decision-2');
  expect(decision.prompt).toBe('What do you want to do?');
}

/**
 * Create a minimal game state
 * @returns Minimal game state for testing
 */
export function createMinimalGameState() {
  const gameState = createTestGameState();
  
  // Strip out most context
  gameState.narrative.currentStoryPoint = null;
  gameState.narrative.narrativeHistory = ['You are in the town of Redemption.'];
  gameState.narrative.narrativeContext = undefined;
  
  return gameState;
}

/**
 * Setup mock for minimal context test
 * 
 * Creates a mock implementation that returns a decision response
 * even with minimal context, to verify the service handles
 * limited context gracefully.
 */
export function setupMockForMinimalContextTest() {
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
        'X-RateLimit-Remaining': TEST_RATE_LIMIT.remaining,
        'X-RateLimit-Reset': TEST_RATE_LIMIT.reset
      })
    } as Response);
  });
}

/**
 * Verify decision generated with minimal context
 * @param decision Decision to verify
 */
export function verifyMinimalContextDecision(decision: DecisionResponse) {
  // Should generate a valid decision even with minimal context
  expect(decision.decisionId).toBeDefined();
  expect(decision.options.length).toBeGreaterThanOrEqual(2);
}