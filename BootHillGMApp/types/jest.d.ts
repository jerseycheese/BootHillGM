/**
 * TypeScript declarations for Jest
 * This file ensures that TypeScript properly recognizes Jest globals in test files
 */

// Import Jest's type definitions
import 'jest';
import '@testing-library/jest-dom';

// Extend the global namespace to include Jest functions
declare global {
  // Re-export the Jest namespace to make it available globally
  export const jest: typeof import('jest');
  export const describe: typeof import('jest').describe;
  export const it: typeof import('jest').it;
  export const test: typeof import('jest').test;
  export const expect: typeof import('jest').expect;
  export const beforeAll: typeof import('jest').beforeAll;
  export const afterAll: typeof import('jest').afterAll;
  export const beforeEach: typeof import('jest').beforeEach;
  export const afterEach: typeof import('jest').afterEach;
}
