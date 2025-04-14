import { isTestEnvironment, initializeTestCombat } from '../../utils/testUtils';

describe('Test Utilities', () => {
  test('isTestEnvironment should return a boolean', () => {
    const result = isTestEnvironment();
    expect(typeof result).toBe('boolean');
  });

  test('initializeTestCombat should return an action object', () => {
    const result = initializeTestCombat();
    expect(result).toHaveProperty('type', 'SET_STATE');
    
    // Type guard to ensure payload exists
    if (result.type === 'SET_STATE' && 'payload' in result) {
      expect(result.payload).toHaveProperty('combat');
      expect(result.payload).toHaveProperty('character');
    } else {
      throw new Error('Expected SET_STATE action with payload');
    }
  });
});
