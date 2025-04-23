import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAIResponse } from '../../services/ai/gameService';
import { generateCharacterSummary, generateNarrativeSummary } from '../../utils/aiService';
import { Character } from '../../types/character';
import { defaultFallbackResponse } from '../services/ai/__mocks__/gameServiceMocks'; // Import the mock

jest.mock("@google/generative-ai");

const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: () => 'AI response',
  }
});
const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

const MockGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;
MockGoogleGenerativeAI.mockImplementation((apiKey: string) => {
  return {
    apiKey,
    getGenerativeModel: mockGetGenerativeModel,
    getGenerativeModelFromCachedContent: jest.fn(),
  } as unknown as GoogleGenerativeAI;
});

// Removed local definition, will use imported defaultFallbackResponse

describe('getAIResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates AI response with correct parameters', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          narrative: 'AI generated response',
          location: { type: 'town', name: 'Test Town' },
          combatInitiated: false,
          opponent: null,
          acquiredItems: [],
          removedItems: [],
          suggestedActions: []
        })
      },
    });

    const result = await getAIResponse('Test prompt', 'Test context', []);

    expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('Test prompt'));
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('Test context'));
    expect(result.narrative).toBe('AI generated response');
    expect(result.acquiredItems).toEqual([]);
    expect(result.removedItems).toEqual([]);
  });

  it('handles errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API error')); // Use mockRejectedValue to fail all retries

    // Expect the promise to resolve with the fallback response
    await expect(getAIResponse('Test prompt', 'Test context', [])).resolves.toEqual(defaultFallbackResponse); // Use imported mock
  });

  it('parses acquired and removed items correctly', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          narrative: 'AI response',
          location: { type: 'town', name: 'Test Town' },
          combatInitiated: false,
          opponent: null,
          acquiredItems: ['Item1', 'Item2'],
          removedItems: ['Item3'],
          suggestedActions: []
        })
      },
    });

    const result = await getAIResponse('Test prompt', 'Test context', []);

    expect(result.acquiredItems).toEqual(['Item1', 'Item2']);
    expect(result.removedItems).toEqual(['Item3']);
  });
});

describe('generateCharacterSummary', () => {
  it('generates a character summary', async () => {
    const mockCharacter: Character = {
      name: 'Test Character',
      id: 'test-id',
      isNPC: false,
      isPlayer: true,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        baseStrength: 10,
        bravery: 10,
         experience: 5
       },
       minAttributes: {
         speed: 1,
         gunAccuracy: 1,
         throwingAccuracy: 1,
         strength: 1,
         baseStrength: 1,
         bravery: 1,
         experience: 0
       },
       maxAttributes: {
         speed: 20,
         gunAccuracy: 20,
         throwingAccuracy: 20,
         strength: 20,
         baseStrength: 20,
         bravery: 20,
         experience: 10
       },
       wounds: [],
       isUnconscious: false,
       inventory: { items: [] }
     };

    // Reset all mocks before the test
    jest.clearAllMocks();

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'AI-generated character summary',
      },
    });

    const summary = await generateCharacterSummary(mockCharacter);

    // Get the most recent call
    const call = mockGenerateContent.mock.lastCall[0];
    expect(call).toContain('Generate a brief, engaging summary');
    expect(call).toContain('Name: Test Character');
    expect(call).toContain('speed: 10');
    expect(call).toContain('gunAccuracy: 10');
    expect(call).toContain('throwingAccuracy: 10');
    expect(call).toContain('strength: 10');
    expect(call).toContain('baseStrength: 10');
    expect(call).toContain('bravery: 10');
    expect(call).toContain('experience: 5');
    expect(summary).toBe('AI-generated character summary');
  });
});

describe('generateNarrativeSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a narrative summary for a player action', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'Generated narrative summary',
      },
    });

    const summary = await generateNarrativeSummary('Player action', 'Recent context');

    expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('Player action'));
    expect(summary).toBe('Generated narrative summary');
  });

  it('returns original action if AI generates an error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('AI service error'));

    const summary = await generateNarrativeSummary('Player action', 'Recent context');
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('Player action'));
    expect(summary).toBe('Player action in the Wild West.');
  });
});
