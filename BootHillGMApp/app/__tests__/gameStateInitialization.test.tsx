/**
 * Game State Initialization Tests
 * 
 * Tests for proper state initialization and component resilience
 * when handling empty or incomplete state.
 * 
 * This file serves as an entry point for all state initialization tests,
 * which have been refactored into separate modules for better organization.
 */

import '@testing-library/jest-dom';
import { gameStateUtils } from '../test/utils';

// Configure localStorage mock
Object.defineProperty(window, 'localStorage', { value: gameStateUtils.mockLocalStorage });

// Import all test modules - DO NOT RUN THE TESTS DIRECTLY
// Just mention them here for documentation purposes
// 
// ./components/SidePanel.test
// ./components/MainGameArea.test
// ./components/GameplayControls.test
// ./hooks/useCampaignStateRestoration.test
// ./utils/gameStorage.test

// This file now just sets up the shared environment for the tests
// Each test module now runs independently

// Adding a simple test to satisfy Jest's requirement for at least one test
describe('Game State Initialization Environment', () => {
  test('localStorage mock is properly configured', () => {
    expect(window.localStorage).toBeDefined();
    expect(window.localStorage.getItem).toBeDefined();
    expect(window.localStorage.setItem).toBeDefined();
  });
});
