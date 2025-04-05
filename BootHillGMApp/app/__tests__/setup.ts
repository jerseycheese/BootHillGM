/**
 * Jest Global Setup File
 * 
 * This file configures the Jest environment for all tests
 * and ensures proper TypeScript integration.
 */

// Make sure the TypeScript compiler recognizes Jest globals
// This approach is cleaner than adding triple-slash directives to every test file
import '@testing-library/jest-dom';

// Set up any global mocks or configurations here
// For example, you might want to mock localStorage or fetch
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// You can add more global setup here

// This test is needed because Jest requires at least one test in every file
describe('Global Jest Setup', () => {
  test('environment is properly configured', () => {
    expect(window.localStorage).toBeDefined();
    expect(typeof window.localStorage.getItem).toBe('function');
  });
});
