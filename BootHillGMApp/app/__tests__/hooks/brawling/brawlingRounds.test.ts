import { renderHook, act } from '@testing-library/react';
import { useBrawlingCombat } from '../../../hooks/useBrawlingCombat';
import { mockPlayerCharacter, mockNPC } from '../../../test/fixtures';
import { GameEngineAction, UpdateCharacterPayload } from '../../../types/gameActions';
import * as brawlingSystem from '../../../utils/brawlingSystem';
import * as combatUtils from '../../../utils/combatUtils';
import * as useBrawlingActionsHook from '../../../hooks/combat/useBrawlingActions';

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

// Mock checkKnockout
jest.mock('../../../utils/combatUtils', () => ({
  ...jest.requireActual('../../../utils/combatUtils'),
  checkKnockout: jest.fn()
}));

// Type guard for UPDATE_CHARACTER action with payload
const isUpdateCharacterAction = (action: GameEngineAction): action is { type: "UPDATE_CHARACTER"; payload: UpdateCharacterPayload } => {
  return action.type === "UPDATE_CHARACTER" && 'payload' in action;
};

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

  describe('Single Round Combat', () => {
    it('should process a complete round with player and opponent actions', async () => {
      // Mock handleCombatAction to return false (no knockout)
      (useBrawlingActionsHook.useBrawlingActions as jest.Mock).mockImplementation((props) => ({
        ...jest.requireActual('../../../hooks/combat/useBrawlingActions').useBrawlingActions(props),
        handleCombatAction: jest.fn().mockResolvedValue(false)
      }));

      // Mock checkKnockout to return false
      (combatUtils.checkKnockout as jest.Mock).mockReturnValue({ isKnockout: false });

      // Mock resolveBrawlingRound for a light hit
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
        roll: 3,
        result: 'Glancing Blow',
        damage: 1,
        location: 'leftArm',
        nextRoundModifier: 0
      }));

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      await act(async () => {
        await result.current.processRound(true, true);
      });

      expect(result.current.brawlingState.round).toBe(2);
      expect(result.current.brawlingState.roundLog).toHaveLength(3);
      expect(mockOnCombatEnd).not.toHaveBeenCalled();
    });

    it('should handle combat modifiers correctly after hits', async () => {
      // Mock resolveBrawlingRound with nextRoundModifier
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
        roll: 15,
        result: 'Solid Hit',
        damage: 3,
        location: 'torso',
        nextRoundModifier: -2
      }));

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      await act(async () => {
        await result.current.processRound(true, true);
      });

      expect(result.current.brawlingState.playerModifier).toBe(-2);
    });

    it('should maintain proper combat log sequence', async () => {
      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      await act(async () => {
        await result.current.processRound(true, true);
      });

      const logs = result.current.brawlingState.roundLog;
      expect(logs[0].type).toBe('hit');
      expect(logs[logs.length - 1].type).toBe('info');
      expect(logs[logs.length - 1].text).toContain('Round 1 complete');
    });
  });

  describe('Multiple Round Combat', () => {
    it('should progress through multiple rounds correctly', async () => {
      // Mock handleCombatAction to always return false (no knockout)
      (useBrawlingActionsHook.useBrawlingActions as jest.Mock).mockImplementation((props) => ({
        ...jest.requireActual('../../../hooks/combat/useBrawlingActions').useBrawlingActions(props),
        handleCombatAction: jest.fn().mockResolvedValue(false)
      }));

      // Mock checkKnockout to return false
      (combatUtils.checkKnockout as jest.Mock).mockReturnValue({ isKnockout: false });

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      // Process first round
      await act(async () => {
        await result.current.processRound(true, true);
      });
      expect(result.current.brawlingState.round).toBe(2);

      // Process second round
      await act(async () => {
        await result.current.processRound(true, false);
      });
      expect(result.current.brawlingState.round).toBe(2);
      expect(result.current.brawlingState.roundLog.length).toBeGreaterThan(4);
    });

    it('should accumulate damage across rounds', async () => {
      // Mock consistent damage
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
        roll: 15,
        result: 'Solid Hit',
        damage: 2,
        location: 'torso',
        nextRoundModifier: 0
      }));

      const updateCharacterCalls: UpdateCharacterPayload[] = [];
      mockDispatch.mockImplementation((action: GameEngineAction) => {
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
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      // Process two rounds
      await act(async () => {
        await result.current.processRound(true, true);
      });
      await act(async () => {
        await result.current.processRound(true, true);
      });

      const totalDamage = updateCharacterCalls.reduce((sum, call) => 
        sum + (call.damageInflicted || 0), 0
      );
      expect(totalDamage).toBeGreaterThan(2);
    });
  });

  describe('Knockout Scenarios', () => {
    it('should handle player knockout punch to head', async () => {
      // Mock handleCombatAction to return true (knockout)
      (useBrawlingActionsHook.useBrawlingActions as jest.Mock).mockImplementation((props) => ({
        ...jest.requireActual('../../../hooks/combat/useBrawlingActions').useBrawlingActions(props),
        handleCombatAction: jest.fn().mockResolvedValue(true)
      }));

      // Mock knockout for head punch
      (combatUtils.checkKnockout as jest.Mock).mockReturnValue({
        isKnockout: true,
        winner: 'player',
        summary: 'Player knocked out opponent with a punch to the head!'
      });

      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
        roll: 5,
        result: 'Critical Hit',
        damage: 6,
        location: 'head',
        nextRoundModifier: 0
      }));

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      await act(async () => {
        await result.current.processRound(true, true);
        // Add small delay to allow for combat end callback
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(mockOnCombatEnd).toHaveBeenCalledWith(
        'player',
        expect.stringContaining('knocked out')
      );
    });

    it('should process knockout from cumulative damage', async () => {
      let damageCount = 0;
      (combatUtils.checkKnockout as jest.Mock).mockImplementation(() => {
        damageCount++;
        return {
          isKnockout: damageCount >= 2,
          winner: damageCount >= 2 ? 'player' : undefined,
          summary: damageCount >= 2 ? 'Opponent collapsed from accumulated damage!' : undefined
        };
      });

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      // Process two rounds
      await act(async () => {
        await result.current.processRound(true, true);
      });
      await act(async () => {
        await result.current.processRound(true, true);
      });

      expect(mockOnCombatEnd).toHaveBeenCalledWith(
        'player',
        expect.stringContaining('collapsed')
      );
    });
  });

  describe('State Management', () => {
    it('should properly track strength changes', async () => {
      const updateCharacterCalls: UpdateCharacterPayload[] = [];
      mockDispatch.mockImplementation((action: GameEngineAction) => {
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
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      await act(async () => {
        await result.current.processRound(true, true);
      });

      const strengthUpdates = updateCharacterCalls.filter(call => 
        call.strengthHistory && call.strengthHistory.changes.length > 0
      );
      expect(strengthUpdates.length).toBeGreaterThan(0);
      expect(strengthUpdates[0].strengthHistory?.changes[0]).toHaveProperty('reason', 'damage');
    });

    it('should manage wound application correctly', async () => {
      (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
        roll: 15,
        result: 'Solid Hit',
        damage: 3,
        location: 'rightArm',
        nextRoundModifier: 0
      }));

      const { result } = renderHook(() =>
        useBrawlingCombat({
          playerCharacter: mockPlayerCharacter,
          opponent: mockNPC,
          onCombatEnd: mockOnCombatEnd,
          dispatch: mockDispatch,
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      await act(async () => {
        await result.current.processRound(true, true);
      });

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
    it('should handle invalid state gracefully', async () => {
      // Mock handleCombatAction to return rejected promise
      const mockHandleCombatAction = jest.fn().mockImplementation(() => Promise.reject(new Error('Invalid combat state')));
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
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      // Should reject with error when state is invalid
      await act(async () => {
        await expect(result.current.processRound(true, true)).rejects.toThrow('Invalid combat state');
      });
    });

    it('should handle state validation errors', async () => {
      // Mock handleCombatAction to return rejected promise
      const mockHandleCombatAction = jest.fn().mockImplementation(() => Promise.reject(new Error('Invalid combat state')));
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
          initialCombatState: {
            round: 1,
            playerModifier: 0,
            opponentModifier: 0,
            playerCharacterId: mockPlayerCharacter.id,
            opponentCharacterId: mockNPC.id,
            roundLog: []
          }
        })
      );

      // Should reject with error when validation fails
      await act(async () => {
        await expect(result.current.processRound(true, true)).rejects.toThrow('Invalid combat state');
      });
    });
  });
});
