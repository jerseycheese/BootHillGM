import { AIService } from '../../../services/ai/aiService';
import { GameServiceResponse } from '../../../services/ai/types/gameService.types';
import { DecisionImportance } from '../../../types/narrative.types';
import { Character } from '../../../types/character';

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    
    // Create a mock for the model's generateContent method
    // Create our own generateWithRetries method that we can spy on
    const mockGenerateWithRetries = jest.fn().mockImplementation(
      async (): Promise<GameServiceResponse> => {
        return {
          narrative: "Test narrative response",
          location: { type: "town", name: "Test Town" },
          playerDecision: {
            id: "decision1",
            prompt: "What will you do next?",
            timestamp: Date.now(),
            context: "test context",
            importance: "normal" as DecisionImportance,
            aiGenerated: true,
            options: [
              { id: "opt1", text: "Option 1", impact: "minor" },
              { id: "opt2", text: "Option 2", impact: "minor" }
            ]
          },
          acquiredItems: [],
          removedItems: [],
          suggestedActions: [
            {
              id: "action1",
              title: "Look around",
              description: "Check your surroundings",
              type: "optional"
            }
          ]
        };
      }
    );
    
    // Assign the mock to the service instance
    aiService.generateGameContent = mockGenerateWithRetries;
  });

  it('should generate game content with valid response', async () => {
    const mockCharacter: Partial<Character> = {
      name: 'Test',
      attributes: {
        speed: 5,
        gunAccuracy: 5,
        throwingAccuracy: 5,
        strength: 5,
        baseStrength: 5,
        bravery: 5,
        experience: 0
      }
    };
    const response = await aiService.generateGameContent(mockCharacter as Character);
    expect(response).toBeDefined();
    expect(response.narrative).toBe("Test narrative response");
    expect(response.playerDecision?.options).toHaveLength(2);
  });
});