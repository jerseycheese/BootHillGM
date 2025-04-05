import { CharacterLogger } from '../../utils/characterLogging';

describe('utils/characterLogging', () => {
  let logger: CharacterLogger;
  const mockConsole = {
    log: jest.fn(),
    error: jest.fn()
  };

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(mockConsole.log);
    jest.spyOn(console, 'error').mockImplementation(mockConsole.error);
    logger = new CharacterLogger('test-context');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log start event', () => {
    // Fix: Convert timestamp to string to match StartData type
    const data = { test: 'data', timestamp: new Date(Date.now()).toISOString() };
    logger.start(data);
    
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('[Character test-context] start'),
      expect.objectContaining({ data })
    );
  });

  it('should log stage events', () => {
    // Fix: Use a valid stage ('parsed') and data structure (ParsedData)
    const data: import('../../types/character').ParsedData = {
      character: { name: 'Parsed Name' }
    };
    logger.log('parsed', data);
    
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('[Character test-context]'),
      expect.objectContaining({ data })
    );
  });

  it('should log errors', () => {
    const error = new Error('test error');
    logger.error(error);
    
    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining('[Character test-context] Error'),
      expect.objectContaining({ error })
    );
  });

  it('should log complete event', () => {
    // Create a minimal character-like object to satisfy the type
    // Fix: Add required attributes properties to match Character type
    const mockCharacter: import('../../types/character').Character = {
      id: 'test-id',
      name: 'Test Character',
      isNPC: false,
      isPlayer: true,
      inventory: { items: [] },
      attributes: { speed: 10, gunAccuracy: 10, throwingAccuracy: 10, strength: 10, baseStrength: 10, bravery: 10, experience: 0 },
      minAttributes: { speed: 1, gunAccuracy: 1, throwingAccuracy: 1, strength: 8, baseStrength: 8, bravery: 1, experience: 0 },
      maxAttributes: { speed: 20, gunAccuracy: 20, throwingAccuracy: 20, strength: 20, baseStrength: 20, bravery: 20, experience: 11 },
      wounds: [],
      isUnconscious: false,
      // Note: 'complete' is not part of the Character type itself
    };
    
    logger.complete(mockCharacter);
    
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('[Character test-context] complete'),
      expect.objectContaining({ data: mockCharacter })
    );
  });
});