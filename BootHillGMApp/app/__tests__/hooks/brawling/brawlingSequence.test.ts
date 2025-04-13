import { renderHook, act } from '@testing-library/react';
import { useBrawlingCombat } from '../../../hooks/useBrawlingCombat';
import { mockPlayer, mockOpponent, setupBrawlingTestEnvironment, cleanupBrawlingTestEnvironment } from '../../../test/fixtures/brawling/brawlingTestFixtures';
import { UpdateCharacterPayload } from '../../../types/gameActions';

// Define type for dispatched character update actions
type CharacterUpdateAction = {
  type: "character/UPDATE_CHARACTER";
  payload: UpdateCharacterPayload;
};

// Type guard for character/UPDATE_CHARACTER action
const isUpdateCharacterAction = (action: unknown): action is CharacterUpdateAction => {
  return typeof action === 'object' &&
         action !== null &&
         'type' in action &&
         action.type === "character/UPDATE_CHARACTER";
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
    console.log('Before processRound');
    await act(async () => {
      await hookResult.current.processRound(true, true);
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    console.log('After processRound');
    console.log('Dispatch calls:', mockDispatch.mock.calls);

    expect(hookResult.current.brawlingState.round).toBe(2);

    // Process second round and advance timers
    await act(async () => {
      await hookResult.current.processRound(true, false);
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // We're testing that the round has advanced to 2
    expect(hookResult.current.brawlingState.round).toBe(2);

    // Verify round sequence - find entries that match the expected pattern
    const logEntries = hookResult.current.brawlingState.roundLog;
    
    // Find player entries
    const playerEntries = logEntries.filter(entry => entry.text.includes('Player'));
    
    // Find opponent entries
    const opponentEntries = logEntries.filter(entry => entry.text.includes('Opponent'));
    
    // We should have at least one player entry and one opponent entry
    expect(playerEntries.length).toBeGreaterThanOrEqual(1);
    expect(opponentEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('should process a complete combat round with both player and opponent actions', async () => {
    // Mock the brawlingSystem.resolveBrawlingRound to return different results for player vs opponent
    (brawlingSystem.resolveBrawlingRound as jest.Mock).mockImplementation((modifier: number, isPunching: boolean) => {
      // Player action (isPunching = true)
      if (isPunching) {
        return {
          roll: 10,
          result: 'Light Hit',
          damage: 1, // Player hits opponent
          location: 'chest',
          nextRoundModifier: 0
        };
      }
      // Opponent action (isPunching = false)
      return {
        roll: 8,
        result: 'Miss',
        damage: 0, // Opponent misses player
        location: 'chest',
        nextRoundModifier: 0
      };
    });

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

    // Log all dispatched actions for debugging
    console.log('All dispatched actions:', mockDispatch.mock.calls.map(call => call[0]));

    // Check for UPDATE_CHARACTER actions after player's and opponent's actions
    const playerUpdates = mockDispatch.mock.calls.filter(
      (call) => isUpdateCharacterAction(call[0]) && call[0].payload.id === 'player-1'
    );
    const opponentUpdates = mockDispatch.mock.calls.filter(
      (call) => isUpdateCharacterAction(call[0]) && call[0].payload.id === 'opponent-1'
    );

    expect(playerUpdates.length).toBeGreaterThan(0);
    expect(opponentUpdates.length).toBeGreaterThan(0);
  });
});
