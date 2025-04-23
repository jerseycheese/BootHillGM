import { generateCompleteCharacter } from '../../../services/ai/characterService';
import { CharacterLogger } from '../../../utils/characterLogging';
import { GenerativeModel } from '@google/generative-ai';
import { validateCharacter } from '../../../utils/characterValidation';
import { getAIModel } from '../../../utils/ai/aiConfig';
import { mocked } from 'jest-mock';

jest.mock('../../../utils/characterLogging');
jest.mock('../../../utils/characterValidation');
jest.mock('../../../utils/ai/aiConfig');

describe('generateCompleteCharacter', () => {
  jest.setTimeout(30000);
  let mockLogger: CharacterLogger;

  beforeEach(() => {
    mockLogger = new CharacterLogger('test');
    mockLogger.start = jest.fn();
    mockLogger.log = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.complete = jest.fn();
    (CharacterLogger as unknown as jest.Mock).mockImplementation(() => mockLogger);
    (validateCharacter as unknown as jest.Mock).mockReturnValue({ isValid: true });

    mocked(getAIModel).mockImplementation(() => ({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () =>
            Promise.resolve(
              JSON.stringify({
                name: 'Test Character',
                attributes: {
                  speed: 10,
                  gunAccuracy: 12,
                  throwingAccuracy: 8,
                  strength: 15,
                  baseStrength: 15,
                  bravery: 14,
                  experience: 5,
                },
              })
            ),
        },
      }),
      apiKey: 'dummy-api-key',
      _requestOptions: { /* Intentionally empty */ },
      model: 'dummy-model',
      generationConfig: { /* Intentionally empty */ },
      safetySettings: [], // Placeholder for safetySettings
      cachedContent: { contents: [] }, // Placeholder for cachedContent with contents property
      generateContentStream: jest.fn(), // Placeholder for generateContentStream
      startChat: jest.fn(), // Placeholder for startChat
      countTokens: jest.fn(), // Placeholder for countTokens
      embedContent: jest.fn(), // Placeholder for embedContent
      batchEmbedContents: jest.fn(), // Placeholder for batchEmbedContents
      ...{ /* Intentionally empty */ }, // Placeholder for any other missing properties
    }) as unknown as GenerativeModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a character with valid data', async () => {
    await generateCompleteCharacter();
    expect(mockLogger.log).toHaveBeenCalledWith('aiResponse', expect.any(String));
    expect(mockLogger.log).toHaveBeenCalledWith('parsed', expect.any(Object));
    expect(mockLogger.complete).toHaveBeenCalledWith(expect.any(Object));
    expect(validateCharacter).toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    (validateCharacter as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('Character generation failed validation');
    });

    await expect(generateCompleteCharacter()).rejects.toThrow(
      'Character generation failed validation'
    );
    expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should fall back to random generation on error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => { /* Intentionally empty */ });
    (validateCharacter as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    const result = await generateCompleteCharacter();
    expect(result).toBeDefined();
    expect(mockLogger.log).toHaveBeenCalledWith('fallback', 'Using randomly generated character');
  });
});