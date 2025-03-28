/**
 * Combat Testing Utilities
 * 
 * Provides utilities for testing combat-related components and hooks.
 */
import { mockPlayerCharacter, mockNPC } from '../fixtures';
import { GameEngineAction, UpdateCharacterPayload } from '../../types/gameActions';
import { BrawlingState } from '../../types/combat';

/**
 * Type guard for UPDATE_CHARACTER action with payload
 */
export const isUpdateCharacterAction = (action: GameEngineAction): action is { 
  type: "UPDATE_CHARACTER"; 
  payload: UpdateCharacterPayload 
} => {
  return action.type === "UPDATE_CHARACTER" && 'payload' in action;
};

/**
 * Create default initial state for brawling tests
 */
export const getDefaultBrawlingState = (): BrawlingState => ({
  round: 1 as const, // Using 'as const' rather than 'as 1'
  playerModifier: 0,
  opponentModifier: 0,
  playerCharacterId: mockPlayerCharacter.id,
  opponentCharacterId: mockNPC.id,
  roundLog: []
});

/**
 * Setup mocks for all brawling combat tests
 * Note: These are just mock registrations and should be used with jest.mock outside of functions
 */
export const getBrawlingMockSetups = () => ({
  mockActionHook: {
    module: '../../hooks/combat/useBrawlingActions',
    mock: () => ({
      ...jest.requireActual('../../hooks/combat/useBrawlingActions'),
      useBrawlingActions: jest.fn()
    })
  },
  mockBrawlingSystem: {
    module: '../../utils/brawlingSystem',
    mock: () => ({
      ...jest.requireActual('../../utils/brawlingSystem'),
      resolveBrawlingRound: jest.fn()
    })
  },
  mockBrawlingEngine: {
    module: '../../utils/brawlingEngine',
    mock: () => {
      const originalModule = jest.requireActual('../../utils/brawlingEngine');
      return {
        ...originalModule,
        BrawlingEngine: {
          ...originalModule.BrawlingEngine,
          formatCombatMessage: jest.fn().mockImplementation(
            (attacker, result, isPunching) => {
              const action = isPunching ? 'punches' : 'grapples';
              return `${attacker} ${action} with ${result.result} (Roll: ${result.roll})`;
            }
          )
        }
      };
    }
  },
  mockCombatUtils: {
    module: '../../utils/combatUtils',
    mock: () => ({
      ...jest.requireActual('../../utils/combatUtils'),
      checkKnockout: jest.fn()
    })
  }
});

/**
 * Standard brawling result shape - use this instead of making one from scratch
 */
export const createBrawlingResult = (options: Partial<{
  roll: number;
  result: string;
  damage: number;
  location: string;
  nextRoundModifier: number;
}> = {}) => ({
  roll: options.roll ?? 5,
  result: options.result ?? 'Hit',
  damage: options.damage ?? 2,
  location: options.location ?? 'torso',
  nextRoundModifier: options.nextRoundModifier ?? 0
});