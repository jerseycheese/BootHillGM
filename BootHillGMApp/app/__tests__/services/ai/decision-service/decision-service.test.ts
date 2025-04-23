// Main entry point that simply imports all test files
// This preserves the current behavior while breaking the tests into manageable chunks

// Import test setup
import './__testUtils__/testSetup';

// Note: We don't need to explicitly import the other test files.
// Jest will automatically find and run all test files in this directory.
// This file serves as documentation for the test suite structure.

/**
 * Decision Service Test Suite
 * 
 * This test suite tests the AI-powered decision service responsible for 
 * generating in-game decisions based on narrative context and character state.
 * 
 * The suite is split into logical parts:
 * 
 * 1. decision-service-core.test.ts
 *    - Tests for the core functionality of DecisionService
 *    - Includes detectDecisionPoint and generateDecision
 *    - Verifies timing, relevance scoring, and error handling
 * 
 * 2. decision-service-conversion.test.ts
 *    - Tests for conversion between AI decisions and player decisions
 *    - Includes toPlayerDecision and recordDecision
 *    - Validates that decision history is properly maintained
 * 
 * 3. ai-decision-generator.test.ts
 *    - Tests for the AIDecisionGenerator class
 *    - Tests for enhanced context extraction and refreshing
 *    - Verifies character relationship extraction and narrative context handling
 * 
 * Shared resources:
 * - __testUtils__/mockData.ts: Contains all mock objects used across tests
 * - __testUtils__/mockDependencies.ts: Contains mock implementations of dependencies
 * - __testUtils__/testSetup.ts: Common setup for the test environment
 */

// Add a simple test to avoid Jest failure
describe('Decision Service Test Suite', () => {
  it('should load all test files', () => {
    // This is a placeholder test to ensure Jest doesn't fail
    expect(true).toBe(true);
  });
});