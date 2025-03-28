import { renderHook, act } from '@testing-library/react';
import { useBrawlingCombat } from '../../../hooks/useBrawlingCombat';
import { mockPlayerCharacter, mockNPC } from '../../../test/fixtures';
import { GameEngineAction, UpdateCharacterPayload } from '../../../types/gameActions';
import * as brawlingSystem from '../../../utils/brawlingSystem';
import * as combatUtils from '../../../utils/combatUtils';
import * as useBrawlingActionsHook from '../../../hooks/combat/useBrawlingActions';
import { BrawlingState } from '../../../types/combat';

// Mock the useBrawlingActions hook
jest.mock('../../../hooks/combat/useBrawlingActions', () => ({
  ...jest.requireActual('../../../hooks/combat/useBrawlingActions'),
  useBrawlingActions: jest.fn()
}));

// Mock the brawlingSystem module
jest.mock('../../../utils/brawlingSystem', () => ({
  ...jest.requireActual('../../../utils/brawlingSystem'),
  resolveBrawlingRound: jest.fn()
}));

// Mock the BrawlingEngine class
jest.mock('../../../utils/brawlingEngine', () => {
  const originalModule = jest.requireActual('../../../utils/brawlingEngine');
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
});

// Mock checkKnockout
jest.mock('../../../utils/combatUtils', () => ({
  ...jest.requireActual('../../../utils/combatUtils'),
  checkKnockout: jest.fn()
}));

// Type guard for UPDATE_CHARACTER action with payload
const isUpdateCharacterAction = (action: GameEngineAction): action is { type: "UPDATE_CHARACTER"; payload: UpdateCharacterPayload } => {
  return action.type === "UPDATE_CHARACTER" && 'payload' in action;
};

// Get default initial state for tests
const getDefaultState = (): BrawlingState => ({
  round: 1 as const, // Using 'as const' instead of 'as 1'
  playerModifier: 0,
  opponentModifier: 0,
  playerCharacterId: mockPlayerCharacter.id,
  opponentCharacterId: mockNPC.id,
  roundLog: []
});

