// Mock aiService
const mockAIService = {
  generateFieldValue: jest.fn().mockImplementation(async (key: string) => {
    if (key === 'name') {
      // Ensure we return a random name that isn't "John Doe"
      const names = ['Billy the Kid', 'Wyatt Earp', 'Annie Oakley', 'Doc Holliday', 'Jesse James'];
      return names[Math.floor(Math.random() * names.length)];
    }
    const ranges: Record<string, [number, number]> = {
      name: [0, 0],
      speed: [1, 20],
      gunAccuracy: [1, 20],
      throwingAccuracy: [1, 20],
      strength: [8, 20],
      baseStrength: [8, 20],
      bravery: [1, 20],
      experience: [0, 11],
      shooting: [1, 100],
      riding: [1, 100],
      brawling: [1, 100]
    };
    const [min, max] = ranges[key] || [1, 100];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }),
  generateCharacterSummary: jest.fn().mockResolvedValue('AI-generated character summary'),
  getCharacterCreationStep: jest.fn().mockResolvedValue('Mock AI prompt'),
  validateAttributeValue: jest.fn().mockReturnValue(true),
  generateNarrativeSummary: jest.fn().mockResolvedValue('Generated narrative summary'),
  getAIModel: jest.fn().mockResolvedValue({
    generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'AI response' } }),
  }),
  determineIfWeapon: jest.fn().mockResolvedValue(false),
};

export default mockAIService;
