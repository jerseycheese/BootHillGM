/**
 * Test helpers for narrative-related hooks and utilities, specifically
 * focusing on AI context optimization tests.
 */
interface MockFunction {
  (...args: any[]): any;
  calls: any[][];
  returnValue: any;
  mockReturnValue(value: any): MockFunction;
  mockImplementation(implementation: (...args: any[]) => any): MockFunction;
  mockResolvedValue(value: any): MockFunction;
}



import { jest } from '@jest/globals';

// Create browser-compatible mock functions
const createMockFn = (): MockFunction => {
  const fn = (function(...args: any[]): any {
    if (typeof fn.calls !== 'undefined') {
      fn.calls.push(args);
    }
    return fn.returnValue;
  }) as MockFunction;
  
  fn.calls = [] as any[][];
  fn.returnValue = undefined;
  
  fn.mockReturnValue = function(value: any) {
    fn.returnValue = value;
    return fn;
  };
  
  fn.mockImplementation = function(implementation: (...args: any[]) => any): MockFunction {
    const originalFn = fn;
    const newFn = function(...args: any[]) {
      if (typeof newFn.calls !== 'undefined') {
        newFn.calls.push(args);
      }
      return implementation(...args);
    };
    newFn.calls = originalFn.calls;
    newFn.returnValue = originalFn.returnValue;
    newFn.mockReturnValue = originalFn.mockReturnValue;
    newFn.mockImplementation = originalFn.mockImplementation;
    newFn.mockResolvedValue = originalFn.mockResolvedValue;
    return newFn as MockFunction;
  };
  
  fn.mockResolvedValue = function(value: any) {
    return fn.mockImplementation(() => Promise.resolve(value));
  };
  
  return fn;
};

// Define mock functions using our browser-compatible implementation
export const mockUseNarrative = createMockFn();
export const mockGetAIResponse = createMockFn();
export const mockUseOptimizedNarrativeContext = createMockFn();
export const mockUseNarrativeContextSynchronization = createMockFn();
export const mockEstimateTokenCount = createMockFn();

const MOCK_OPTIMIZED_CONTEXT = "Recent events: You arrived in Tombstone.";

/**
 * Sets up the default return values for mocks. Call this in beforeEach.
 * Assumes jest.mock() calls are done in the test file itself.
 */
export const setupAIContextMocks = () => {
  // This function should only be called in a test environment
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    // Reset mock function calls and implementations
    jest.clearAllMocks();
    
    // Set default return values
    mockUseNarrative.mockReturnValue({
      state: {
        narrativeHistory: ["You entered Tombstone.", "You met the sheriff."],
        narrativeContext: {
          tone: 'serious',
          characterFocus: ['Sheriff'],
          themes: ['justice'],
          decisionHistory: [],
          worldContext: "Wild West setting in the 1880s",
          importantEvents: ["Gunfight at the O.K. Corral"]
        }
      },
      dispatch: createMockFn()
    });

    mockUseOptimizedNarrativeContext.mockReturnValue({
      buildOptimizedContext: createMockFn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
      getDefaultContext: createMockFn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
      getFocusedContext: createMockFn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
      getCompactContext: createMockFn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT)
    });

    mockUseNarrativeContextSynchronization.mockReturnValue({
      ensureFreshContext: createMockFn().mockResolvedValue(null)
    });

    mockEstimateTokenCount.mockReturnValue(100);
    
    // Set up getAIResponse mock
    mockGetAIResponse.mockResolvedValue({
      response: "AI generated response",
      success: true,
      debugInfo: { tokens: 100, latency: 500 }
    });
  } else {
    console.warn('setupAIContextMocks called outside of test environment');
  }
};
