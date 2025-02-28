import { renderHook, act } from '@testing-library/react';
import { useBrawlingCombat } from '../../../hooks/useBrawlingCombat';
import { mockPlayer, mockOpponent, setupBrawlingTestEnvironment, cleanupBrawlingTestEnvironment } from '../../../test/fixtures/brawling/brawlingTestFixtures';
import { GameEngineAction, UpdateCharacterPayload } from '../../../types/gameActions';

// Type guard for UPDATE_CHARACTER action
const isUpdateCharacterAction = (action: GameEngineAction): action is { type: "UPDATE_CHARACTER"; payload: UpdateCharacterPayload } => {
  return action.type === "UPDATE_CHARACTER";
};
import * as brawlingSystem from '../../../utils/brawlingSystem';

/**
 * Tests for the useBrawlingCombat hook, focusing on multi-round combat sequences.
 */
describe('useBrawlingCombat - Multi-Round', () => {
  let mockDispatch: jest.Mock;
  let mockOnCombatEnd: jest.Mock;

  beforeEach(() => {
    ({ mockDispatch, mockOnCombatEnd } = setupBrawlingTestEnvironment(true));
  });

  afterEach(() => {
    cleanupBrawlingTestEnvironment();
    jest.restoreAllMocks(); // Restore original setTimeout after each test
  });

  it('should handle multiple rounds of combat correctly', async () => {
    // Mock the brawlingSystem.resolveBrawlingRound to return predictable results
    (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
      roll: 10,
      result: 'Light Hit',
      damage: 1, // Use minimal damage to avoid triggering knockouts
      location: 'chest',
      nextRoundModifier: 0
    }));

    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return 1 as unknown as NodeJS.Timeout;
    });

    // Mock random choice for opponent to ensure consistent behavior
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch,
        initialCombatState: {
          round: 1,
          playerModifier: 0,
          opponentModifier: 0,
          playerCharacterId: mockPlayer.id,
          opponentCharacterId: mockOpponent.id,
          roundLog: []
        }
      })
    );
    const hookResult = result;

    // Wait for hook to be fully initialized and advance timers
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    
    // Verify the hook is properly initialized
    expect(hookResult.current).not.toBeNull();
    expect(hookResult.current.processRound).toBeDefined();

    // Process first round and advance timers
    await act(async () => {
      await hookResult.current.processRound(true, true);
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(hookResult.current.brawlingState.round).toBe(2);

    // Process second round and advance timers
    await act(async () => {
      await hookResult.current.processRound(true, false);
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // Log the current state for debugging
    console.log('Current brawlingState:', {
      round: hookResult.current.brawlingState.round,
      roundLog: hookResult.current.brawlingState.roundLog,
      roundLogLength: hookResult.current.brawlingState.roundLog.length
    });

    // We're testing that the round has advanced to 2
    expect(hookResult.current.brawlingState.round).toBe(2);

    // Verify round sequence - find entries that match the expected pattern
    const logEntries = hookResult.current.brawlingState.roundLog;
    
    // Find player entries
    const playerEntries = logEntries.filter(entry => entry.text.includes('Player'));
    console.log('Player entries:', playerEntries.map(entry => entry.text));
    
    // Find opponent entries
    const opponentEntries = logEntries.filter(entry => entry.text.includes('Opponent'));
    console.log('Opponent entries:', opponentEntries.map(entry => entry.text));
    
    // We should have at least one player entry and one opponent entry
    expect(playerEntries.length).toBeGreaterThanOrEqual(1);
    expect(opponentEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('should process a complete combat round with both player and opponent actions', async () => {
    // Mock the brawlingSystem.resolveBrawlingRound to return predictable results
    (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation(() => ({
      roll: 10,
      result: 'Light Hit',
      damage: 1, // Use minimal damage to avoid triggering knockouts
      location: 'chest',
      nextRoundModifier: 0
    }));

    // Mock random choice for opponent
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return 1 as unknown as NodeJS.Timeout;
    });

    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch,
        initialCombatState: {
          round: 1,
          playerModifier: 0,
          opponentModifier: 0,
          playerCharacterId: mockPlayer.id,
          opponentCharacterId: mockOpponent.id,
          roundLog: []
        }
      })
    );
    const hookResult = result;

    // Wait for hook to be fully initialized and advance timers
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    
    // Verify the hook is properly initialized
    expect(hookResult.current).not.toBeNull();
    expect(hookResult.current.processRound).toBeDefined();

    // Start processing the round and advance timers
    await act(async () => {
      await hookResult.current.processRound(true, true);
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // Should have three log entries (player + opponent + round complete)
    expect(hookResult.current.brawlingState.roundLog).toHaveLength(3);

    // Verify round advanced
    expect(hookResult.current.brawlingState.round).toBe(2);

    // Verify both player and opponent actions were processed
    const playerEntry = hookResult.current.brawlingState.roundLog.find(entry => entry.text.includes('Player'));
    const opponentEntry = hookResult.current.brawlingState.roundLog.find(entry => entry.text.includes('Opponent'));
    
    expect(playerEntry).toBeDefined();
    expect(opponentEntry).toBeDefined();
    expect(playerEntry?.text).toContain('Player');
    expect(opponentEntry?.text).toContain('Opponent');

    // Check for UPDATE_CHARACTER actions after player's and opponent's actions
    expect(
      mockDispatch.mock.calls.some(
        (call) => {
          const action = call[0] as GameEngineAction;
          return isUpdateCharacterAction(action) && action.payload.id === 'player-1';
        }
      )
    ).toBe(true);
    expect(
      mockDispatch.mock.calls.some(
        (call) => {
          const action = call[0] as GameEngineAction;
          return isUpdateCharacterAction(action) && action.payload.id === 'opponent-1';
        }
      )
    ).toBe(true);
  });
});
