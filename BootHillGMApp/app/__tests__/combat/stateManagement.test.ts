import { renderHook } from '@testing-library/react';
import { useBrawlingCombat } from '../../hooks/useBrawlingCombat';
import { useWeaponCombat } from '../../hooks/useWeaponCombat';
import { Character } from '../../types/character';
import { ensureCombatState } from '../../types/combat'; // Import ensureCombatState

// Mock character data for testing
const mockPlayerCharacter: Character = {
  id: 'player-1',
  name: 'Test Player',
  isNPC: false,
  isPlayer: true,
  attributes: {
    strength: 10,
    baseStrength: 10,
    speed: 5,
    bravery: 5,
    gunAccuracy: 5,
    throwingAccuracy: 5,
    experience: 0
  },
  inventory: [],
  wounds: [],
  isUnconscious: false,
};

const mockOpponentCharacter: Character = {
  id: 'opponent-1',
  name: 'Test Opponent',
  isNPC: true,
  isPlayer: false,
  attributes: {
    strength: 8,
    baseStrength: 8,
    speed: 4,
    bravery: 4,
    gunAccuracy: 4,
    throwingAccuracy: 4,
    experience: 0
  },
  inventory: [],
  wounds: [],
  isUnconscious: false,
};

const mockOnCombatEnd = jest.fn();
const mockDispatch = jest.fn();

describe('Combat State Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize brawling combat state with character references', () => {
    const { result } = renderHook(() => useBrawlingCombat({
      playerCharacter: mockPlayerCharacter,
      opponent: mockOpponentCharacter,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
    }));

    const initialState = result.current.brawlingState;
    expect(initialState.playerCharacterId).toBe(mockPlayerCharacter.id);
    expect(initialState.opponentCharacterId).toBe(mockOpponentCharacter.id);
  });

  it('should initialize weapon combat state with character references', () => {
    const { result } = renderHook(() => useWeaponCombat({
      playerCharacter: mockPlayerCharacter,
      opponent: mockOpponentCharacter,
      onCombatEnd: mockOnCombatEnd,
      dispatch: mockDispatch,
      combatState: ensureCombatState({}) // Pass empty object to ensureCombatState
    }));

    const initialState = result.current.weaponState;
    expect(initialState.playerCharacterId).toBe(mockPlayerCharacter.id);
    expect(initialState.opponentCharacterId).toBe(mockOpponentCharacter.id);
  });
  // Add more test cases to cover state updates and combat logic
});