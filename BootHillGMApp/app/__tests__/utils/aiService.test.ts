import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAIResponse, generateCharacterSummary, generateNarrativeSummary } from '../../utils/aiService';
import { Character } from '../../types/character';

jest.mock("@google/generative-ai");

const mockGenerateContent = jest.fn();
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

describe('getAIResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates AI response with correct parameters', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'AI generated response\nACQUIRED_ITEMS: []\nREMOVED_ITEMS: []',
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
    mockGenerateContent.mockRejectedValue(new Error('API error'));

    await expect(getAIResponse('Test prompt', 'Test context', [])).rejects.toThrow('Unexpected AI response error');
  });

  it('parses acquired and removed items correctly', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'AI response\nACQUIRED_ITEMS: [Item1, Item2]\nREMOVED_ITEMS: [Item3]',
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
      health: 100,
      attributes: {
        speed: 10,
        gunAccuracy: 10,
        throwingAccuracy: 10,
        strength: 10,
        bravery: 10,
        experience: 5
      },
      skills: {
        shooting: 50,
        riding: 50,
        brawling: 50
      }
    };

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'AI-generated character summary',
      },
    });

    const summary = await generateCharacterSummary(mockCharacter);

    expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('Test Character'));
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
    expect(summary).toBe('Player action');
  });
});
