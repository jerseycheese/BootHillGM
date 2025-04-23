/**
 * Mock localStorage implementation for testing
 * 
 * Provides a complete mock implementation of the localStorage API
 * that can be used across multiple test files.
 * 
 * @example
 * // In your test setup
 * import { setupLocalStorageMock, resetLocalStorageMock } from '../utils/mockLocalStorage';
 * 
 * beforeAll(() => {
 *   setupLocalStorageMock();
 * });
 * 
 * beforeEach(() => {
 *   resetLocalStorageMock();
 * });
 */

// Define the storage type to match localStorage expectations
type StorageData = Record<string, string>;

// Create a mock implementation of localStorage with jest.fn() functions
export const mockLocalStorage = (() => {
  let store: StorageData = { /* Intentionally empty */ };
  
  const getItem = jest.fn((key: string): string | null => {
    return store[key] || null;
  });
  
  getItem.mockReturnValue = jest.fn(function(value) {
    // @ts-ignore: Mock implementation
    return this.mockImplementation(() => value);
  });
  
  const setItem = jest.fn((key: string, value: string): void => {
    store[key] = value;
  });
  
  const removeItem = jest.fn((key: string): void => {
    delete store[key];
  });
  
  const clear = jest.fn((): void => {
    store = { /* Intentionally empty */ };
  });
  
  return {
    getItem,
    setItem,
    removeItem,
    clear,
    get length() {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

/**
 * Sets up the localStorage mock for tests
 * This replaces the global window.localStorage with our mock implementation
 */
export const setupLocalStorageMock = (): void => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
};

/**
 * Resets the localStorage mock between tests
 * Clears all stored data and resets all mock function calls
 */
export const resetLocalStorageMock = (): void => {
  mockLocalStorage.clear();
  jest.clearAllMocks();
};
