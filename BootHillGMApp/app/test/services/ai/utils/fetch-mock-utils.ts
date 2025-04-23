/**
 * Utility functions for mocking fetch in Decision Service tests
 */
import { FetchMockProperties, AbortSignalTimeoutMock } from '../../../../types/testing/test-types';

/**
 * Set up global fetch mocks for testing
 */
export const setupFetchMocks = (): void => {
  // Mock fetch globally with proper typing
  global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  // Mock AbortSignal.timeout
  global.AbortSignal.timeout = jest.fn().mockReturnValue({ /* Intentionally empty */ }) as AbortSignalTimeoutMock;

  // Initialize debug flags for fetch mock
  (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
  (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
};

/**
 * Reset all fetch mocks between tests
 */
export const resetFetchMocks = (): void => {
  jest.clearAllMocks();
  
  // Reset counters for mock tracking
  (global.fetch as unknown as FetchMockProperties)._mockImplementationCallCount = 0;
  (global.fetch as unknown as FetchMockProperties)._mockRejectedValueOnce = false;
};

/**
 * Create a standard mock response for the fetch API
 * @param responseBody The body to include in the response
 * @returns A mocked Response object wrapped in a Promise
 */
export const createMockResponse = (responseBody: unknown): Promise<Response> => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(responseBody),
    headers: new Headers({
      'X-RateLimit-Remaining': '10',
      'X-RateLimit-Reset': '1600000000'
    })
  } as Response);
};

/**
 * Create a mock implementation that inspects the fetch request
 * @param responseCallback Function that receives the request details and returns a response
 * @returns A jest mock implementation function
 */
export const createRequestInspector = (
  responseCallback: (url: string, options: RequestInit | undefined) => unknown
): jest.MockedFunction<typeof fetch> => {
  return jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : 
                input instanceof URL ? input.toString() : 
                (input as Request).url;
    const requestOptions = init || { /* Intentionally empty */ } as RequestInit;
    const responseBody = responseCallback(url, requestOptions);
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(responseBody),
      headers: new Headers({
        'X-RateLimit-Remaining': '10',
        'X-RateLimit-Reset': '1600000000'
      })
    } as Response);
  });
};