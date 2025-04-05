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

// Create a mock implementation of localStorage
export const mockLocalStorage = (() => {
  let store: StorageData = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
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
