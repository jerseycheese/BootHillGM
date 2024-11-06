import { renderHook, act } from '@testing-library/react';
import { useBrawlingCombat } from '../../hooks/useBrawlingCombat';
import { Character } from '../../types/character';
import * as brawlingSystem from '../../utils/brawlingSystem';

// Mock the brawlingSystem module
jest.mock('../../utils/brawlingSystem', () => ({
  ...jest.requireActual('../../utils/brawlingSystem'),
  resolveBrawlingRound: jest.fn()
}));

const mockPlayer: Character = {
  name: 'Player',
  attributes: {
    speed: 0,
    gunAccuracy: 0,
    throwingAccuracy: 0,
    strength: 10,  // Added proper strength value
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
    strength: 8,  // Added proper strength value
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
    // Mock resolveBrawlingRound to return a light hit that won't cause knockout
    (brawlingSystem.resolveBrawlingRound as jest.Mock).mockReturnValue({
      roll: 4,
      result: 'Light Hit',
      damage: 1,  // Reduced damage to prevent knockout
      location: 'chest',
      nextRoundModifier: 0
    });
  });

  afterEach(() => {
    jest.useRealTimers();
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

    // Process player's action
    await act(async () => {
      // Start the combat round
      const processPromise = result.current.processRound(true, true);
      
      // Let React process state updates
      await Promise.resolve();
      
      // Advance timer to trigger opponent's response
      jest.advanceTimersByTime(1000);
      
      // Wait for the processRound to complete
      await processPromise;
      
      // Let React process any final state updates
      await Promise.resolve();
    });

    // Verify both player's action and opponent's response are logged
    expect(result.current.brawlingState.roundLog).toHaveLength(2);
    
    // Verify the log entries
    const [playerEntry, opponentEntry] = result.current.brawlingState.roundLog;
    expect(playerEntry.text).toContain('Player punches with Light Hit');
    expect(opponentEntry.text).toContain('Opponent');
    
    // Verify wound application
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
  }, 10000); // Increase timeout to 10 seconds

  // Add more tests for different combat scenarios and edge cases
});
