import { AIClient, DecisionHistoryManager } from '../../../../types/decision-service/decision-service.types';
import { AbortSignalTimeoutMock, FetchMockProperties } from '../../../../types/testing/test-types';

/**
 * Sets up mock fetch for testing
 * Configures global fetch and AbortSignal with proper typing
 */
export const setupMockFetch = (): void => {
  global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  // Mock AbortSignal.timeout
  global.AbortSignal.timeout = jest.fn().mockReturnValue({}) as AbortSignalTimeoutMock;

  // Add debug properties to fetch mock for error testing
  (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
  (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
};

/**
 * Creates a mock AIClient for testing
 * @returns A mocked AIClient with pre-configured responses
 */
export const createMockAIClient = (): jest.Mocked<AIClient> => ({
  makeRequest: jest.fn(),
  getRateLimitRemaining: jest.fn().mockReturnValue(10),
  getRateLimitResetTime: jest.fn().mockReturnValue(Date.now() + 60000)
});

/**
 * Creates a mock DecisionHistoryManager for testing
 * @returns A mocked DecisionHistoryManager with pre-configured responses
 */
export const createMockHistoryManager = (): jest.Mocked<DecisionHistoryManager> => ({
  getDecisionHistory: jest.fn().mockReturnValue([
    {
      prompt: 'How do you respond to the sheriff?',
      choice: 'Tip your hat respectfully',
      outcome: 'The sheriff nods back, seemingly more at ease.',
      timestamp: Date.now() - 100000
    }
  ]),
  recordDecision: jest.fn()
});