/**
 * Test for the mock setup utility
 * This ensures our localStorage mocking is working correctly
 */
import { setupMocks } from './mockSetup';

describe('Mock Setup', () => {
  it('correctly sets up localStorage mock', () => {
    const { mockLocalStorage } = setupMocks();
    
    // Test setItem and getItem
    mockLocalStorage.setItem('test-key', 'test-value');
    expect(mockLocalStorage.getItem('test-key')).toBe('test-value');
    
    // Test removeItem
    mockLocalStorage.removeItem('test-key');
    expect(mockLocalStorage.getItem('test-key')).toBeNull();
    
    // Test clear
    mockLocalStorage.setItem('test-key-1', 'value-1');
    mockLocalStorage.setItem('test-key-2', 'value-2');
    mockLocalStorage.clear();
    expect(mockLocalStorage.getItem('test-key-1')).toBeNull();
    expect(mockLocalStorage.getItem('test-key-2')).toBeNull();
    
    // Verify global localStorage is properly mocked
    window.localStorage.setItem('global-test', 'global-value');
    expect(window.localStorage.getItem('global-test')).toBe('global-value');
  });
});
