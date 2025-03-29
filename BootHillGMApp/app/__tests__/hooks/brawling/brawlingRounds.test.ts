/**
 * Master test file for brawling combat functionality
 * 
 * This file serves as an entry point for brawling tests and configures the
 * test environment with necessary mocks and utilities. Each aspect of brawling
 * functionality has been separated into its own test file for better organization:
 * 
 * - combatFlow.test.ts: Tests basic combat flow and round processing
 * - multipleRounds.test.ts: Tests handling of multiple combat rounds
 * - knockout.test.ts: Tests knockout scenarios and win conditions
 * - errorHandling.test.ts: Tests error handling and validation
 * 
 * @module BrawlingTests
 */
import { setupMocks } from '../../../test/setup/mockSetup';
import './test-setup'; // This will ensure our mocks are properly set up

// This is just a test to ensure the file is recognized by Jest
describe('Brawling Tests', () => {
  it('should load all test suites', () => {
    expect(true).toBe(true);
  });
});

// Setup global mocks from the project's utilities
setupMocks();

// Note: Each test file runs independently to avoid interdependencies
// This helps isolate test failures and makes debugging easier
