/**
 * @jest-environment jsdom
 */
import { 
  mockUseNarrative, 
  mockGetAIResponse, 
  mockUseOptimizedNarrativeContext,
  setupAIContextMocks
} from './utils/narrativeTestHelpers';

describe('narrativeTestHelpers', () => {
  // Test proper functioning of narrative test helpers in Jest environment
  test('setupAIContextMocks works correctly in test environment', () => {
    // Setup mocks
    setupAIContextMocks();
    
    // Verify the mocks are properly configured
    const narrativeResult = mockUseNarrative();
    expect(narrativeResult).toBeDefined();
    expect(narrativeResult.state).toBeDefined();
    expect(narrativeResult.state.narrativeHistory).toHaveLength(2);
    
    const optimizedContextResult = mockUseOptimizedNarrativeContext();
    expect(optimizedContextResult).toBeDefined();
    expect(optimizedContextResult.buildOptimizedContext).toBeDefined();
    
    // Test mock implementation
    const buildContext = optimizedContextResult.buildOptimizedContext();
    expect(buildContext).toBe("Recent events: You arrived in Tombstone.");
    
    // Test async mocks
    return mockGetAIResponse().then(result => {
      expect(result).toEqual({
        response: "AI generated response",
        success: true,
        debugInfo: { tokens: 100, latency: 500 }
      });
    });
  });
});
