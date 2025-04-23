import DecisionService from '../../../../services/ai/decision-service';
import { ServiceError } from '../../../../types/testing/test-types';
import { 
  mockNarrativeState, 
  mockCharacter, 
  mockApiResponse, 
  testStoryPoint 
} from './__testUtils__/mockData';
import { setupMockFetch } from './__testUtils__/mockDependencies';

describe('DecisionService - Core Functionality', () => {
  let service: DecisionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockFetch();
    
    // Reset counter for tracking mock implementation calls
    (global.fetch as any)._mockImplementationCallCount = 0;
    (global.fetch as any)._mockRejectedValueOnce = false;
    
    // Setup fetch mock with proper typing
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
      headers: new Headers({
        'X-RateLimit-Remaining': '10',
        'X-RateLimit-Reset': '1600000000'
      })
    } as Response);
    
    // Initialize service with test configuration
    service = new DecisionService({
      minDecisionInterval: 0, // No delay for testing
      relevanceThreshold: 0.3,
      apiConfig: {
        apiKey: 'test-key',
        endpoint: 'https://test-endpoint.com',
        modelName: 'test-model',
        maxRetries: 1,
        timeout: 1000,
        rateLimit: 10
      }
    });
  });
  
  describe('detectDecisionPoint', () => {
    it('should detect when a decision point is appropriate', () => {
      // Create a properly typed story point with dialogue type
      const dialogueStoryPoint = {
        ...testStoryPoint,
        id: 'dialogue-point',
        title: 'Sheriff Question',
        content: 'The sheriff asks "What brings you to town, stranger?" as he eyes you suspiciously.',
        type: 'dialogue'
      };
      
      // Create state with the properly typed story point
      const state = {
        ...mockNarrativeState,
        currentStoryPoint: dialogueStoryPoint
      };
      
      const result = service.detectDecisionPoint(state, mockCharacter);
      
      expect(result.shouldPresent).toBe(true);
      expect(result.score).toBeGreaterThan(0.3);
      expect(result.reason).toContain('Narrative context indicates decision point');
    });
    
    it('should respect minimum decision interval', () => {
      // Create service with a longer interval
      const intervalService = new DecisionService({
        minDecisionInterval: 60000, // 1 minute
        relevanceThreshold: 0.3
      });
      
      // Set the last decision time manually
      intervalService.lastDecisionTime = Date.now();
      
      // Run the detection again - should fail due to timing
      const result = intervalService.detectDecisionPoint(mockNarrativeState, mockCharacter);
      
      expect(result.shouldPresent).toBe(false);
      expect(result.reason).toContain('Too soon since last decision');
    });
  });
  
  describe('generateDecision', () => {
    it('should generate a valid decision', async () => {
      const decision = await service.generateDecision(mockNarrativeState, mockCharacter);
      
      expect(decision.decisionId).toBe('decision-123');
      expect(decision.options.length).toBe(2);
      expect(decision.prompt).toBe('How do you respond to the sheriff?');
      expect(decision.relevanceScore).toBe(0.85);
      expect(decision.metadata.importance).toBe('significant');
    });
    
    it('should call the AI service with the correct prompt', async () => {
      await service.generateDecision(mockNarrativeState, mockCharacter);
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      const [url, requestOptions] = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      expect(url).toBe('https://test-endpoint.com');
      
      if (requestOptions && requestOptions.body) {
        const body = JSON.parse(requestOptions.body as string);
        expect(body.model).toBe('test-model');
        expect(body.messages[1].content).toContain('NARRATIVE CONTEXT');
        expect(body.messages[1].content).toContain('CHARACTER INFORMATION');
        expect(body.messages[1].content).toContain('GAME STATE');
      }
    });
    
    it('should handle API errors gracefully', async () => {
      // Reset fetch mock to ensure we get a clean state
      (global.fetch as jest.MockedFunction<typeof fetch>).mockReset();
      
      // Set flag to indicate this is the API error test
      (global.fetch as any)._mockRejectedValueOnce = true;
      
      // Mock the fetch to throw the specific error
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
        code: 'AI_SERVICE_ERROR',
        message: 'API connection error',
        retryable: true
      } as ServiceError);
      
      // Test that error is properly thrown and has expected properties
      try {
        await service.generateDecision(mockNarrativeState, mockCharacter);
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.code).toBe('AI_SERVICE_ERROR');
        expect(serviceError.message).toBe('API connection error');
      }
    });
  });
});