/**
 * Central export for all test utilities
 * 
 * This file provides an easy way to import all test utilities and mocks
 * without needing to know their exact locations.
 */

// 1. Export module mocks from __mocks__ directory
// These are used by Jest's module mocking system
export * from './__mocks__/aiService';
export * from './__mocks__/navigation';
export * from './__mocks__/gameEngine';

// 2. Export utility functions from utils directory
// These provide helpful functions for common testing tasks
export * from './utils/renderUtils';
export * from './utils/userEventUtils';
export * from './utils/characterTestUtils';

// 3. Export setup functions from setup directory
// These handle test environment configuration
export { setupMocks } from './setup/mockSetup';

// 4. Export mock data generators
// These provide consistent test data
export * from './mocks/mockDataGenerators';