describe('useBrawlingCombat - Combat Flow', () => {
  let mockDispatch: jest.Mock;
  let mockOnCombatEnd: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockOnCombatEnd = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Combat Scenarios', () => {
    it('should process a round and handle modifiers correctly', async () => {
      // Set up mocks
      (useBrawlingActionsHook.useBrawlingActions as jest.Mock).mockImplementation((props) => ({
        ...jest.requireActual('../../../hooks/combat/useBrawlingActions').useBrawlingActions(props),
        handleCombatAction: jest.fn().mockResolvedValue(false)
      }));
      (combatUtils.checkKnockout as jest.Mock).mockReturnValue({ isKnockout: false });
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockReturnValue({
        roll: 15,
        result: 'Solid Hit',
        damage: 3,
        location: 'torso',
        nextRoundModifier: -2
      });

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: getDefaultState()
        })
      );

      await act(async () => {
        await result.current.processRound(true, true);
      });

      // Check round advancement
      expect(result.current.brawlingState.round).toBe(2);
      
      // Check modifiers are applied
      expect(result.current.brawlingState.playerModifier).toBe(-2);
      
      // Check log entries
      const logs = result.current.brawlingState.roundLog;
      expect(logs[0].type).toBe('hit');
      expect(logs[logs.length - 1].type).toBe('info');
      expect(logs[logs.length - 1].text).toContain('Round 1 complete');
    });

    it('should handle multiple rounds and accumulate damage', async () => {
      // Set up mocks
      (useBrawlingActionsHook.useBrawlingActions as jest.Mock).mockImplementation((props) => ({
        ...jest.requireActual('../../../hooks/combat/useBrawlingActions').useBrawlingActions(props),
        handleCombatAction: jest.fn().mockResolvedValue(false)
      }));
      (combatUtils.checkKnockout as jest.Mock).mockReturnValue({ isKnockout: false });
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockReturnValue({
        roll: 15,
        result: 'Solid Hit',
        damage: 2,
        location: 'torso',
        nextRoundModifier: 0
      });

      const updateCharacterCalls: UpdateCharacterPayload[] = [];
      mockDispatch.mockImplementation((action) => {
        if (isUpdateCharacterAction(action)) {
          updateCharacterCalls.push(action.payload);
        }
        return action;
      });

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: getDefaultState()
        })
      );

      // Process two rounds
      await act(async () => { await result.current.processRound(true, true); });
      await act(async () => { await result.current.processRound(true, true); });

      expect(result.current.brawlingState.round).toBe(2);
      expect(result.current.brawlingState.roundLog.length).toBeGreaterThan(4);
      
      // Check damage accumulation
      const totalDamage = updateCharacterCalls.reduce((sum, call) => 
        sum + (call.damageInflicted || 0), 0
      );
      expect(totalDamage).toBeGreaterThan(2);
    });
  });

  describe('Knockout and State Management', () => {
    it('should handle knockout scenarios', async () => {
      // Set up for direct knockout
      (useBrawlingActionsHook.useBrawlingActions as jest.Mock).mockImplementation((props) => ({
        ...jest.requireActual('../../../hooks/combat/useBrawlingActions').useBrawlingActions(props),
        handleCombatAction: jest.fn().mockResolvedValue(true)
      }));
      (combatUtils.checkKnockout as jest.Mock).mockReturnValue({
        isKnockout: true,
        winner: 'player',
        summary: 'Player knocked out opponent with a punch to the head!'
      });
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockReturnValue({
        roll: 5,
        result: 'Critical Hit',
        damage: 6,
        location: 'head',
        nextRoundModifier: 0
      });

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: getDefaultState()
        })
      );

      await act(async () => {
        await result.current.processRound(true, true);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(mockOnCombatEnd).toHaveBeenCalledWith(
        'player',
        expect.stringContaining('knocked out')
      );
    });

    it('should track character state changes', async () => {
      // Set up mocks
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockReturnValue({
        roll: 15,
        result: 'Solid Hit',
        damage: 3,
        location: 'rightArm',
        nextRoundModifier: 0
      });

      const updateCharacterCalls: UpdateCharacterPayload[] = [];
      mockDispatch.mockImplementation((action) => {
        if (isUpdateCharacterAction(action)) {
          updateCharacterCalls.push(action.payload);
        }
        return action;
      });

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: getDefaultState()
        })
      );

      await act(async () => { await result.current.processRound(true, true); });

      // Check strength changes
      const strengthUpdates = updateCharacterCalls.filter(call => 
        call.strengthHistory && call.strengthHistory.changes.length > 0
      );
      expect(strengthUpdates.length).toBeGreaterThan(0);
      expect(strengthUpdates[0].strengthHistory?.changes[0]).toHaveProperty('reason', 'damage');

      // Check wound application
      const updateCalls = mockDispatch.mock.calls.filter(
        call => isUpdateCharacterAction(call[0])
      );
      const woundUpdates = updateCalls.find(
        call => call[0].payload.wounds && call[0].payload.wounds.length > 0
      );
      
      expect(woundUpdates).toBeDefined();
      expect(woundUpdates[0].payload.wounds[0]).toHaveProperty('location', 'rightArm');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Mock handleCombatAction to return rejected promise
      const mockHandleCombatAction = jest.fn().mockImplementation(() => 
        Promise.reject(new Error('Invalid combat state'))
      );
      
      (useBrawlingActionsHook.useBrawlingActions as jest.Mock).mockImplementation((props) => ({
        ...jest.requireActual('../../../hooks/combat/useBrawlingActions').useBrawlingActions(props),
        handleCombatAction: mockHandleCombatAction,
        processRound: jest.fn().mockRejectedValue(new Error('Invalid combat state'))
      }));

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: getDefaultState()
        })
      );

      // Should reject with error when state is invalid
      await act(async () => {
        await expect(result.current.processRound(true, true)).rejects.toThrow('Invalid combat state');
      });
    });
  });
});