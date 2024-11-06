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
    strength: 0,
    baseStrength: 10,
    bravery: 0,
    experience: 0,
    wounds: []
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
    strength: 0,
    baseStrength: 8,
    bravery: 0,
    experience: 0,
    wounds: []
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
    // Mock resolveBrawlingRound to return a hit that deals damage
    (brawlingSystem.resolveBrawlingRound as jest.Mock).mockReturnValue({
      roll: 4,
      result: 'Solid Hit',
      damage: 2,
      location: 'chest',
      nextRoundModifier: 0
    });
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
      await result.current.processRound(true, true); // isPunching: true, isPlayer: true
    });

    expect(result.current.brawlingState.roundLog).toHaveLength(1);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_OPPONENT',
      payload: expect.objectContaining({
        wounds: expect.arrayContaining([
          expect.objectContaining({
            location: 'chest',
            severity: 'light',
            strengthReduction: 2
          })
        ])
      })
    });
  });

  // Add more tests for different combat scenarios and edge cases
});
