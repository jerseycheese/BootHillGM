import { getAIResponse } from '../../../services/ai/gameService';
import { getAIModel } from '../../../utils/ai/aiConfig';
import { GenerateContentResult } from '@google/generative-ai';

jest.mock('../../../utils/ai/aiConfig', () => ({
  getAIModel: jest.fn(),
}));

const mockGenerateContent = jest.fn();

(getAIModel as jest.Mock).mockReturnValue({
  generateContent: mockGenerateContent,
});

// Define the default suggested actions generated *within* getAIResponse success path
const successPathDefaultActions = [
  { text: "Look around", type: "basic", context: "Survey your surroundings" },
  { text: "Continue forward", type: "basic", context: "Proceed on your journey" },
  { text: "Check your inventory", type: "inventory", context: "See what you're carrying" }
];

// Define the actual default suggested actions from generateFallbackResponse
const fallbackPathDefaultActions = [
  { text: "Look around", type: "basic", context: "Survey your surroundings" },
  { text: "Check your inventory", type: "inventory", context: "See what you're carrying" },
  { text: "Rest for a while", type: "basic", context: "Recover your energy" },
  { text: "Continue forward", type: "basic", context: "Press on with your journey" }
];


describe('getAIResponse', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('should return structured data on successful AI response', async () => {
    const mockJsonResponse = {
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Testville' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [], // Expected empty in this specific mock
      // Add optional fields expected in the return type but potentially missing in mock
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockJsonResponse)),
      },
    } as unknown as GenerateContentResult);

    const result = await getAIResponse('test prompt', '', []);

    // Adjust expectation to use the success path defaults when mock has empty actions
    const expectedResult = {
      ...mockJsonResponse,
      suggestedActions: mockJsonResponse.suggestedActions.length > 0 ? mockJsonResponse.suggestedActions : successPathDefaultActions
    };

    expect(result).toEqual(expectedResult);
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.any(String));
  });
  it('should extract and validate playerDecision from AI response', async () => {
    const mockResponse = {
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      combatInitiated: false,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: {
        prompt: 'What will you do?',
        options: [
          { text: 'Option 1', impact: 'Impact 1' },
          { text: 'Option 2', impact: 'Impact 2' }
        ],
        importance: 'significant',
        context: 'Decision context'
      }
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      },
    });

    const result = await getAIResponse('test prompt', '', []);

    expect(result.playerDecision).toBeDefined();
    expect(result.playerDecision?.prompt).toBe('What will you do?');
    expect(result.playerDecision?.options).toHaveLength(2);
    expect(result.playerDecision?.importance).toBe('significant');
  });

  it('should handle invalid playerDecision in AI response', async () => {
    const mockResponse = {
      narrative: 'Test narrative',
      location: { type: 'town', name: 'Test Town' },
      combatInitiated: false,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
      playerDecision: {
        prompt: 'What will you do?',
        options: [{ text: 'Option 1', impact: 'Impact 1' }], // Only one option, should be invalid
        importance: 'significant'
      }
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      },
    });

    const result = await getAIResponse('test prompt', '', []);

    expect(result.playerDecision).toBeUndefined();
  });

  it('should handle various location types correctly', async () => {
    const mockTownResponse = {
      narrative: 'You are in a town.',
      location: { type: 'town', name: 'Dusty Gulch' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [], // Expected empty in this specific mock
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockTownResponse)),
      },
    } as unknown as GenerateContentResult);
     // Adjust expectation for success path default suggestedActions
    const expectedTownResult = { ...mockTownResponse, suggestedActions: successPathDefaultActions };
    expect(await getAIResponse('test', '', [])).toEqual(expectedTownResult);

    const mockWildernessResponse = {
      narrative: 'You are in the wilderness.',
      location: { type: 'wilderness', description: 'Open plains' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [], // Expected empty in this specific mock
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockWildernessResponse)),
      },
    } as unknown as GenerateContentResult);
    // Adjust expectation for success path default suggestedActions
    const expectedWildernessResult = { ...mockWildernessResponse, suggestedActions: successPathDefaultActions };
    expect(await getAIResponse('test', '', [])).toEqual(expectedWildernessResult);

    const mockLandmarkResponse = {
      narrative: 'You see a landmark.',
      location: { type: 'landmark', name: 'Hidden Valley', description: 'A secluded valley' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [], // Expected empty in this specific mock
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockLandmarkResponse)),
      },
    } as unknown as GenerateContentResult);
    // Adjust expectation for success path default suggestedActions
    const expectedLandmarkResult = { ...mockLandmarkResponse, suggestedActions: successPathDefaultActions };
    expect(await getAIResponse('test', '', [])).toEqual(expectedLandmarkResult);

    const mockUnknownResponse = {
      narrative: 'You are lost.',
      location: { type: 'unknown' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [], // Expected empty in this specific mock
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockUnknownResponse)),
      },
    } as unknown as GenerateContentResult);
    // Adjust expectation for success path default suggestedActions
     const expectedUnknownResult = { ...mockUnknownResponse, suggestedActions: successPathDefaultActions };
    expect(await getAIResponse('test', '', [])).toEqual(expectedUnknownResult);
  });

  it('should handle combat initiation correctly', async () => {
    const mockCombatResponse = {
      narrative: 'You are attacked!',
      location: { type: 'wilderness', description: 'Open plains' },
      combatInitiated: true,
      opponent: {
        id: 'opponent-1',
        name: 'Bandit',
        attributes: {
          strength: 10,
          baseStrength: 10,
          speed: 5,
          gunAccuracy: 5,
          throwingAccuracy: 5,
          bravery: 5,
          experience: 0,
        },
        wounds: [],
        isUnconscious: false,
        inventory: [],
        isNPC: true,
        isPlayer: false,
      },
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [], // Expected empty in this specific mock
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockCombatResponse)),
      },
    } as unknown as GenerateContentResult);

    const result = await getAIResponse('test', '', []);
     // Adjust expectation for success path default suggestedActions
    const expectedCombatResult = { ...mockCombatResponse, suggestedActions: successPathDefaultActions };
    expect(result).toEqual(expectedCombatResult);
    expect(result.combatInitiated).toBe(true);
    expect(result.opponent).toBeDefined();
    expect(result.opponent!.name).toBe('Bandit');
  });

  it('should handle missing opponent when combatInitiated is false', async () => {
    const mockResponse = {
      narrative: 'All is quiet.',
      location: { type: 'town', name: 'Peaceful Town' },
      combatInitiated: false,
      // opponent: null,  // Explicitly omitted, as per the requirements
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      },
    } as unknown as GenerateContentResult);

    const result = await getAIResponse('test', '', []);
    expect(result.combatInitiated).toBe(false);
    expect(result.opponent).toBe(null); // Should be explicitly null
  });

  it('should return fallback response for invalid JSON structure', async () => {
    const invalidJsonResponse = {
      narrative: 'Test narrative',
      location: 'invalid location', // Should be an object
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(invalidJsonResponse)),
      },
    } as unknown as GenerateContentResult);

    // Expect the fallback response (which uses fallbackPathDefaultActions)
    await expect(getAIResponse('test prompt', '', [])).resolves.toEqual({
      narrative: "the player considers their next move. The western frontier stretches out before you, full of opportunity and danger.", // Default generic fallback narrative
      location: { type: 'town', name: 'Boothill' }, // Default fallback location
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: fallbackPathDefaultActions, // Use actual fallback actions
      // Ensure optional fields are undefined in fallback
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    });
  });

  it('should return fallback response for invalid location type', async () => {
    const invalidLocationResponse = {
      narrative: 'Test narrative',
      location: { type: 'invalid', name: 'Invalid Location' }, // Invalid type
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(invalidLocationResponse)),
      },
    } as unknown as GenerateContentResult);

    // Expect the fallback response (which uses fallbackPathDefaultActions)
    await expect(getAIResponse('test', '', [])).resolves.toEqual({
       narrative: "the player considers their next move. The western frontier stretches out before you, full of opportunity and danger.", // Default generic fallback narrative
      location: { type: 'town', name: 'Boothill' }, // Default fallback location
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: fallbackPathDefaultActions, // Use actual fallback actions
       // Ensure optional fields are undefined in fallback
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    });
  });

  it('should maintain location consistency between narrative and location object', async () => {
    const mockResponse = {
      narrative: 'You arrive in the town of Redemption. The dusty streets are quiet under the midday sun.',
      location: { type: 'town', name: 'Redemption' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      },
    } as unknown as GenerateContentResult);

    const result = await getAIResponse('test', '', []);
    expect(result.location.type).toBe('town');
    expect((result.location as { type: 'town'; name: string }).name).toBe('Redemption');
    expect(result.narrative).toContain('Redemption'); // Check for town name specifically
  });

  it('should provide detailed wilderness descriptions', async () => {
    const mockResponse = {
      narrative: 'You trek through rolling hills dotted with scrub brush and cacti.',
      location: { type: 'wilderness', description: 'Rolling hills dotted with scrub brush and cacti' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      },
    } as unknown as GenerateContentResult);

    const result = await getAIResponse('test', '', []);
    expect(result.location.type).toBe('wilderness');
    if (result.location.type === 'wilderness') {
      expect(result.location.description).toBe('Rolling hills dotted with scrub brush and cacti');
      expect(result.narrative).toBe('You trek through rolling hills dotted with scrub brush and cacti.'); // Exact match
    }
  });

  it('should return fallback response if the AI model throws an error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('AI model error'));

    // Expect the promise to resolve with the fallback response, not reject
    await expect(getAIResponse('test prompt', '', [])).resolves.toEqual({
      narrative: "the player considers their next move. The western frontier stretches out before you, full of opportunity and danger.", // Default generic fallback narrative
      location: { type: 'town', name: 'Boothill' }, // Default fallback location
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: fallbackPathDefaultActions, // Use actual fallback actions
       // Ensure optional fields are undefined in fallback
      lore: undefined,
      playerDecision: undefined,
      storyProgression: undefined,
    });
  });
});
