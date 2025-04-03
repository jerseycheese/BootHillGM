/**
 * Test helpers for narrative-related hooks and utilities, specifically
 * focusing on AI context optimization tests.
 */
// Remove unused imports
// Mock types for test
// Removed unused MockOptimizedContext and MockSynchronization types
// Create mock functions instead of importing them
export const mockUseNarrative = jest.fn();
export const mockGetAIResponse = jest.fn();
export const mockUseOptimizedNarrativeContext = jest.fn();
export const mockUseNarrativeContextSynchronization = jest.fn();
export const mockEstimateTokenCount = jest.fn();

// Mock these modules at the top of the test file using:
// jest.mock('../../hooks/useNarrative', () => ({ __esModule: true, default: mockUseNarrative }));
// jest.mock('../../services/ai/gameService', () => ({ getAIResponse: mockGetAIResponse }));
// jest.mock('../../utils/narrative/narrativeContextIntegration', () => ({
//   useOptimizedNarrativeContext: mockUseOptimizedNarrativeContext,
//   useNarrativeContextSynchronization: mockUseNarrativeContextSynchronization
// }));
// jest.mock('../../utils/narrative', () => ({ estimateTokenCount: mockEstimateTokenCount }));

const MOCK_OPTIMIZED_CONTEXT = "Recent events: You arrived in Tombstone.";

/**
 * Sets up the default return values for mocks. Call this in beforeEach.
 * Assumes jest.mock() calls are done in the test file itself.
 */
export const setupAIContextMocks = () => {
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
    dispatch: jest.fn()
  });

  mockUseOptimizedNarrativeContext.mockReturnValue({
    buildOptimizedContext: jest.fn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
    getDefaultContext: jest.fn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
    getFocusedContext: jest.fn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT),
    getCompactContext: jest.fn().mockReturnValue(MOCK_OPTIMIZED_CONTEXT)
  });

  mockUseNarrativeContextSynchronization.mockReturnValue({
    ensureFreshContext: jest.fn().mockResolvedValue(null)
  });

  mockEstimateTokenCount.mockReturnValue(100);
  
  // Set up getAIResponse mock
  mockGetAIResponse.mockResolvedValue({
    response: "AI generated response",
    success: true,
    debugInfo: { tokens: 100, latency: 500 }
  });
};
