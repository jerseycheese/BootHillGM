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
    const data = { test: 'data' };
    logger.start(data);
    
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('[Character test-context] start'),
      expect.objectContaining({ data })
    );
  });

  it('should log stage events', () => {
    const data = { stage: 'test' };
    logger.log('test-stage', data);
    
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('[Character test-context] test-stage'),
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
    const data = { complete: true };
    logger.complete(data);
    
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('[Character test-context] complete'),
      expect.objectContaining({ data })
    );
  });
});