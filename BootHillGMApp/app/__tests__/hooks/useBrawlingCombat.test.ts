import { renderHook, act } from '@testing-library/react';
import { useBrawlingCombat } from '../../hooks/useBrawlingCombat';
import { Character } from '../../types/character';

// Helper to advance timers and flush promises
const advanceTimersByTime = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  await Promise.resolve(); // Flush promises
};

jest.mock('../../utils/brawlingSystem', () => ({
  ...jest.requireActual('../../utils/brawlingSystem'),
  resolveBrawlingRound: jest.fn().mockReturnValue({
    roll: 4,
    result: 'Light Hit',
    damage: 1,
    location: 'chest',
    nextRoundModifier: 0
  })
}));

const mockPlayer: Character = {
  name: 'Player',
  attributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 10,
    baseStrength: 10,
    bravery: 0,
    experience: 0
  },
  skills: {
    shooting: 0,
    riding: 0,
    brawling: 0
  },
  wounds: [],
  isUnconscious: false
};

const mockOpponent: Character = {
  name: 'Opponent',
  attributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 8,
    baseStrength: 8,
    bravery: 0,
    experience: 0
  },
  skills: {
    shooting: 0,
    riding: 0,
    brawling: 0
  },
  wounds: [],
  isUnconscious: false
};

const mockDispatch = jest.fn();
const mockOnCombatEnd = jest.fn();

describe('useBrawlingCombat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );

    expect(result.current.brawlingState).toEqual({
      round: 1,
      playerModifier: 0,
      opponentModifier: 0,
      roundLog: []
    });
    expect(result.current.isProcessing).toBe(false);
  });

  it('processes a round of combat', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    let hookResult: any;
    
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );
    hookResult = result;
    
    // Wait for hook to initialize
    await Promise.resolve();
    
    expect(hookResult.current).not.toBeNull();
    
    // Start processing the round
    const processPromise = hookResult.current.processRound(true, true);
    
    // Advance timers and resolve promises
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await processPromise;
    });

    expect(hookResult.current.brawlingState.roundLog).toHaveLength(2);

    const [playerEntry, opponentEntry] = hookResult.current.brawlingState.roundLog;
    expect(playerEntry.text).toContain('Player punches with Light Hit');
    expect(opponentEntry.text).toContain('Opponent');

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_OPPONENT',
      payload: expect.objectContaining({
        wounds: expect.arrayContaining([
          expect.objectContaining({
            location: 'chest',
            severity: 'light',
            strengthReduction: 1
          })
        ])
      })
    });
    
    // Clean up
    jest.useRealTimers();
  });

  test('processes complete combat round with player and opponent actions', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    // Mock random choice for opponent
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    let hookResult: any;
    
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );
    hookResult = result;
    
    // Wait for hook to initialize
    await Promise.resolve();
    
    expect(hookResult.current).not.toBeNull();
    
    // Start processing the round
    const processPromise = hookResult.current.processRound(true, true);
    
    // Advance timers and resolve promises
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await processPromise;
    });

    // Should have two log entries (player + opponent actions)
    expect(hookResult.current.brawlingState.roundLog).toHaveLength(2);
    
    // Verify round advanced
    expect(hookResult.current.brawlingState.round).toBe(2);

    // Verify both player and opponent actions were processed
    const [playerEntry, opponentEntry] = hookResult.current.brawlingState.roundLog;
    expect(playerEntry.text).toContain('Player');
    expect(opponentEntry.text).toContain('Opponent');

    // Verify dispatch was called twice (once for each character update)
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    
    // Clean up
    jest.useRealTimers();
  });

  test('ends combat when knockout occurs', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    // Mock a powerful hit that causes knockout
    jest.spyOn(require('../../utils/brawlingSystem'), 'resolveBrawlingRound')
      .mockReturnValueOnce({
        roll: 20,
        result: 'Critical Hit',
        damage: 10, // High damage to trigger knockout
        location: 'head',
        nextRoundModifier: 0
      });

    let hookResult: any;
    
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );
    hookResult = result;
    
    // Wait for hook to initialize
    await Promise.resolve();
    
    expect(hookResult.current).not.toBeNull();
    
    // Start processing the round
    const processPromise = hookResult.current.processRound(true, true);
    
    // Advance timers and resolve promises
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await processPromise;
    });

    // Verify combat ended
    expect(mockOnCombatEnd).toHaveBeenCalledWith(
      'player',
      expect.stringContaining('emerges victorious')
    );

    // Verify only one action was processed (combat ended before opponent's turn)
    expect(hookResult.current.brawlingState.roundLog).toHaveLength(1);
    
    // Clean up
    jest.useRealTimers();
  });

  test('handles multiple rounds of combat', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    let hookResult: any;
    
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );
    hookResult = result;
    
    // Wait for hook to initialize
    await Promise.resolve();
    
    expect(hookResult.current).not.toBeNull();
    
    // Process first round
    const firstRoundPromise = hookResult.current.processRound(true, true);
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await firstRoundPromise;
    });

    expect(hookResult.current.brawlingState.round).toBe(2);

    // Process second round
    const secondRoundPromise = hookResult.current.processRound(true, false);
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await secondRoundPromise;
    });

    // Should have 4 log entries total (2 per round)
    expect(hookResult.current.brawlingState.roundLog).toHaveLength(4);

    // Verify round sequence
    const logEntries = hookResult.current.brawlingState.roundLog;
    expect(logEntries[0].text).toContain('Player');
    expect(logEntries[1].text).toContain('Opponent');
    expect(logEntries[2].text).toContain('Player');
    expect(logEntries[3].text).toContain('Opponent');
    
    // Clean up
    jest.useRealTimers();
  });

  test('respects processing state during combat', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    let hookResult: any;
    
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );
    hookResult = result;
    
    // Wait for hook to initialize
    await Promise.resolve();
    
    expect(hookResult.current).not.toBeNull();
    
    // Start processing the round
    const processPromise = hookResult.current.processRound(true, true);
    
    // Verify processing state is true during combat
    expect(hookResult.current.isProcessing).toBe(true);
    
    // Advance timers and complete processing
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await processPromise;
    });

    // Verify processing state is false after combat
    expect(hookResult.current.isProcessing).toBe(false);
    
    // Clean up
    jest.useRealTimers();
  });
});
