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

// Only import Jest in a test environment
let jestImport: any;
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
  // Dynamic import to avoid loading in browser context
  // This will only execute in Node.js test environment
  try {
    // @ts-ignore - Import is intentionally dynamic
    jestImport = require('@jest/globals').jest;
  } catch (e) {
    console.warn('Failed to import Jest globals - are you running outside a test environment?');
  }
}

// Create browser-compatible mock functions
const createMockFn = (): MockFunction => {
  const fn = (function(...args: any[]): any {
    if (typeof fn.calls !== 'undefined') {
      fn.calls.push(args);
    }
    if (typeof fn.implementation === 'function') {
      return fn.implementation(...args);
    }
    return fn.returnValue;
  }) as any;
  
  fn.calls = [] as any[][];
  fn.returnValue = undefined;
  fn.implementation = null;
  
  fn.mockReturnValue = function(value: any) {
    fn.returnValue = value;
    fn.implementation = null;
    return fn;
  };
  
  fn.mockImplementation = function(implementation: (...args: any[]) => any): MockFunction {
    fn.implementation = implementation;
    return fn;
  };
  
  fn.mockResolvedValue = function(value: any) {
    fn.implementation = () => Promise.resolve(value);
    return fn;
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
  // Reset all mocks regardless of environment
  mockUseNarrative.calls = [];
  mockGetAIResponse.calls = [];
  mockUseOptimizedNarrativeContext.calls = [];
  mockUseNarrativeContextSynchronization.calls = [];
  mockEstimateTokenCount.calls = [];
  
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
  
  // Set up getAIResponse mock with Promise implementation
  mockGetAIResponse.mockImplementation(() => Promise.resolve({
    response: "AI generated response",
    success: true,
    debugInfo: { tokens: 100, latency: 500 }
  }));
  
  // If in a Jest environment, utilize Jest's mock clearing functionality
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test' && jestImport && jestImport.clearAllMocks) {
    jestImport.clearAllMocks();
  }
};

// Initialize mocks immediately to ensure they're ready
setupAIContextMocks();
