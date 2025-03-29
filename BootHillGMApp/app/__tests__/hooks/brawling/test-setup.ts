/**
 * Centralized mock setup for all brawling tests
 * 
 * This file configures all the required mocks for brawling tests, following Jest
 * best practices for module mocking. The mocks are exported as an object to provide
 * consistent access across all test files.
 * 
 * @module BrawlingTestSetup
 */

import { useBrawlingActions } from '../../../hooks/combat/useBrawlingActions';
import { resolveBrawlingRound } from '../../../utils/brawlingSystem';
import { checkKnockout } from '../../../utils/combatUtils';

// This creates proper jest mocks with full type safety
jest.mock('../../../hooks/combat/useBrawlingActions');
jest.mock('../../../utils/brawlingSystem');
jest.mock('../../../utils/combatUtils');
jest.mock('../../../utils/brawlingEngine', () => ({
  BrawlingEngine: {
    formatCombatMessage: jest.fn((attacker, result, isPunching) => {
      const action = isPunching ? 'punches' : 'grapples';
      return `${attacker} ${action} with ${result.result} (Roll: ${result.roll})`;
    })
  }
}));

// Export the mocked modules for easy access in tests
export const mocks = {
  useBrawlingActions: useBrawlingActions as jest.Mock,
  resolveBrawlingRound: resolveBrawlingRound as jest.Mock,
  checkKnockout: checkKnockout as jest.Mock
};

// Export a test to ensure this file is recognized as a test module
export const testSetup = () => {
  it('sets up test environment', () => {
    expect(true).toBe(true);
  });
};

// Run the test
testSetup();
