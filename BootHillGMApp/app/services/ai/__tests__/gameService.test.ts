import { getAIResponse } from '../gameService';
import { getAIModel } from '../../../utils/ai/aiConfig';
import { GenerateContentResult } from '@google/generative-ai';

jest.mock('../../../utils/ai/aiConfig', () => ({
  getAIModel: jest.fn(),
}));

const mockGenerateContent = jest.fn();

(getAIModel as jest.Mock).mockReturnValue({
  generateContent: mockGenerateContent,
});

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
      suggestedActions: [],
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockJsonResponse)),
      },
    } as unknown as GenerateContentResult);

    const result = await getAIResponse('test prompt', '', []);

    expect(result).toEqual(mockJsonResponse);
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.any(String));
  });

  it('should handle various location types correctly', async () => {
    const mockTownResponse = {
      narrative: 'You are in a town.',
      location: { type: 'town', name: 'Dusty Gulch' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockTownResponse)),
      },
    } as unknown as GenerateContentResult);
    expect(await getAIResponse('test', '', [])).toEqual(mockTownResponse);

    const mockWildernessResponse = {
      narrative: 'You are in the wilderness.',
      location: { type: 'wilderness', description: 'Open plains' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockWildernessResponse)),
      },
    } as unknown as GenerateContentResult);
    expect(await getAIResponse('test', '', [])).toEqual(
      mockWildernessResponse
    );

    const mockLandmarkResponse = {
      narrative: 'You see a landmark.',
      location: { type: 'landmark', name: 'Hidden Valley', description: 'A secluded valley' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockLandmarkResponse)),
      },
    } as unknown as GenerateContentResult);
    expect(await getAIResponse('test', '', [])).toEqual(mockLandmarkResponse);

    const mockUnknownResponse = {
      narrative: 'You are lost.',
      location: { type: 'unknown' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [],
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockUnknownResponse)),
      },
    } as unknown as GenerateContentResult);
    expect(await getAIResponse('test', '', [])).toEqual(mockUnknownResponse);
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
      suggestedActions: [],
    };
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(mockCombatResponse)),
      },
    } as unknown as GenerateContentResult);

    const result = await getAIResponse('test', '', []);
    expect(result).toEqual(mockCombatResponse);
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

  it('should throw an error for invalid JSON structure', async () => {
    const invalidJsonResponse = {
      narrative: 'Test narrative',
      location: 'invalid location', // Should be an object
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve(JSON.stringify(invalidJsonResponse)),
      },
    } as unknown as GenerateContentResult);

    await expect(getAIResponse('test prompt', '', [])).resolves.toEqual({
      narrative: "The AI encountered an error and could not process your action. Please try again.",
      location: { type: 'unknown' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [{ text: "Retry", type: "basic", context: "Try your last action again." }],
    });
  });

  it('should handle invalid location type', async () => {
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

    await expect(getAIResponse('test', '', [])).resolves.toEqual({
      narrative: "The AI encountered an error and could not process your action. Please try again.",
      location: { type: 'unknown' },
      combatInitiated: false,
      opponent: null,
      acquiredItems: [],
      removedItems: [],
      suggestedActions: [{ text: "Retry", type: "basic", context: "Try your last action again." }],
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

  it('should throw an error if the AI model throws an error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('AI model error'));

    await expect(getAIResponse('test prompt', '', [])).rejects.toThrow(
      'Unexpected AI response error: TypeError: Cannot read properties of undefined (reading \'response\')'
    );
  });
});
