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
    const { result } = renderHook(() =>
      useBrawlingCombat({
        playerCharacter: mockPlayer,
        opponent: mockOpponent,
        onCombatEnd: mockOnCombatEnd,
        dispatch: mockDispatch
      })
    );

    await act(async () => {
      const processPromise = result.current.processRound(true, true);

      await Promise.resolve();

      jest.advanceTimersByTime(1000);

      await processPromise;

      await Promise.resolve();
    });

    expect(result.current.brawlingState.roundLog).toHaveLength(2);

    const [playerEntry, opponentEntry] = result.current.brawlingState.roundLog;
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
  }, 10000);
});
