import { AbortSignalTimeoutMock, FetchMockProperties } from '../../../../types/testing/test-types';

/**
 * Sets up the global test environment for decision service tests
 * Initializes mock fetch and related properties
 */
export const setupTestEnvironment = (): void => {
  // Mock fetch globally with proper typing
  global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  // Mock AbortSignal.timeout
  global.AbortSignal.timeout = jest.fn().mockReturnValue({}) as AbortSignalTimeoutMock;

  // Add debug properties to fetch mock for error testing
  (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
  (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
};

/**
 * Resets all mocks between tests
 * Should be called in beforeEach for consistent test isolation
 */
export const resetMocks = (): void => {
  jest.clearAllMocks();
  
  // Reset counter for tracking mock implementation calls
  (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
  (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
};