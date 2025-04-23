/**
 * Test Utilities Index
 * 
 * This file exports all test utilities from a central location.
 * Import from this file to get access to all test utilities.
 */

// Re-export test wrappers with namespaces to avoid collisions
import * as campaignWrappers from './campaignTestWrappers';
import * as testWrappers from './testWrappers';
export { campaignWrappers, testWrappers };

// Re-export game state utilities 
export { default as gameStateUtils } from './gameStateTestUtils.tsx';

// Re-export state test utilities
import * as stateTestUtils from './stateTestUtils';
export { stateTestUtils };

// Export local storage mock
export * from './localStorageMock';

// Export narrative provider mock
export * from './narrativeProviderMock';

// Export other test utilities
// These should be fine to export directly as they likely don't have conflicting names
export * from './characterTestUtils';
export * from './combatTestUtils';
export * from './inventoryTestUtils';
export * from './narrativeTestHelpers';
export * from './narrativeUtils';
export * from './userEventUtils';
