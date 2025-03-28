/**
 * Narrative Reducer Tests
 * 
 * This file serves as the main entry point for narrative reducer tests.
 * It imports and runs all the test suites for the narrative reducer.
 */

// Import all test suites
import './narrativeReducer/navigation-tests';
import './narrativeReducer/narrative-arc-tests';
import './narrativeReducer/narrative-context-tests';
import './narrativeReducer/error-handling-tests';
import './narrativeReducer/decision-tests';

/**
 * This main test file intentionally has no tests of its own.
 * It serves as an entry point to organize and run all the test suites
 * for the narrative reducer.
 * 
 * Each test suite is focused on testing specific functionality:
 * - navigation-tests: Tests for navigation and choice selection
 * - narrative-arc-tests: Tests for narrative arc and branch management
 * - narrative-context-tests: Tests for narrative context updates
 * - error-handling-tests: Tests for error handling functionality
 * - decision-tests: Tests for decision tracking functionality
 *
 * This organization improves maintainability and makes it easier to 
 * add new tests as the narrative system evolves.
 */