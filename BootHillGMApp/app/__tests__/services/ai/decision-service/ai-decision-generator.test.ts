import { AIDecisionGenerator } from '../../../../services/ai/decision-service';
import { DecisionPrompt } from '../../../../types/ai-service.types';
import { mockCharacter, createMockNarrativeState, mockResponse } from './__testUtils__/mockData';
import { createMockAIClient, createMockHistoryManager } from './__testUtils__/mockDependencies';

describe('AIDecisionGenerator - Enhanced Context', () => {
  let generator: AIDecisionGenerator;
  let mockAIClient: ReturnType<typeof createMockAIClient>;
  let mockHistoryManager: ReturnType<typeof createMockHistoryManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAIClient = createMockAIClient();
    mockHistoryManager = createMockHistoryManager();
    mockAIClient.makeRequest.mockResolvedValue(mockResponse);
    generator = new AIDecisionGenerator(mockAIClient, mockHistoryManager, 4);
  });

  describe('Context Extraction', () => {
    it('should extract comprehensive context from multiple sources', async () => {
      const narrativeState = createMockNarrativeState();
      
      // Call generateDecision to trigger the context extraction
      await generator.generateDecision(narrativeState, mockCharacter);
      
      // Check that makeRequest was called correctly
      expect(mockAIClient.makeRequest).toHaveBeenCalledTimes(1);
      
      // Get the prompt that was passed to makeRequest
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Verify the narrative context includes elements from different sources
      expect(prompt.narrativeContext).toContain('You find yourself');  // From current story point
      expect(prompt.narrativeContext).toContain('saloon for information'); // From narrative history
      expect(prompt.narrativeContext).toContain('town plagued by recent robberies'); // From world context
    });

    it('should extract recent narrative history even when story point is not available', async () => {
      const narrativeState = createMockNarrativeState({ currentStoryPoint: null });
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Should still include narrative history
      expect(prompt.narrativeContext).toContain('saloon for information');
      expect(prompt.narrativeContext).toContain('bartender greeted you');
    });

    it('should extract character relationships from impact state', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check that relationships were extracted
      expect(prompt.characterInfo.relationships).toHaveProperty('Sheriff');
      expect(prompt.characterInfo.relationships).toHaveProperty('Bartender');
      // Use toContain for string matching
      expect(prompt.characterInfo.relationships.Sheriff).toContain('unfriendly');
      expect(prompt.characterInfo.relationships.Bartender).toContain('friendly');
    });

    it('should include more detailed recent events', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check that recent events include more entries and proper formatting
      expect(prompt.gameState.recentEvents.length).toBeGreaterThanOrEqual(5);
      // Use toContain for array testing
      expect(prompt.gameState.recentEvents).toContain('You decided to head to the saloon for information.');
      expect(prompt.gameState.recentEvents).toContain('The bartender greeted you with a nod.');
    });

    it('should include decision history with additional context', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check that previousDecisions include expected properties
      expect(prompt.previousDecisions).toHaveLength(1);
      expect(prompt.previousDecisions[0]).toHaveProperty('prompt');
      expect(prompt.previousDecisions[0]).toHaveProperty('choice');
      expect(prompt.previousDecisions[0]).toHaveProperty('outcome');
      
      // Should also include additional properties
      expect(prompt.previousDecisions[0]).toHaveProperty('timestamp');
    });
  });

  describe('Context Refreshing', () => {
    it('should refresh narrative context before generating a decision', async () => {
      const narrativeState = createMockNarrativeState();
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Check for markers of refreshed context
      expect(prompt.narrativeContext).toContain('Current scene:');
      expect(prompt.narrativeContext).toContain('Recent events:');
      expect(prompt.narrativeContext).toContain('Selected');
      expect(prompt.narrativeContext).toContain('World state:');
    });

    it('should handle missing narrative context gracefully', async () => {
      const narrativeState = createMockNarrativeState({ narrativeContext: undefined });
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      const prompt = mockAIClient.makeRequest.mock.calls[0][0] as DecisionPrompt;
      
      // Should still have basic context
      expect(prompt.narrativeContext).toContain('You find yourself');
      expect(prompt.narrativeContext).toContain('dusty afternoon');
    });

    it('should handle empty narrative history gracefully', async () => {
      const narrativeState = createMockNarrativeState({ 
        narrativeHistory: [],
        currentStoryPoint: null
      });
      
      await generator.generateDecision(narrativeState, mockCharacter);
      
      // Should not throw an error
      expect(mockAIClient.makeRequest).toHaveBeenCalled();
    });
  });
});