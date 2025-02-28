import { Character } from '../../../types/character';
import { createMockCharacter } from '../../../test/utils/inventoryTestUtils';
jest.mock('../../../utils/brawlingSystem', () => ({
  resolveBrawlingRound: jest.fn()
}));
import * as brawlingSystem from '../../../utils/brawlingSystem';
import { BrawlingResult } from '../../../utils/brawlingSystem';

interface TestBrawlingResult extends BrawlingResult {
  _isBrawlingRoundsTest?: boolean;
  _isSequenceTest?: boolean;
}

interface TestEnvironment {
  mockDispatch: jest.Mock;
  mockOnCombatEnd: jest.Mock;
}

export const mockPlayer: Character = createMockCharacter({
  id: 'player-1',
  name: 'Player',
  isPlayer: true,
  isNPC: false,
  attributes: {
    strength: 10,
    baseStrength: 10,
    bravery: 0,
    experience: 0,
  },
  strengthHistory: { baseStrength: 10, changes: [] },
});

export const mockOpponent: Character = createMockCharacter({
  id: 'opponent-1',
  name: 'Opponent',
  isPlayer: false,
  isNPC: true,
  attributes: {
    strength: 8,
    baseStrength: 8,
    bravery: 0,
    experience: 0,
  },
  strengthHistory: { baseStrength: 8, changes: [] },
});

export const setupBrawlingTestEnvironment = (
  mockResolveBrawlingRound = true,
  customMockImplementation?: Partial<TestBrawlingResult>
): TestEnvironment => {
  const mockDispatch = jest.fn();
  const mockOnCombatEnd = jest.fn();

  // Clear all mocks first to ensure a clean state
  jest.clearAllMocks();
  jest.resetAllMocks();
  
  // Use fake timers for controlled testing
  jest.useFakeTimers();

  // Mock setTimeout to execute immediately in all cases
  // This is critical for avoiding test timeouts
  jest.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
    if (typeof cb === 'function') {
      cb();
    }
    // Return a number that can be used as a timeout ID
    return 1 as unknown as NodeJS.Timeout;
  });

  if (mockResolveBrawlingRound) {
    // If custom implementation is provided, use it
    if (customMockImplementation && Object.keys(customMockImplementation).length > 0) {
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
        roll: 20,
        result: 'Critical Hit',
        damage: 10,
        location: 'head',
        nextRoundModifier: 0,
        ...customMockImplementation,
      }));
    } else {
      // Default implementation for regular tests
      // Using damage: 1 for sequence tests to avoid knockouts
      const defaultResult: TestBrawlingResult = {
        roll: 10,
        result: 'Light Hit',
        damage: 1,
        location: 'chest',
        nextRoundModifier: 0,
      };

      // Add test-specific flags based on the test file name
      const stack = new Error().stack || '';
      if (stack.includes('brawlingRounds.test.ts')) {
        defaultResult._isBrawlingRoundsTest = true;
      } else if (stack.includes('brawlingSequence.test.ts')) {
        defaultResult._isSequenceTest = true;
      }

      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => defaultResult);
    }
  }

  return { mockDispatch, mockOnCombatEnd };
};

export const cleanupBrawlingTestEnvironment = () => {
  jest.useRealTimers();
  jest.restoreAllMocks();
}
